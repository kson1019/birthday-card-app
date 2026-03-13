export interface Card {
  id: number;
  imagePath: string;
  headline: string;
  title: string;
  hostedBy: string | null;
  location: string;
  datetime: string;
  message: string;
  theme: string;
  durationMinutes: number;
  enableEmojis: number;
  enableSound: number;
  createdAt: string;
}

export interface Recipient {
  id: number;
  cardId: number;
  email: string;
  name: string | null;
  token: string;
  status: "pending" | "accepted" | "declined";
  responseMessage: string | null;
  respondedAt: string | null;
}

export interface CardWithRecipients extends Card {
  recipients: Recipient[];
}

export interface CardWithCounts extends Card {
  totalCount: number;
  acceptedCount: number;
  declinedCount: number;
  pendingCount: number;
}

export interface CreateCardRequest {
  imagePath: string;
  headline: string;
  title: string;
  hostedBy?: string;
  location: string;
  datetime: string;
  message: string;
  theme?: string;
  durationMinutes?: number;
  enableEmojis?: boolean;
  enableSound?: boolean;
  recipients: { email: string; name?: string }[];
}

export interface RsvpRequest {
  token: string;
  status: "accepted" | "declined";
  message?: string;
}
