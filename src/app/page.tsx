import LinkGenerator from '@/components/LinkGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-lg shadow-2xl bg-card/80 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Welcome to WhisperLink</CardTitle>
          <CardDescription className="text-muted-foreground pt-2">
            Generate a unique link to receive anonymous messages. Share your link and see what people have to say, securely and privately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinkGenerator />
        </CardContent>
      </Card>
    </div>
  );
}
