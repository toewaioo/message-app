
import { supabase } from './supabaseClient';
import type { LinkData, Message } from './types';

// Helper function to generate a random ID (can be used for secretKey)
export const generateId = (): string => {
  if (typeof self !== 'undefined' && self.crypto && self.crypto.randomUUID) {
    return self.crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// For Links
export const createLink = async (): Promise<LinkData> => {
  const generatedSecretKey = generateId();
  const { data, error } = await supabase
    .from('links')
    .insert([{ secret_key: generatedSecretKey }]) // Supabase auto-generates 'id' and 'created_at'
    .select()
    .single();

  if (error) {
    console.error('Error creating link. Supabase error:', JSON.stringify(error, null, 2));
    throw error;
  }

  if (!data) {
    throw new Error('Failed to create link, no data returned.');
  }
  
  // Map Supabase response to LinkData type
  return {
    id: data.id,
    createdAt: data.created_at,
    secretKey: data.secret_key,
  };
};

export const getLink = async (linkId: string): Promise<LinkData | undefined> => {
  const { data, error } = await supabase
    .from('links')
    .select('id, created_at, secret_key')
    .eq('id', linkId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // PGRST116: "Query response not a single object" (i.e. not found)
      return undefined;
    }
    console.error('Error fetching link. Supabase error:', JSON.stringify(error, null, 2));
    throw error;
  }
  
  if (!data) return undefined;

  return {
    id: data.id,
    createdAt: data.created_at,
    secretKey: data.secret_key,
  };
};

// For Messages
export const addMessage = async (
  linkId: string,
  text: string,
  isSafe?: boolean,
  moderationReason?: string
): Promise<Message> => {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        link_id: linkId,
        text,
        is_safe: isSafe,
        moderation_reason: moderationReason,
        // is_anonymous is true by default in DB schema
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding message. Supabase error:', JSON.stringify(error, null, 2));
    throw error;
  }

  if (!data) {
    throw new Error('Failed to add message, no data returned.');
  }

  return {
    id: data.id,
    linkId: data.link_id,
    text: data.text,
    createdAt: data.created_at,
    isAnonymous: data.is_anonymous,
    isSafe: data.is_safe,
    moderationReason: data.moderation_reason,
  };
};

export const getMessages = async (linkId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('link_id', linkId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching messages. Supabase error:', JSON.stringify(error, null, 2));
    throw error;
  }

  return data || [];
};

