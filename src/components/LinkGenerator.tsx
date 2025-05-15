"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createLink, type LinkData } from '@/lib/store';
import { Link2, Copy, Eye, ExternalLink, RefreshCw, KeyRound, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


export default function LinkGenerator() {
  const [generatedLink, setGeneratedLink] = useState<LinkData | null>(null);
  const [baseUrl, setBaseUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const handleGenerateLink = async () => {
    setIsLoading(true);
    try {
      const newLink = await createLink();
      setGeneratedLink(newLink);
      toast({
        title: 'Link Generated!',
        description: 'Your unique anonymous message link is ready.',
        variant: 'default',
      });
    } catch (error) {
      console.error("Failed to generate link:", error);
      toast({
        title: 'Error Generating Link',
        description: (error as Error)?.message || 'Could not generate a new link. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: `${type} Copied!`,
        description: 'Ready to be shared.',
      });
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast({
        title: 'Copy Failed',
        description: 'Could not copy to clipboard.',
        variant: 'destructive',
      });
    });
  };

  if (!baseUrl) { 
    return (
      <div className="flex justify-center items-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading generator...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button 
        onClick={handleGenerateLink} 
        className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Link2 className="mr-2 h-5 w-5" />}
        {isLoading ? 'Generating...' : 'Generate New Link'}
      </Button>

      {generatedLink && (
        <div className="space-y-4 p-6 border border-border rounded-lg bg-background shadow-inner">
          <div>
            <Label htmlFor="sharableLink" className="text-muted-foreground font-semibold">Your Sharable Anonymous Link (Public):</Label>
            <div className="flex items-center gap-2 mt-1">
              {/* Use /s/ and shortId for sharable link */}
              <Input id="sharableLink" type="text" value={`${baseUrl}/s/${generatedLink.shortId}`} readOnly className="bg-input text-foreground"/>
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(`${baseUrl}/s/${generatedLink.shortId}`, 'Sharable Link')} aria-label="Copy sharable link">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" asChild aria-label="Open sharable link">
                <Link href={`/s/${generatedLink.shortId}`} target="_blank">
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="messagesLink" className="text-muted-foreground font-semibold flex items-center">
              <KeyRound className="h-4 w-4 mr-2 text-destructive" />
              View Received Messages (Private & Secure):
            </Label>
            <div className="flex items-center gap-2 mt-1">
              {/* Use /v/ and shortId for messages link */}
              <Input 
                id="messagesLink" 
                type="text" 
                value={`${baseUrl}/v/${generatedLink.shortId}?secret=${generatedLink.secretKey}`} 
                readOnly 
                className="bg-input text-foreground"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => copyToClipboard(`${baseUrl}/v/${generatedLink.shortId}?secret=${generatedLink.secretKey}`, 'Private Messages Link')} 
                aria-label="Copy private messages link"
              >
                <Copy className="h-4 w-4" />
              </Button>
               <Button variant="outline" size="icon" asChild aria-label="Open private messages link">
                <Link href={`/v/${generatedLink.shortId}?secret=${generatedLink.secretKey}`} target="_blank">
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </div>
             <Alert variant="destructive" className="mt-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important: Keep This Link Secret!</AlertTitle>
              <AlertDescription>
                This "View Received Messages" link contains your unique secret key. Anyone with this exact link can read your messages. Do not share it publicly.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
    </div>
  );
}