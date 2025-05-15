
"use client";

import { useState, useEffect, useCallback } from 'react';
import { getMessages, getLink, deleteMessage, type Message, type LinkData } from '@/lib/store';
import { summarizeMessages, type SummarizeMessagesOutput } from '@/ai/flows/summarize-messages-flow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, CheckCircle2, MessageCircle, RefreshCw, ShieldAlert, ShieldX, Loader2 as CustomLoader, Trash2, NotebookText, Brain } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface MessageListProps {
  linkId: string;
  secretKey?: string;
}

export default function MessageList({ linkId, secretKey }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [accessDeniedReason, setAccessDeniedReason] = useState<string>("Access Denied. The link may be invalid or your secret key is incorrect/missing.");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  const { toast } = useToast();

  const validateAndFetchMessages = useCallback(async () => {
    setIsFetching(true);
    try {
      const linkData: LinkData | undefined = await getLink(linkId);

      if (!linkData) {
        setAccessDeniedReason("Access Denied. This message link is not valid or has expired.");
        setIsAuthorized(false);
        return;
      }

      if (!secretKey || linkData.secretKey !== secretKey) {
        setAccessDeniedReason("Access Denied. The secret key is missing or incorrect. Please use the private link provided during generation.");
        setIsAuthorized(false);
        return;
      }
      
      setIsAuthorized(true);
      const storedMessages = await getMessages(linkId);
      setMessages(storedMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("Error fetching messages or validating link:", error);
      setAccessDeniedReason("An error occurred while trying to load messages. Please try again.");
      setIsAuthorized(false); 
      toast({ title: "Error", description: "Could not load messages.", variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkId, secretKey, toast]); 

  useEffect(() => {
    if (linkId) {
      validateAndFetchMessages();
    } else {
      setAccessDeniedReason("No link ID provided.");
      setIsAuthorized(false);
      setIsFetching(false);
    }
  }, [linkId, validateAndFetchMessages]);


  const handleRefresh = async () => {
    await validateAndFetchMessages(); 
    if(isAuthorized) {
      toast({ title: "Messages Updated", description: "Fetched the latest messages."});
    } else {
       toast({ title: "Update Failed", description: accessDeniedReason, variant: "destructive"});
    }
  }

  const handleSummarize = async () => {
    if (!messages || messages.length === 0) {
      toast({ title: "No Messages", description: "There are no messages to summarize.", variant: "default" });
      return;
    }
    setIsSummarizing(true);
    setSummaryResult(null); // Clear previous summary
    try {
      const messageTexts = messages.map(msg => msg.text);
      const result: SummarizeMessagesOutput = await summarizeMessages({ messages: messageTexts });
      setSummaryResult(result.summary);
      // The summary will be shown in an AlertDialog triggered by this state change
    } catch (error) {
      console.error("Error summarizing messages:", error);
      toast({ title: "Summarization Failed", description: "Could not generate a summary.", variant: "destructive" });
      setSummaryResult("Failed to generate summary. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete || !linkId || !secretKey) return;
    setIsDeleting(true);
    try {
      await deleteMessage(messageToDelete.id, linkId, secretKey);
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageToDelete.id));
      toast({ title: "Message Deleted", description: "The message has been removed.", variant: "default" });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({ title: "Deletion Failed", description: "Could not delete the message.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setMessageToDelete(null); // Close the dialog by resetting the state
    }
  };

  if (isFetching || isAuthorized === null) {
     return (
      <CardContent className="p-6 text-center min-h-[300px] flex flex-col justify-center items-center">
        <CustomLoader className="h-10 w-10 animate-spin text-primary mb-3" />
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
        <div className="p-4 border-b border-border flex justify-between items-center gap-2">
            <AlertDialog open={!!summaryResult} onOpenChange={(open) => !open && setSummaryResult(null)}>
                <Button onClick={handleSummarize} variant="outline" size="sm" disabled={isSummarizing || messages.length === 0} className="shadow-sm hover:shadow-md transition-shadow">
                    {isSummarizing ? <CustomLoader className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                    {isSummarizing ? "Summarizing..." : "Summarize All"}
                </Button>
                {summaryResult && (
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-primary"/>AI Message Summary</AlertDialogTitle>
                        <AlertDialogDescription className="max-h-[400px] overflow-y-auto py-2 whitespace-pre-wrap">
                            {summaryResult}
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setSummaryResult(null)}>Close</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                )}
            </AlertDialog>
            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isFetching} className="shadow-sm hover:shadow-md transition-shadow">
                {isFetching ? <CustomLoader className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Refresh
            </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-450px)] min-h-[300px] p-1 sm:p-2 md:p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No messages yet.</p>
              <p className="text-sm text-muted-foreground/80">Share your public link to start receiving anonymous messages!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                
                let displayDate = "Date unavailable";
                if (msg.createdAt) {
                  try {
                    const dateObj = new Date(msg.createdAt);
                    if (!isNaN(dateObj.getTime())) { 
                      displayDate = formatDistanceToNow(dateObj, { addSuffix: true });
                    }
                  } catch (e) {
                    console.warn(`Could not parse date: ${msg.createdAt}`, e);
                  }
                }
                
                return (
                  <Card key={msg.id} className="bg-background/60 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <div className="flex justify-between items-start">
                         <p className="text-sm text-foreground flex-grow mr-2 break-words whitespace-pre-wrap">
                          {msg.text}
                        </p>
                        <div className="flex flex-col items-end space-y-1 shrink-0">
                            {msg.isSafe === false && (
                            <ShieldAlert className="h-5 w-5 text-destructive" title={`Moderation: ${msg.moderationReason}`} />
                            )}
                            {msg.isSafe === true && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" title={`Moderation: ${msg.moderationReason || 'Content is safe'}`} />
                            )}
                            <AlertDialog open={messageToDelete?.id === msg.id} onOpenChange={(open) => !open && setMessageToDelete(null)}>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setMessageToDelete(msg)}>
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete message</span>
                                    </Button>
                                </AlertDialogTrigger>
                                {messageToDelete?.id === msg.id && (
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this message? This action cannot be undone.
                                        <blockquote className="mt-2 p-2 border-l-4 border-muted-foreground bg-muted/50 rounded-md text-sm italic">
                                        "{messageToDelete.text.length > 100 ? messageToDelete.text.substring(0, 97) + '...' : messageToDelete.text}"
                                        </blockquote>
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setMessageToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={handleDeleteMessage} 
                                        disabled={isDeleting} 
                                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                    >
                                        {isDeleting ? <CustomLoader className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Delete
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                )}
                            </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardFooter className="text-xs text-muted-foreground pb-3 pt-1 px-4 flex justify-between items-center">
                      <span>
                        Received {displayDate}
                      </span>
                       {msg.isSafe === false && msg.moderationReason && (
                          <span className="italic text-destructive truncate max-w-[150px] sm:max-w-xs" title={msg.moderationReason}>
                            Reason: {msg.moderationReason}
                          </span>
                        )}
                    </CardFooter>
                  </Card>
                );
              })}
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
