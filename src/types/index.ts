export type Message = {
  id: string;
  role: 'user' | 'agent' | 'system' | 'bot';
  content: string;
  timestamp: number;
};

export type CustomerProfile = {
  id: string;
  name: string;
  loyaltyTier: string;
  pointsBalance: number;
  lastBooking: string;
  preferences: {
    seat: string;
    meal: string;
  };
};

export type ChatSession = {
  id: string;
  customerId: string;
  status: 'active' | 'escalated' | 'closed';
  messages: Message[];
};
