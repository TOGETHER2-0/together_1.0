export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_color: string;
  faculty?: string;
  bio?: string;
  avatar_url?: string;
  country_code?: string;
  created_at: string;
}

export interface JoinRequest {
  id: number;
  user: User;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface Event {
  id: number;
  title: string;
  description: string | null;
  event_datetime: string;
  location_text: string;
  latitude: number | null;
  longitude: number | null;
  max_participants: number;
  accommodation: string | null;
  floor: number | null;
  host: User;
  created_at: string;
  approved_count: number;
  join_requests: JoinRequest[];
}
