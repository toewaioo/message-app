import MessageBox from '@/components/MessageBox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// getLink is not used on this page directly anymore, validation happens in MessageBox
// import { getLink } from '@/lib/store'; 
import { AlertTriangle } from 'lucide-react';

interface SendMessagePageProps {
  params: {
    shortId: string; // Changed from linkId to shortId
  };
}

export default function SendMessagePage({ params }: SendMessagePageProps) {
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
          {/* Pass shortId to MessageBox */}
          <MessageBox shortId={params.shortId} />
        </CardContent>
      </Card>
    </div>
  );
}