
# WhisperLink - Anonymous Messaging Platform

WhisperLink is a Next.js application that allows users to generate unique, shorter links for receiving anonymous messages. Messages are moderated for harmful content using AI (Google's Gemini via Genkit). Data is stored using Supabase.

## Features

*   **Unique Short Link Generation**: Create shareable short links (e.g., `/s/shortId`) where anyone can send you anonymous messages.
*   **Secure Message Viewing**: Access received messages using a private short link that includes a secret key (e.g., `/v/shortId?secret=yourSecretKey`).
*   **Anonymous Messaging**: Senders' identities are kept secret.
*   **AI-Powered Content Moderation**: Messages are automatically checked for harmful content (hate speech, harassment, etc.) using Genkit and Google's Gemini model before being stored.
*   **AI-Powered Message Summarization**: Link owners can get an AI-generated summary of their received messages.
*   **Message Deletion**: Link owners can delete messages they have received.
*   **Modern UI**: Built with ShadCN UI components and Tailwind CSS for a sleek and responsive design.
*   **Serverless Backend**: Utilizes Supabase for database storage.

## Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **UI Library**: [React](https://reactjs.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
*   **Database**: [Supabase](https://supabase.io/) (PostgreSQL)
*   **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) with [Google AI (Gemini)](https://ai.google.dev/)
*   **Language**: TypeScript

## Project Setup

Follow these steps to get WhisperLink running locally:

**1. Clone the Repository (Example)**

```bash
git clone <your-repository-url>
cd whisperlink-project
```

**2. Set up Supabase**

*   Create a free account at [supabase.com](https://supabase.com).
*   Create a new project.
*   Navigate to the "SQL Editor" in your Supabase project dashboard.
*   Run the following SQL to create the necessary tables:

    ```sql
    -- Create the 'links' table
    CREATE TABLE public.links (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        secret_key text NOT NULL,
        short_id text NULL, -- Will be populated by the application
        CONSTRAINT links_pkey PRIMARY KEY (id),
        CONSTRAINT links_secret_key_key UNIQUE (secret_key),
        CONSTRAINT links_short_id_key UNIQUE (short_id) -- Add unique constraint after initial population or if starting fresh
    );
    
    COMMENT ON TABLE public.links IS 'Stores the generated unique links and their secret keys.';
    COMMENT ON COLUMN public.links.id IS 'Primary key, unique identifier for the link (internal).';
    COMMENT ON COLUMN public.links.created_at IS 'Timestamp of when the link was created.';
    COMMENT ON COLUMN public.links.secret_key IS 'Unique secret key required to view messages for this link.';
    COMMENT ON COLUMN public.links.short_id IS 'Short, unique, user-facing identifier for the link URL.';
    
    -- Create the 'messages' table
    CREATE TABLE public.messages (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        link_id uuid NOT NULL, -- Foreign key to links.id (the UUID)
        text text NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        is_anonymous boolean NOT NULL DEFAULT true,
        is_safe boolean NULL,
        moderation_reason text NULL,
        CONSTRAINT messages_pkey PRIMARY KEY (id),
        CONSTRAINT messages_link_id_fkey FOREIGN KEY (link_id) REFERENCES public.links(id) ON DELETE CASCADE
    );
    
    COMMENT ON TABLE public.messages IS 'Stores the anonymous messages sent to links.';
    COMMENT ON COLUMN public.messages.id IS 'Primary key, unique identifier for the message.';
    COMMENT ON COLUMN public.messages.link_id IS 'Foreign key referencing the link this message belongs to (references links.id UUID).';
    COMMENT ON COLUMN public.messages.text IS 'The content of the anonymous message.';
    COMMENT ON COLUMN public.messages.created_at IS 'Timestamp of when the message was sent.';
    COMMENT ON COLUMN public.messages.is_anonymous IS 'Flag indicating if the message is anonymous (always true for this app).';
    COMMENT ON COLUMN public.messages.is_safe IS 'Flag indicating if the content was deemed safe by moderation.';
    COMMENT ON COLUMN public.messages.moderation_reason IS 'Reason provided by the content moderation service.';
    
    -- Important: If you created the links table before and it has data, 
    -- ensure you add the unique constraint and NOT NULL constraint on short_id carefully.
    -- If starting fresh, you can define short_id as UNIQUE NOT NULL from the start.
    -- Example to make short_id not nullable after ensuring all existing rows have a value:
    -- ALTER TABLE public.links ALTER COLUMN short_id SET NOT NULL;
    ```

**3. Configure Environment Variables**

*   In your Supabase project, go to "Project Settings" (gear icon) > "API".
*   Copy your "Project URL" and the "public" "anon" key.
*   Create a `.env` file in the root of your project and add your Supabase credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
    
    # Optional: If you have a specific Google AI API key for Genkit (though often configured globally or via gcloud)
    # GOOGLE_API_KEY=YOUR_GOOGLE_AI_API_KEY 
    ```
    Replace placeholders with your actual Supabase URL and Anon Key.

**4. Install Dependencies**

```bash
npm install
# or
# yarn install
```

**5. Run the Development Servers**

*   **Next.js App**:
    ```bash
    npm run dev
    ```
    This will start the Next.js application, typically on `http://localhost:9002`.

*   **Genkit Development Server (for AI flows)**:
    Open a new terminal and run:
    ```bash
    npm run genkit:dev
    ```
    This starts the Genkit development server, which is necessary for the AI content moderation flow to work. It usually runs on `http://localhost:4000`. You can also use `npm run genkit:watch` for automatic reloading on Genkit flow changes.

**6. Open the App**
   Navigate to `http://localhost:9002` (or the port specified in your terminal) in your browser.

## Database Schema

The application uses two main tables in Supabase:

*   **`links`**:
    *   `id` (uuid, primary key): Unique internal identifier for the link.
    *   `short_id` (text, unique): Short, user-facing identifier used in URLs.
    *   `created_at` (timestamp with time zone): When the link was created.
    *   `secret_key` (text, unique): A secret key associated with the link, required to view its messages.
*   **`messages`**:
    *   `id` (uuid, primary key): Unique identifier for the message.
    *   `link_id` (uuid, foreign key to `links.id`): The link (UUID) this message belongs to.
    *   `text` (text): The content of the anonymous message.
    *   `created_at` (timestamp with time zone): When the message was sent.
    *   `is_anonymous` (boolean, default true): Always true for this application.
    *   `is_safe` (boolean, nullable): Whether AI moderation deemed the content safe.
    *   `moderation_reason` (text, nullable): The reason given by AI moderation if content is not safe.

## AI Integration

*   **Content Moderation**:
    *   The `src/ai/flows/moderate-content.ts` file defines a Genkit flow.
    *   This flow uses the Gemini model to analyze message content for safety.
*   **Message Summarization**:
    *   The `src/ai/flows/summarize-messages-flow.ts` file defines a Genkit flow.
    *   This flow summarizes received messages for the link owner.

## Key Project Structure

*   **`src/app/`**: Next.js App Router pages.
    *   `page.tsx`: Homepage for link generation.
    *   `s/[shortId]/page.tsx`: Page for sending a message to a specific link (using its short ID).
    *   `v/[shortId]/page.tsx`: Page for viewing received messages (using short ID, requires secret key).
*   **`src/components/`**: React components.
    *   `LinkGenerator.tsx`: Handles creation and display of new links.
    *   `MessageBox.tsx`: Form for sending anonymous messages.
    *   `MessageList.tsx`: Displays received messages for a link owner, including delete and summarize actions.
    *   `ui/`: ShadCN UI components.
    *   `layout/`: Layout components like header and container.
*   **`src/lib/`**: Core logic and utilities.
    *   `store.ts`: Functions for interacting with the Supabase database (CRUD operations for links and messages).
    *   `supabaseClient.ts`: Initializes the Supabase client.
    *   `types.ts`: TypeScript type definitions for `LinkData` and `Message`.
*   **`src/ai/`**: Genkit AI related files.
    *   `genkit.ts`: Initializes the global Genkit `ai` object and configures plugins.
    *   `flows/moderate-content.ts`: The content moderation flow.
    *   `flows/summarize-messages-flow.ts`: The message summarization flow.
    *   `dev.ts`: Entry point for the Genkit development server.
*   **`public/`**: Static assets.
*   **`src/hooks/`**: Custom React hooks.

## Future Enhancements

*   Implement full Row Level Security (RLS) in Supabase for enhanced data protection.
*   User authentication if multiple users need to manage their own links.
*   Notifications for new messages.
*   Customizable link expiration.
*   Option to backfill `short_id` for links created before this feature.
```