import MessageList from '@/components/MessageList';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessagesSquare } from 'lucide-react';

interface ViewMessagesPageProps {
  params: {
    shortId: string; // Changed from linkId to shortId
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ViewMessagesPage({ params, searchParams }: ViewMessagesPageProps) {
  const secretKey = typeof searchParams.secret === 'string' ? searchParams.secret : undefined;

  return (
    <div className="flex flex-col items-center">
      <Card className="w-full max-w-2xl shadow-2xl bg-card/80 backdrop-blur-md">
        <CardHeader className="text-center border-b border-border pb-4">
          <MessagesSquare className="h-10 w-10 text-primary mx-auto mb-3" />
          <CardTitle className="text-2xl font-semibold text-primary">Received Messages</CardTitle>
          <CardDescription className="text-muted-foreground pt-1">
            Here are the anonymous messages sent to your link.
          </CardDescription>
        </CardHeader>
        {/* CardContent is part of MessageList to handle padding correctly with ScrollArea */}
        {/* Pass shortId to MessageList */}
        <MessageList shortId={params.shortId} secretKey={secretKey} />
      </Card>
    </div>
  );
}