"use server";

import { personalizedAIWellnessAssistant, PersonalizedAIWellnessAssistantInput } from "@/ai/flows/personalized-ai-wellness-assistant";

export async function getAIResponse(input: PersonalizedAIWellnessAssistantInput) {
  try {
    const result = await personalizedAIWellnessAssistant(input);
    return { success: true, response: result.response };
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return { success: false, error: "Не удалось получить ответ от AI. Попробуйте позже." };
  }
}
