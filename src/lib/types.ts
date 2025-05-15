export interface Message {
  id: string;
  linkId: string; // This will remain the UUID foreign key to links.id
  text: string;
  createdAt: string; // ISO string for date
  isAnonymous: true;
  isSafe?: boolean;
  moderationReason?: string;
}

export interface LinkData {
  id: string; // The internal UUID primary key
  shortId: string; // The short, user-facing ID for URLs
  createdAt: string; // ISO string for date
  secretKey: string; // Secure key for message access
}