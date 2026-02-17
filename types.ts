
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  isPrimary?: boolean;
}

export interface UserLocation {
  lat: number;
  lng: number;
  timestamp: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  EMERGENCY = 'EMERGENCY',
  TRACKING = 'TRACKING'
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export type MessageType = 'text' | 'image' | 'video' | 'file' | 'location';

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  mediaUrl?: string;
  fileName?: string;
  location?: { lat: number; lng: number };
  type: MessageType;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatPreview {
  otherUserId: string;
  lastMessage: string;
  timestamp: number;
  unreadCount: number;
  lastMessageType: MessageType;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  emergencyNote: string;
  avatar?: string;
}
