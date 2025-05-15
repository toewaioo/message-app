import MessageBox from '@/components/MessageBox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getLink } from '@/lib/store';
import { AlertTriangle } from 'lucide-react';

interface SendMessagePageProps {
  params: {
    linkId: string;
  };
}

export default function SendMessagePage({ params }: SendMessagePageProps) {
  // Fetching link data on server to check validity.
  // In a real app with a DB, this check would be more robust.
  // For localStorage, this check is mostly illustrative as getLink will run client-side effectively.
  // However, to show the pattern:
  // const link = typeof window !== "undefined" ? getLink(params.linkId) : null;
  // This approach is problematic with server components and localStorage.
  // Best to handle link validation fully within the client component MessageBox.

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-lg shadow-2xl bg-card/80 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-primary">Send an Anonymous Message</CardTitle>
          <CardDescription className="text-muted-foreground pt-1">
            Your identity will remain a secret. Share your thoughts freely.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MessageBox linkId={params.linkId} />
        </CardContent>
      </Card>
    </div>
  );
}
