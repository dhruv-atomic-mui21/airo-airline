'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatSession, CustomerProfile } from '@/types';

export const MOCK_PROFILE: CustomerProfile = {
  id: 'C12345',
  name: 'Alice Smith',
  loyaltyTier: 'Platinum',
  pointsBalance: 42750,
  lastBooking: '2026-08-15',
  preferences: { seat: 'aisle', meal: 'vegetarian' },
};

const DEFAULT_SESSION: ChatSession = {
  id: 'sess-9876',
  customerId: 'C12345',
  status: 'active',
  messages: [
    {
      id: 'msg-1',
      role: 'bot',
      content: 'Hello! I am Airo, your virtual assistant. How can I help you today?',
      timestamp: Date.now(),
    }
  ],
};

const STORE_KEY = 'airo_crm_session_final';

export function useStore() {
  const [session, setSession] = useState<ChatSession>(DEFAULT_SESSION);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    const stored = localStorage.getItem(STORE_KEY);
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse session from local storage', e);
      }
    } else {
      localStorage.setItem(STORE_KEY, JSON.stringify(DEFAULT_SESSION));
    }
    setIsLoaded(true);
  }, []);

  // Listen to storage events to sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORE_KEY && e.newValue) {
        setSession(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateSession = useCallback((newSession: ChatSession) => {
    setSession(newSession);
    localStorage.setItem(STORE_KEY, JSON.stringify(newSession));
    // Trigger custom event for same-tab updates (storage event only fires across tabs)
    window.dispatchEvent(new CustomEvent('session-updated', { detail: newSession }));
  }, []);

  useEffect(() => {
    const handleCustom = (e: CustomEvent) => {
      setSession(e.detail);
    };
    window.addEventListener('session-updated', handleCustom as EventListener);
    return () => window.removeEventListener('session-updated', handleCustom as EventListener);
  }, []);

  return { session, updateSession, isLoaded };
}
