"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { eventsApi } from "@/lib/api";
import { Event, JoinRequest } from "@/lib/types";
import { useAuthStore } from "@/lib/store";
import AppLayout from "@/components/layout/AppLayout";
import { EventChatDrawer } from "@/components/chat/EventChatDrawer";
import { format } from "date-fns";
import { ArrowLeft, MapPin, Users, Clock, Check, X, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';      



export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const searchParams = useSearchParams();
  const [chatOpen, setChatOpen] = useState(searchParams.get('chat') === '1');

  const fetchEvent = async () => {
    try {
      const res: any = await eventsApi.get(Number(id));
      setEvent(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvent(); }, [id]);

  const handleJoin = async () => {
    if (!event) return;
    setActionLoading(true);
    try {
      await eventsApi.requestJoin(event.id);
      fetchEvent();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to send request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequest = async (requestId: number, action: "approve" | "reject") => {
    if (!event) return;
    setActionLoading(true);
    try {
      await eventsApi.handleRequest(event.id, requestId, action);
      fetchEvent();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !confirm("Delete this event?")) return;
    await eventsApi.delete(event.id);
    router.replace("/events");
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="px-4 pt-14">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-zinc-100 rounded-full w-1/2" />
            <div className="h-32 bg-zinc-100 rounded-3xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <div className="px-4 pt-20 text-center">
          <p className="text-zinc-500">Event not found.</p>
        </div>
      </AppLayout>
    );
  }

  const isHost = user?.id === event.host.id;
  const userRequest = event.join_requests.find((r) => r.user.id === user?.id);
  const pendingRequests = event.join_requests.filter((r) => r.status === "pending");
  const approvedRequests = event.join_requests.filter((r) => r.status === "approved");
  const spotsLeft = event.max_participants - event.approved_count;
  const dt = new Date(event.event_datetime);

  const hostInitials = event.host.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <AppLayout>
      <div className="px-4 pt-14 pb-8">
        {/* Back */}
        <div className="flex items-center justify-between mb-5">
          <Link href="/events" className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center">
            <ArrowLeft size={18} />
          </Link>
          {isHost && (
            <button onClick={handleDelete} className="text-red-500 text-sm font-semibold">
              Delete
            </button>
          )}
        </div>

        {/* Event header */}
        <div className="card p-5 mb-4">
          <h1 className="text-2xl font-bold tracking-tight mb-1">{event.title}</h1>
          {event.description && (
            <p className="text-zinc-500 text-sm mb-4">{event.description}</p>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Clock size={15} className="text-brand-500" />
              <span>{format(dt, "EEEE d MMMM · HH:mm")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <MapPin size={15} className="text-brand-500" />
              <span>{event.location_text}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Users size={15} className="text-brand-500" />
              <span>
                {event.approved_count}/{event.max_participants} joined
                {spotsLeft > 0 && <span className="text-emerald-600 ml-1">· {spotsLeft} spots left</span>}
                {spotsLeft <= 0 && <span className="text-red-500 ml-1">· Full</span>}
              </span>
            </div>
          </div>

          {event.accommodation && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              🏠 {event.accommodation}{event.floor ? ` · Floor ${event.floor}` : ""}
            </div>
          )}
        </div>

        {/* Host */}
        <div className="card p-4 mb-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Hosted by</p>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: event.host.avatar_color }}
            >
              {hostInitials}
            </div>
            <div>
              <p className="font-semibold text-sm">{event.host.full_name}</p>
              <p className="text-xs text-zinc-400">{event.host.email}</p>
            </div>
            {isHost && (
              <span className="ml-auto bg-brand-100 text-brand-700 text-xs font-semibold px-2 py-0.5 rounded-full">You</span>
            )}
          </div>
        </div>

        {/* Approved participants */}
        {approvedRequests.length > 0 && (
          <div className="card p-4 mb-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Going ({approvedRequests.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {approvedRequests.map((req) => {
                const initials = req.user.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                return (
                  <div key={req.id} className="flex items-center gap-1.5 bg-zinc-50 rounded-full pl-1 pr-3 py-1">
                    <div
                      className="w-6 h-6 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                      style={{ backgroundColor: req.user.avatar_color }}
                    >
                      {initials}
                    </div>
                    <span className="text-xs font-medium">{req.user.full_name.split(" ")[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Join requests (host only) */}
        {isHost && pendingRequests.length > 0 && (
          <div className="card p-4 mb-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Join Requests ({pendingRequests.length})
            </p>
            <div className="space-y-3">
              {pendingRequests.map((req) => {
                const initials = req.user.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                return (
                  <div key={req.id} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                      style={{ backgroundColor: req.user.avatar_color }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{req.user.full_name}</p>
                      <p className="text-xs text-zinc-400 truncate">{req.user.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRequest(req.id, "approve")}
                        disabled={actionLoading}
                        className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => handleRequest(req.id, "reject")}
                        disabled={actionLoading}
                        className="w-8 h-8 bg-red-100 text-red-500 rounded-full flex items-center justify-center"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Join button */}
        {!isHost && (
          <div className="mt-2">
            {!userRequest ? (
              <button
                onClick={handleJoin}
                disabled={actionLoading || spotsLeft <= 0}
                className="btn-primary w-full"
              >
                {spotsLeft <= 0 ? "Event Full" : actionLoading ? "Sending..." : "Request to Join"}
              </button>
            ) : (
              <div className={`w-full py-3 rounded-2xl text-center font-semibold text-sm ${
                userRequest.status === "approved"
                  ? "bg-emerald-50 text-emerald-700"
                  : userRequest.status === "pending"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-red-50 text-red-600"
              }`}>
                {userRequest.status === "approved" && "✓ You're in!"}
                {userRequest.status === "pending" && "⏳ Request pending"}
                {userRequest.status === "rejected" && "✗ Request declined"}
              </div>
            )}
          </div>
        )}

        {/* Chat section - visible to host and enrolled users */}
        {(isHost || userRequest?.status === "approved") && (
          <>
            {/* FAB Button */}
            <button
              onClick={() => setChatOpen(true)}
              className="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-40"
            >
              <MessageCircle size={24} />
            </button>

            {/* Chat Drawer */}
            <EventChatDrawer
              isOpen={chatOpen}
              eventId={event.id}
              eventTitle={event.title}
              currentUserId={user?.id || 0}
              onClose={() => setChatOpen(false)}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
