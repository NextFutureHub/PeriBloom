'use server';

/**
 * @fileOverview An AI assistant that provides personalized advice, recommendations, and breathing exercises based on the user's selected lifecycle stage.
 *
 * - personalizedAIWellnessAssistant - A function that handles the AI assistant process.
 * - PersonalizedAIWellnessAssistantInput - The input type for the personalizedAIWellnessAssistant function.
 * - PersonalizedAIWellnessAssistantOutput - The return type for the personalizedAIWellnessAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedAIWellnessAssistantInputSchema = z.object({
  lifecycleStage: z
    .enum(['pregnancy', 'postpartum', 'childcare'])
    .describe('The user selected lifecycle stage.'),
  query: z.string().describe('The user query for the AI assistant.'),
});
export type PersonalizedAIWellnessAssistantInput = z.infer<
  typeof PersonalizedAIWellnessAssistantInputSchema
>;

const PersonalizedAIWellnessAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant response to the user query.'),
});
export type PersonalizedAIWellnessAssistantOutput = z.infer<
  typeof PersonalizedAIWellnessAssistantOutputSchema
>;

export async function personalizedAIWellnessAssistant(
  input: PersonalizedAIWellnessAssistantInput
): Promise<PersonalizedAIWellnessAssistantOutput> {
  return personalizedAIWellnessAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedAIWellnessAssistantPrompt',
  input: {schema: PersonalizedAIWellnessAssistantInputSchema},
  output: {schema: PersonalizedAIWellnessAssistantOutputSchema},
  prompt: `You are a personalized AI wellness assistant for mothers.

You will provide advice, recommendations, and breathing exercises based on the user's selected lifecycle stage.

The user's lifecycle stage is: {{{lifecycleStage}}}

The user's query is: {{{query}}}

Response:`, // TODO: Add example breathing exercises to prompt
});

const personalizedAIWellnessAssistantFlow = ai.defineFlow(
  {
    name: 'personalizedAIWellnessAssistantFlow',
    inputSchema: PersonalizedAIWellnessAssistantInputSchema,
    outputSchema: PersonalizedAIWellnessAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
