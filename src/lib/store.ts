// This is a simple client-side store using localStorage for demo purposes.
// In a real application, you would use a database.
import type { LinkData, Message } from './types';

const LINKS_KEY = 'whisperlink_links';
const MESSAGES_KEY_PREFIX = 'whisperlink_messages_';

export const generateId = (): string => {
  if (typeof self !== 'undefined' && self.crypto && self.crypto.randomUUID) {
    return self.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// For Links
export const createLink = (): LinkData => {
  if (typeof window === 'undefined') {
    // Should not happen if called from client component correctly
    throw new Error("localStorage is not available.");
  }
  const links = getAllLinks();
  const newLink: LinkData = {
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  links.push(newLink);
  window.localStorage.setItem(LINKS_KEY, JSON.stringify(links));
  return newLink;
};

export const getLink = (linkId: string): LinkData | undefined => {
  if (typeof window === 'undefined') return undefined;
  const links = getAllLinks();
  return links.find(link => link.id === linkId);
};

const getAllLinks = (): LinkData[] => {
  if (typeof window === 'undefined') return [];
  const linksJson = window.localStorage.getItem(LINKS_KEY);
  return linksJson ? JSON.parse(linksJson) : [];
};


// For Messages
export const addMessage = (
  linkId: string,
  text: string,
  isSafe?: boolean,
  moderationReason?: string
): Message => {
  if (typeof window === 'undefined') {
     throw new Error("localStorage is not available.");
  }
  const messages = getMessages(linkId);
  const newMessage: Message = {
    id: generateId(),
    linkId,
    text,
    createdAt: new Date().toISOString(),
    isAnonymous: true,
    isSafe,
    moderationReason,
  };
  messages.push(newMessage);
  window.localStorage.setItem(`${MESSAGES_KEY_PREFIX}${linkId}`, JSON.stringify(messages));
  return newMessage;
};

export const getMessages = (linkId: string): Message[] => {
  if (typeof window === 'undefined') return [];
  const messagesJson = window.localStorage.getItem(`${MESSAGES_KEY_PREFIX}${linkId}`);
  return messagesJson ? JSON.parse(messagesJson) : [];
};
