
'use server';
/**
 * @fileOverview AI-powered message summarization flow.
 *
 * - summarizeMessages - A function that takes an array of message texts and returns a summary.
 * - SummarizeMessagesInput - The input type for the summarizeMessages function.
 * - SummarizeMessagesOutput - The return type for the summarizeMessages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMessagesInputSchema = z.object({
  messages: z.array(z.string()).describe('An array of message texts to be summarized.'),
});
export type SummarizeMessagesInput = z.infer<typeof SummarizeMessagesInputSchema>;

const SummarizeMessagesOutputSchema = z.object({
  summary: z.string().describe('A concise summary of all provided messages. Should capture key themes and sentiments. If no messages are provided, state that there is nothing to summarize.'),
});
export type SummarizeMessagesOutput = z.infer<typeof SummarizeMessagesOutputSchema>;

export async function summarizeMessages(input: SummarizeMessagesInput): Promise<SummarizeMessagesOutput> {
  return summarizeMessagesFlow(input);
}

const summarizeMessagesPrompt = ai.definePrompt({
  name: 'summarizeMessagesPrompt',
  input: {schema: SummarizeMessagesInputSchema},
  output: {schema: SummarizeMessagesOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing a collection of anonymous messages.
Your goal is to provide a concise overview that captures the main themes, sentiments, and any recurring topics mentioned in the messages.

Messages to summarize:
{{#if messages.length}}
  {{#each messages}}
  - {{{this}}}
  {{/each}}
{{else}}
(No messages provided)
{{/if}}

Please generate a summary based on these messages.
If no messages were provided, state that clearly.
Focus on being informative and neutral in tone.
The summary should be a single block of text.
`,
});

const summarizeMessagesFlow = ai.defineFlow(
  {
    name: 'summarizeMessagesFlow',
    inputSchema: SummarizeMessagesInputSchema,
    outputSchema: SummarizeMessagesOutputSchema,
  },
  async (input: SummarizeMessagesInput) => {
    if (!input.messages || input.messages.length === 0) {
      return { summary: 'There are no messages to summarize.' };
    }
    // Limit the number of messages to avoid overly long prompts or exceeding token limits
    // This is a simple truncation, more sophisticated strategies could be used.
    const MAX_MESSAGES_FOR_SUMMARY = 50;
    const messagesToProcess = input.messages.slice(0, MAX_MESSAGES_FOR_SUMMARY);
    
    let preamble = "";
    if (input.messages.length > MAX_MESSAGES_FOR_SUMMARY) {
      preamble = `(Summary based on the first ${MAX_MESSAGES_FOR_SUMMARY} of ${input.messages.length} messages) `;
    }

    const {output} = await summarizeMessagesPrompt({ messages: messagesToProcess });
    if (!output) {
      return { summary: 'Could not generate a summary at this time.' };
    }
    return { summary: preamble + output.summary };
  }
);

