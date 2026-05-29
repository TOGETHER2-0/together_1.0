// ─── Notification polling ─────────────────────────────────────
// Polls /api/users/me/events every 30s and counts pending requests
// on events hosted by the current user.

import { create } from 'zustand';
import { eventsApi } from './api';

interface NotificationState {
  pendingCount: number;
  lastChecked: number;
  setPendingCount: (n: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  pendingCount: 0,
  lastChecked: 0,
  setPendingCount: (n) => set({ pendingCount: n, lastChecked: Date.now() }),
}));

let pollInterval: ReturnType<typeof setInterval> | null = null;

export async function fetchPendingCount() {
  try {
    const data = await eventsApi.list();
    const arr = Array.isArray(data) ? data : [];
    // Count pending join requests on events I host
    // We don't know user id here so we rely on join_requests with status pending
    // The actual filtering by host is done server-side via /me/events
    const pending = arr.reduce((acc: number, event: any) => {
      const pendingOnEvent = (event.join_requests ?? []).filter(
        (r: any) => r.status === 'pending'
      ).length;
      return acc + pendingOnEvent;
    }, 0);
    useNotificationStore.getState().setPendingCount(pending);
  } catch {
    // silent
  }
}

export function startNotificationPolling() {
  fetchPendingCount();
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(fetchPendingCount, 30_000);
}

export function stopNotificationPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}
