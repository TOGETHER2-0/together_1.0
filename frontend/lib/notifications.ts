import { create } from 'zustand';
import { eventsApi } from './api';
import { useAuthStore } from './store';

// ─── Types ────────────────────────────────────────────────────

export type NotificationType =
  | 'join_request'       // someone asked to join your event
  | 'request_accepted'   // your join request was approved
  | 'request_rejected'   // your join request was rejected
  | 'starting_soon';     // event you're joining starts within 2h

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  eventId: number;
  read: boolean;
  createdAt: number;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  pendingCount: number; // backward compat: pending join requests to approve (as host)
  lastChecked: number;
  addNotification: (n: AppNotification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setPendingCount: (n: number) => void;
}

// ─── Persisted read-state ─────────────────────────────────────
// Notifications are re-derived from event/request data on every poll, and the
// store is in-memory only. Without persisting which ids were read, a still-true
// source (e.g. a pending join request) re-creates the SAME notification as
// unread on every reload — the "eternal notification". We persist read ids in
// localStorage so a read/seen notification never comes back as unread.

const READ_KEY = 'together-notif-read';

function loadReadIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(READ_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function persistReadIds(ids: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    // Keep the most recent ids only, so the set stays bounded.
    localStorage.setItem(READ_KEY, JSON.stringify(Array.from(ids).slice(-300)));
  } catch {
    /* storage full / unavailable — ignore */
  }
}

const readIds = loadReadIds();

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  pendingCount: 0,
  lastChecked: 0,

  addNotification: (n) => set(s => {
    // Deduplicate by id
    if (s.notifications.find(x => x.id === n.id)) return s;
    // A notification already read in a previous session must stay read.
    const read = n.read || readIds.has(n.id);
    const notifications = [{ ...n, read }, ...s.notifications].slice(0, 50);
    return {
      notifications,
      unreadCount: notifications.filter(x => !x.read).length,
    };
  }),

  markRead: (id) => set(s => {
    readIds.add(id);
    persistReadIds(readIds);
    const notifications = s.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    return { notifications, unreadCount: notifications.filter(x => !x.read).length };
  }),

  markAllRead: () => set(s => {
    s.notifications.forEach(n => readIds.add(n.id));
    persistReadIds(readIds);
    return {
      notifications: s.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    };
  }),

  setPendingCount: (n) => set({ pendingCount: n, lastChecked: Date.now() }),
}));

// ─── Seen-state tracking ──────────────────────────────────────
// Prevents duplicate notifications across polls

const seenJoinRequests = new Set<string>();   // `${eventId}-${requestId}`
const seenStatusChanges = new Set<string>();  // `${eventId}-${requestId}-${status}`
const seenStartingSoon = new Set<number>();   // eventId

// ─── Poll logic ───────────────────────────────────────────────

export async function fetchNotifications() {
  try {
    const userId = useAuthStore.getState().user?.id;
    const data = await eventsApi.list();
    const events = Array.isArray(data) ? data : [];

    const { addNotification, setPendingCount } = useNotificationStore.getState();
    const now = Date.now();

    let pendingCount = 0;

    for (const event of events) {
      const requests = event.join_requests ?? [];
      const isHost = event.host?.id === userId;

      if (isHost) {
        // ── Join requests received (as host) ─────────────────
        for (const req of requests) {
          if (req.status === 'pending') {
            pendingCount++;
            const key = `${event.id}-${req.id}`;
            if (!seenJoinRequests.has(key)) {
              seenJoinRequests.add(key);
              addNotification({
                id: `join-${event.id}-${req.id}`,
                type: 'join_request',
                title: 'New join request',
                body: `${req.user?.full_name || 'Someone'} wants to join "${event.title}"`,
                eventId: event.id,
                read: false,
                createdAt: now,
              });
            }
          }
        }
      } else {
        // ── Status changes for my own requests (as participant) ─
        const myReq = requests.find((r: any) => r.user?.id === userId);
        if (myReq) {
          const key = `${event.id}-${myReq.id}-${myReq.status}`;
          if (!seenStatusChanges.has(key) && myReq.status !== 'pending') {
            seenStatusChanges.add(key);
            if (myReq.status === 'approved') {
              addNotification({
                id: `accepted-${event.id}-${myReq.id}`,
                type: 'request_accepted',
                title: 'Request accepted',
                body: `You've been approved for "${event.title}"`,
                eventId: event.id,
                read: false,
                createdAt: now,
              });
            } else if (myReq.status === 'rejected') {
              addNotification({
                id: `rejected-${event.id}-${myReq.id}`,
                type: 'request_rejected',
                title: 'Request declined',
                body: `Your request for "${event.title}" was not accepted`,
                eventId: event.id,
                read: false,
                createdAt: now,
              });
            }
          }

          // ── Starting soon (events I'm joining) ─────────────
          if (myReq.status === 'approved' && !seenStartingSoon.has(event.id)) {
            const eventTime = new Date(event.event_datetime).getTime();
            const hoursUntil = (eventTime - now) / 1000 / 3600;
            if (hoursUntil > 0 && hoursUntil <= 2) {
              seenStartingSoon.add(event.id);
              const mins = Math.round(hoursUntil * 60);
              addNotification({
                id: `soon-${event.id}`,
                type: 'starting_soon',
                title: 'Starting soon',
                body: `"${event.title}" starts in ${mins} minutes`,
                eventId: event.id,
                read: false,
                createdAt: now,
              });
            }
          }
        }
      }
    }

    setPendingCount(pendingCount);
  } catch {
    // silent — avoid auth error noise during polling
  }
}

// ─── Polling lifecycle ────────────────────────────────────────

let pollInterval: ReturnType<typeof setInterval> | null = null;

export function startNotificationPolling() {
  fetchNotifications();
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(fetchNotifications, 30_000);
}

export function stopNotificationPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

// Legacy export — kept for backward compatibility
export { fetchNotifications as fetchPendingCount };
