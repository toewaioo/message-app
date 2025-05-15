export interface Message {
  id: string;
  linkId: string;
  text: string;
  createdAt: string; // ISO string for date
  isAnonymous: true;
  isSafe?: boolean;
  moderationReason?: string;
}

export interface LinkData {
  id: string;
  createdAt: string; // ISO string for date
  secretKey: string; // Added for message access security
}
