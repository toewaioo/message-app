import { supabase } from './supabaseClient';
import type { LinkData, Message } from './types';

// Helper function to generate a long random ID (for secretKey)
export const generateSecureId = (): string => {
  if (typeof self !== 'undefined' && self.crypto && self.crypto.randomUUID) {
    return self.crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper function to generate a short ID for URLs
const generateShortId = (length: number = 8): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};


// For Links
export const createLink = async (): Promise<LinkData> => {
  const generatedSecretKey = generateSecureId();
  let shortIdAttempt: string;
  let linkCreated = false;
  let createdLinkData: LinkData | null = null;
  let attempts = 0;
  const MAX_ATTEMPTS = 5; // To prevent infinite loops for short_id generation

  while (!linkCreated && attempts < MAX_ATTEMPTS) {
    shortIdAttempt = generateShortId();
    attempts++;
    const { data, error } = await supabase
      .from('links')
      .insert([{ secret_key: generatedSecretKey, short_id: shortIdAttempt }])
      .select('id, short_id, created_at, secret_key')
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation (e.g., for short_id)
        console.warn(`short_id collision for ${shortIdAttempt}, retrying... (attempt ${attempts})`);
        // Continue loop to try another short_id
      } else {
        console.error('Error creating link. Supabase error:', JSON.stringify(error, null, 2));
        throw error; // Rethrow other errors
      }
    } else if (data) {
      createdLinkData = {
        id: data.id,
        shortId: data.short_id,
        createdAt: data.created_at,
        secretKey: data.secret_key,
      };
      linkCreated = true;
    }
  }

  if (!createdLinkData) {
    if (attempts >= MAX_ATTEMPTS) {
        throw new Error('Failed to create link after multiple attempts due to short_id collisions. Ensure short_id column has a UNIQUE constraint.');
    }
    throw new Error('Failed to create link, no data returned or max attempts reached.');
  }
  
  return createdLinkData;
};

// Fetches a link by its short_id
export const getLink = async (shortId: string): Promise<LinkData | undefined> => {
  const { data, error } = await supabase
    .from('links')
    .select('id, short_id, created_at, secret_key')
    .eq('short_id', shortId)
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
    shortId: data.short_id,
    createdAt: data.created_at,
    secretKey: data.secret_key,
  };
};

// For Messages
// linkId parameter here refers to the UUID (links.id)
export const addMessage = async (
  linkId: string, // This is the UUID of the link
  text: string,
  isSafe?: boolean,
  moderationReason?: string
): Promise<Message> => {
  const { data, error } = await supabase
    .from('messages')
    .insert([
      {
        link_id: linkId, // Foreign key to links.id (UUID)
        text,
        is_safe: isSafe,
        moderation_reason: moderationReason,
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

// linkId parameter here refers to the UUID (links.id)
export const getMessages = async (linkId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('link_id', linkId) // Query by links.id (UUID)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching messages. Supabase error:', JSON.stringify(error, null, 2));
    throw error;
  }

  return (data || []).map(msg => ({
    id: msg.id,
    linkId: msg.link_id,
    text: msg.text,
    createdAt: msg.created_at,
    isAnonymous: msg.is_anonymous,
    isSafe: msg.is_safe,
    moderationReason: msg.moderation_reason,
  }));
};

// messageId is UUID of message, linkUuid is UUID of the link
export const deleteMessage = async (messageId: string, linkUuid: string, secretKey: string): Promise<boolean> => {
  // Fetch link by its UUID to verify secretKey
  const { data: linkData, error: linkError } = await supabase
    .from('links')
    .select('id, secret_key')
    .eq('id', linkUuid)
    .single();

  if (linkError || !linkData) {
    console.error('Error deleting message: Link not found or error fetching link.', linkError);
    throw new Error('Authorization failed. Cannot delete message.');
  }

  if (linkData.secret_key !== secretKey) {
    console.error('Error deleting message: Invalid secretKey.');
    throw new Error('Authorization failed. Cannot delete message.');
  }

  const { error } = await supabase
    .from('messages')
    .delete()
    .match({ id: messageId, link_id: linkUuid }); // Ensure we only delete from the correct link (identified by UUID)

  if (error) {
    console.error('Error deleting message. Supabase error:', JSON.stringify(error, null, 2));
    throw error;
  }

  return true;
};