export interface Stop {
  name: string;
  description: string;
  suggestedTime: string;
  category: "landmark" | "food" | "museum" | "nature" | "shopping";
  lat?: number;
  lng?: number;
}

export interface Day {
  dayNumber: number;
  title: string;
  stops: Stop[];
}

export interface Trip {
  _id: string;
  userId: string;
  destination: string;
  durationDays: number;
  preferences: {
    interests: string[];
    budget: string;
  };
  days: Day[];
  isPublic: boolean;
  createdAt: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface GeneratePayload {
  destination: string;
  durationDays: number;
  interests: string[];
  budget: string;
}
