"use client";

import { useState, useEffect } from 'react';
import { getMessages, getLink, type Message, type LinkData } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, CheckCircle2, MessageCircle, RefreshCw, ShieldAlert, ShieldX } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface MessageListProps {
  linkId: string;
  secretKey?: string; // Secret key from URL query param
}

export default function MessageList({ linkId, secretKey }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null); // null: loading, true: authorized, false: not authorized
  const [accessDeniedReason, setAccessDeniedReason] = useState<string>("Access Denied. The link may be invalid or your secret key is incorrect/missing.");
  const { toast } = useToast();

  const validateAndFetchMessages = () => {
    if (typeof window !== 'undefined') {
      setIsLoading(true);
      const linkData: LinkData | undefined = getLink(linkId);

      if (!linkData) {
        setAccessDeniedReason("Access Denied. This message link is not valid or has expired.");
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      if (!secretKey || linkData.secretKey !== secretKey) {
        setAccessDeniedReason("Access Denied. The secret key is missing or incorrect. Please use the private link provided during generation.");
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }
      
      // If authorized
      setIsAuthorized(true);
      const storedMessages = getMessages(linkId);
      storedMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMessages(storedMessages);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    validateAndFetchMessages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkId, secretKey]);


  const handleRefresh = () => {
    // Add a small delay to simulate network request and show loading state
    setTimeout(() => {
      validateAndFetchMessages(); // Re-validates and fetches
      if(isAuthorized) {
        toast({ title: "Messages Updated", description: "Fetched the latest messages."});
      } else {
         toast({ title: "Update Failed", description: "Could not fetch messages. Check access.", variant: "destructive"});
      }
    }, 500);
  }

  if (isLoading || isAuthorized === null) { // Still loading or initial state
     return (
      <CardContent className="p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
        <p className="text-muted-foreground">Verifying access and loading messages...</p>
      </CardContent>
    );
  }
  
  if (!isAuthorized) {
    return (
      <CardContent className="p-6">
        <div className="text-center p-6 bg-destructive/10 border border-destructive rounded-md">
          <ShieldX className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-destructive-foreground mb-2">Access Denied</h3>
          <p className="text-muted-foreground">{accessDeniedReason}</p>
        </div>
      </CardContent>
    );
  }

  return (
    <>
      <CardContent className="p-0">
        <div className="p-4 border-b border-border flex justify-end">
            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Refresh
            </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px] p-1 sm:p-2 md:p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No messages yet.</p>
              <p className="text-sm text-muted-foreground/80">Share your public link to start receiving anonymous messages!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <Card key={msg.id} className="bg-background/70 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex justify-between items-center">
                       <CardTitle className="text-sm font-normal text-foreground">
                        {msg.text}
                      </CardTitle>
                      {msg.isSafe === false && (
                        <ShieldAlert className="h-5 w-5 text-destructive ml-2 shrink-0" title={`Moderation: ${msg.moderationReason}`} />
                      )}
                       {msg.isSafe === true && (
                        <CheckCircle2 className="h-5 w-5 text-green-500 ml-2 shrink-0" title={`Moderation: ${msg.moderationReason}`} />
                      )}
                    </div>
                  </CardHeader>
                  <CardFooter className="text-xs text-muted-foreground pb-3 pt-1 px-4 flex justify-between items-center">
                    <span>
                      Received {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </span>
                     {msg.isSafe === false && msg.moderationReason && (
                        <span className="italic text-destructive truncate max-w-[150px] sm:max-w-xs" title={msg.moderationReason}>
                          Reason: {msg.moderationReason}
                        </span>
                      )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      {messages.length > 0 && (
         <CardFooter className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center w-full">
                Displaying {messages.length} message{messages.length === 1 ? '' : 's'}.
                Remember, these messages are anonymous.
            </p>
        </CardFooter>
      )}
    </>
  );
}

// Simple loader for initial loading state
function Loader2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
