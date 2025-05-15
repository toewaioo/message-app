"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createLink, type LinkData } from '@/lib/store';
import { Link2, Copy, Eye, ExternalLink, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function LinkGenerator() {
  const [generatedLink, setGeneratedLink] = useState<LinkData | null>(null);
  const [baseUrl, setBaseUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Ensure window is defined (client-side)
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const handleGenerateLink = () => {
    try {
      const newLink = createLink();
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
        description: 'Could not generate a new link. Please try again.',
        variant: 'destructive',
      });
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
      <Button onClick={handleGenerateLink} className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all duration-300 ease-in-out transform hover:scale-105">
        <Link2 className="mr-2 h-5 w-5" /> Generate New Link
      </Button>

      {generatedLink && (
        <div className="space-y-4 p-6 border border-border rounded-lg bg-background shadow-inner">
          <div>
            <Label htmlFor="sharableLink" className="text-muted-foreground font-semibold">Your Sharable Anonymous Link:</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input id="sharableLink" type="text" value={`${baseUrl}/link/${generatedLink.id}`} readOnly className="bg-input text-foreground"/>
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(`${baseUrl}/link/${generatedLink.id}`, 'Sharable Link')} aria-label="Copy sharable link">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" asChild aria-label="Open sharable link">
                <Link href={`/link/${generatedLink.id}`} target="_blank">
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="messagesLink" className="text-muted-foreground font-semibold">View Received Messages:</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input id="messagesLink" type="text" value={`${baseUrl}/messages/${generatedLink.id}`} readOnly className="bg-input text-foreground"/>
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(`${baseUrl}/messages/${generatedLink.id}`, 'Messages Link')} aria-label="Copy messages link">
                <Copy className="h-4 w-4" />
              </Button>
               <Button variant="outline" size="icon" asChild aria-label="Open messages link">
                <Link href={`/messages/${generatedLink.id}`} target="_blank">
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </div>
             <p className="text-xs text-muted-foreground mt-2">Keep this link private! This is how you view your messages.</p>
          </div>
        </div>
      )}
    </div>
  );
}
