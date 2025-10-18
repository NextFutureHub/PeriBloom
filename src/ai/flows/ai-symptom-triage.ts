'use server';
/**
 * @fileOverview AI-powered symptom triage flow.
 *
 * - analyzeSymptoms - Analyzes user-provided symptoms and assesses the risk level.
 * - AnalyzeSymptomsInput - The input type for the analyzeSymptoms function.
 * - AnalyzeSymptomsOutput - The return type for the analyzeSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSymptomsInputSchema = z.object({
  symptomsDescription: z
    .string()
    .describe('A description of the symptoms experienced by the user.'),
});
export type AnalyzeSymptomsInput = z.infer<typeof AnalyzeSymptomsInputSchema>;

const AnalyzeSymptomsOutputSchema = z.object({
  riskLevel: z
    .enum(['low', 'medium', 'high'])
    .describe('The assessed risk level of the symptoms (low, medium, high).'),
  recommendations: z
    .string()
    .describe('Recommended actions based on the symptom analysis.'),
});
export type AnalyzeSymptomsOutput = z.infer<typeof AnalyzeSymptomsOutputSchema>;

export async function analyzeSymptoms(
  input: AnalyzeSymptomsInput
): Promise<AnalyzeSymptomsOutput> {
  return analyzeSymptomsFlow(input);
}

const triagePrompt = ai.definePrompt({
  name: 'triagePrompt',
  input: {schema: AnalyzeSymptomsInputSchema},
  output: {schema: AnalyzeSymptomsOutputSchema},
  prompt: `You are an AI-powered medical triage assistant.

  Analyze the following symptoms and determine the risk level (low, medium, or high).
  Provide clear and concise recommendations based on the analysis.

  Symptoms: {{{symptomsDescription}}}

  Respond in JSON format.`,
});

const analyzeSymptomsFlow = ai.defineFlow(
  {
    name: 'analyzeSymptomsFlow',
    inputSchema: AnalyzeSymptomsInputSchema,
    outputSchema: AnalyzeSymptomsOutputSchema,
  },
  async input => {
    const {output} = await triagePrompt(input);
    return output!;
  }
);
