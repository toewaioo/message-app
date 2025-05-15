
'use server';

/**
 * @fileOverview AI-powered content moderation flow to detect and filter offensive or harmful content in messages.
 *
 * - moderateContent - A function that moderates the given text content.
 * - ModerateContentInput - The input type for the moderateContent function.
 * - ModerateContentOutput - The return type for the moderateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateContentInputSchema = z.object({
  text: z.string().describe('The text content to be moderated.'),
});
export type ModerateContentInput = z.infer<typeof ModerateContentInputSchema>;

const ModerateContentOutputSchema = z.object({
  isSafe: z.boolean().describe("MUST be 'false' if ANY policy is violated. MUST be 'true' if and only if NO policies are violated."),
  reason: z.string().describe("If 'isSafe' is 'false', MUST clearly state which policy (or policies) were violated and provide a brief, specific explanation related to the text. If 'isSafe' is 'true', MUST be 'Content meets safety guidelines.'"),
});
export type ModerateContentOutput = z.infer<typeof ModerateContentOutputSchema>;

export async function moderateContent(input: ModerateContentInput): Promise<ModerateContentOutput> {
  return moderateContentFlow(input);
}

const moderateContentPrompt = ai.definePrompt({
  name: 'moderateContentPrompt',
  input: {schema: ModerateContentInputSchema},
  output: {schema: ModerateContentOutputSchema},
  prompt: `You are an AI content moderation system. Your task is to analyze the provided text and determine if it violates any of our content policies.

Policies:
1.  Hate Speech: Content that promotes violence, incites hatred, promotes discrimination, or disparages on the basis of race or ethnic origin, religion, disability, age, nationality, veteran status, sexual orientation, sex, gender, gender identity, caste, immigration status, or any other characteristic that is associated with systemic discrimination or marginalization.
2.  Harassment: Content that targets an individual or group with malicious attacks, including bullying, shaming, or sexual harassment.
3.  Sexually Explicit Content: Content that contains nudity, graphic sexual acts, or non-consensual sexual content.
4.  Dangerous Content: Content that promotes, facilitates, or enables access to harmful activities, such as illegal drugs, weapons, or self-harm.
5.  Promotion of Violence: Content that incites or glorifies violence against individuals or groups.

Analyze the following text:
Text: {{{text}}}

Based on your analysis, provide an output STRICTLY adhering to the defined output schema.
The 'isSafe' field (boolean) MUST be 'false' if ANY policy is violated. It MUST be 'true' if and only if NO policies are violated.
The 'reason' field (string): If 'isSafe' is 'false', MUST clearly state which policy (or policies) were violated and provide a brief, specific explanation related to the text. If 'isSafe' is 'true', MUST be "Content meets safety guidelines."

Critically evaluate the text. If there is any ambiguity or potential for harm according to the policies, you MUST err on the side of caution and determine 'isSafe' to be 'false'.`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      // Not including HARM_CATEGORY_CIVIC_INTEGRITY as it's not explicitly in our policies above.
      // If it were, we'd add it to the policy list in the prompt and potentially here.
    ],
  },
});

const moderateContentFlow = ai.defineFlow(
  {
    name: 'moderateContentFlow',
    inputSchema: ModerateContentInputSchema,
    outputSchema: ModerateContentOutputSchema,
  },
  async input => {
    const {output} = await moderateContentPrompt(input);
    if (!output) {
      // This case can happen if the model fails to generate valid JSON or if an error occurs.
      // We should treat this as unsafe to be cautious.
      console.error('Moderation flow received no output from prompt. Input:', input.text);
      return {
        isSafe: false,
        reason: 'Content could not be analyzed by the moderation system. Blocked as a precaution.',
      };
    }
    return output;
  }
);

