import { Models } from "appwrite";

export interface AuthError {
  type:
    | "auth_error"
    | "validation_error"
    | "server_error"
    | "database_error"
    | "unknown_error";
  message: string;
}

export interface User extends Models.Document {
  email: string;
  displayName: string;
  spotifyId: string;
  country?: string;
  product?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastActive: string;
}

export interface Settings extends Models.Document {
  userId: string;
  continuousTracking: boolean;
  trackingConsent: boolean;
  consentTimestamp?: string;
  trackingInterval: number;
  lastSync?: string;
  emailNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}
