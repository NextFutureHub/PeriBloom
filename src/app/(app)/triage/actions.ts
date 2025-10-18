"use server";

import { analyzeSymptoms, AnalyzeSymptomsInput } from "@/ai/flows/ai-symptom-triage";

export async function getTriageAnalysis(input: AnalyzeSymptomsInput) {
  try {
    const result = await analyzeSymptoms(input);
    return { success: true, ...result };
  } catch (error) {
    console.error("Triage Analysis Error:", error);
    return { success: false, error: "Не удалось проанализировать симптомы. Попробуйте позже." };
  }
}
