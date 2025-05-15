"use client";

import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { moderateContent } from '@/ai/flows/moderate-content';
import { addMessage, getLink, type LinkData } from '@/lib/store'; // Import LinkData
import { Send, Loader2, AlertTriangle } from 'lucide-react';
import type { ModerateContentOutput } from '@/ai/flows/moderate-content';

interface MessageBoxProps {
  shortId: string; // Changed from linkId to shortId
}

export default function MessageBox({ shortId }: MessageBoxProps) {
  const [messageText, setMessageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLinkData, setCurrentLinkData] = useState<LinkData | null>(null); // Store full link data
  const [isLinkValid, setIsLinkValid] = useState<boolean | null>(null);
  const [isValidatingLink, setIsValidatingLink] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const validateLink = async () => {
      setIsValidatingLink(true);
      try {
        // Fetch link by shortId
        const linkData = await getLink(shortId);
        if (linkData) {
          setCurrentLinkData(linkData); // Store the fetched link data (includes UUID id)
          setIsLinkValid(true);
        } else {
          setIsLinkValid(false);
        }
      } catch (error) {
        console.error("Error validating link:", error);
        setIsLinkValid(false);
        toast({
          title: 'Error',
          description: 'Could not verify the link. It might be invalid.',
          variant: 'destructive',
        });
      } finally {
        setIsValidatingLink(false);
      }
    };

    if (shortId) {
      validateLink();
    } else {
      setIsLinkValid(false);
      setIsValidatingLink(false);
    }
  }, [shortId, toast]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!messageText.trim()) {
      toast({
        title: 'Empty Message',
        description: 'Please type a message before sending.',
        variant: 'destructive',
      });
      return;
    }

    if (!currentLinkData) {
      toast({
        title: 'Error',
        description: 'Link information is not available. Cannot send message.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const moderationResult: ModerateContentOutput = await moderateContent({ text: messageText });
      console.log(moderationResult);
      if (!moderationResult.isSafe) {
        toast({
          title: 'Message Blocked',
          description: `Your message could not be sent: ${moderationResult.reason}`,
          variant: 'destructive',
          duration: 7000,
        });
      } else {
        // Use currentLinkData.id (UUID) for addMessage
        await addMessage(currentLinkData.id, messageText, true, moderationResult.reason);
        toast({
          title: 'Message Sent!',
          description: 'Your anonymous message has been delivered.',
          variant: 'default',
        });
        setMessageText('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Could not send message. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isValidatingLink || isLinkValid === null) { 
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Verifying link...</p>
      </div>
    );
  }

  if (!isLinkValid || !currentLinkData) {
    return (
      <div className="text-center p-6 bg-destructive/10 border border-destructive rounded-md">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-destructive-foreground mb-2">Invalid Link</h3>
        <p className="text-muted-foreground">This message link is not valid or has expired. Please check the URL.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        placeholder="Type your anonymous message here..."
        rows={5}
        className="bg-input text-foreground placeholder-muted-foreground focus:ring-primary focus:border-primary"
        disabled={isSubmitting}
        aria-label="Anonymous message input"
      />
      <Button type="submit" className="w-full text-lg py-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all duration-300 ease-in-out transform hover:scale-105" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Send className="mr-2 h-5 w-5" />
        )}
        {isSubmitting ? 'Sending...' : 'Send Anonymously'}
      </Button>
       <p className="text-xs text-muted-foreground text-center pt-2">
        Messages are checked by AI for harmful content.
      </p>
    </form>
  );
}