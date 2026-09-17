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

export type EscalationInfo = {
  reason: string;
  urgency: 'normal' | 'high' | 'critical';
  timestamp: number;
};

export type ChatSession = {
  id: string;
  customerId: string;
  status: 'active' | 'escalated' | 'agent_handling' | 'resolved' | 'closed';
  handledBy: 'ai' | 'agent';
  escalationInfo?: EscalationInfo;
  messages: Message[];
};
