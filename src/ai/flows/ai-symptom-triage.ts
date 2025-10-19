'use server';
/**
 * @fileOverview AI-powered symptom triage flow.
 *
 * - analyzeSymptoms - Analyzes user-provided symptoms and assesses the risk level.
 * - AnalyzeSymptomsInput - The input type for the analyzeSymptoms function.
 * - AnalyzeSymptomsOutput - The return type for the analyzeSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

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
    .describe('Detailed and personalized recommendations based on the specific symptoms described. Should be different for each risk level and symptom type.'),
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
  prompt: `Вы - AI-ассистент медицинского триажа для беременных женщин.

Проанализируйте описанные симптомы и определите уровень риска (low, medium, high).
Дайте четкие и персонализированные рекомендации на основе анализа.

Симптомы: {{{symptomsDescription}}}

Критерии оценки риска:
- HIGH: Сильная боль, кровотечение, высокая температура (>38.5°C), потеря сознания, затрудненное дыхание, сильная тошнота/рвота, судороги, острая боль в животе
- MEDIUM: Умеренная боль, головная боль, тошнота, слабость, головокружение, дискомфорт в животе, легкое недомогание
- LOW: Легкие симптомы, усталость, легкий дискомфорт, которые не влияют на повседневную деятельность

Для каждого уровня риска давайте специфические рекомендации:
- HIGH: Немедленная медицинская помощь, вызов скорой
- MEDIUM: Обращение к врачу в течение 24-48 часов, мониторинг симптомов
- LOW: Самонаблюдение, отдых, при ухудшении - к врачу

Учитывайте, что это беременная женщина, поэтому будьте особенно внимательны к симптомам, которые могут указывать на осложнения беременности.

Отвечайте в JSON формате на русском языке.`,
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
