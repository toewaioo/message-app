import LinkGenerator from '@/components/LinkGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-lg shadow-2xl bg-card/90 backdrop-blur-lg overflow-hidden">
        <div className="relative h-48 w-full">
            <Image 
              src="https://placehold.co/600x300.png" 
              alt="Abstract representation of anonymous connections"
              layout="fill"
              objectFit="cover"
              className="opacity-50"
              data-ai-hint="abstract network"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent"></div>
        </div>
        <CardHeader className="text-center pt-6 relative z-10">
          <CardTitle className="text-3xl font-bold text-primary">Welcome to WhisperLink</CardTitle>
          <CardDescription className="text-muted-foreground pt-2">
            Generate a unique link to receive anonymous messages. Share your link and see what people have to say, securely and privately.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <LinkGenerator />
        </CardContent>
      </Card>
    </div>
  );
}
