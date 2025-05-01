'use server';
/**
 * @fileOverview AI-powered tool to analyze patient data (mood, activity, meds) and highlight potential issues or suggest treatment adjustments, presented as a brief summary.
 *
 * - generatePatientInsights - A function that handles the patient insights generation process.
 * - GeneratePatientInsightsInput - The input type for the generatePatientInsights function.
 * - GeneratePatientInsightsOutput - The return type for the generatePatientInsights function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getMedications} from '@/services/medication';
import {getWearableData} from '@/services/wearable-data';

const GeneratePatientInsightsInputSchema = z.object({
  patientId: z.string().describe('The ID of the patient to generate insights for.'),
});
export type GeneratePatientInsightsInput = z.infer<typeof GeneratePatientInsightsInputSchema>;

const GeneratePatientInsightsOutputSchema = z.object({
  insights: z.string().describe('A brief summary of insights based on the patient data.'),
});
export type GeneratePatientInsightsOutput = z.infer<typeof GeneratePatientInsightsOutputSchema>;

export async function generatePatientInsights(input: GeneratePatientInsightsInput): Promise<GeneratePatientInsightsOutput> {
  return generatePatientInsightsFlow(input);
}

const generatePatientInsightsPrompt = ai.definePrompt({
  name: 'generatePatientInsightsPrompt',
  input: {
    schema: z.object({
      moodData: z.string().describe('Summary of the patient\'s mood check-ins.'),
      wearableData: z.string().describe('Summary of the patient\'s wearable data (activity, sleep, etc.).'),
      medicationData: z.string().describe('Summary of the patient\'s medication list and adherence.'),
      notes: z.string().describe('Summary of the patient notes.'),
      treatmentHistory: z.string().describe('Summary of the patient treatment history.'),
      activities: z.string().describe('Summary of the patient activities.'),
    }),
  },
  output: {
    schema: z.object({
      insights: z.string().describe('A brief summary of insights based on the patient data.'),
    }),
  },
  prompt: `You are an AI assistant helping doctors by analyzing patient data and providing insights.\n
  Analyze the following patient data and provide a brief summary of potential issues or suggest treatment adjustments. Be concise and use clear language. Do NOT provide medical advice or diagnoses. Be positive, encouraging, and actionable.\n
  Mood Data: {{{moodData}}}
  Wearable Data: {{{wearableData}}}
  Medication Data: {{{medicationData}}}
  Patient Notes: {{{notes}}}
  Treatment History: {{{treatmentHistory}}}
  Patient Activities: {{{activities}}}

  Insights:`,
});

const generatePatientInsightsFlow = ai.defineFlow<
  typeof GeneratePatientInsightsInputSchema,
  typeof GeneratePatientInsightsOutputSchema
>(
  {
    name: 'generatePatientInsightsFlow',
    inputSchema: GeneratePatientInsightsInputSchema,
    outputSchema: GeneratePatientInsightsOutputSchema,
  },
  async input => {
    const patientId = input.patientId;

    // Fetch patient data
    const wearableData = await getWearableData(patientId);
    const medications = await getMedications(patientId);

    // Summarize data for the prompt
    const moodDataSummary = 'Placeholder for mood data summary.'; // Replace with actual mood data summary
    const wearableDataSummary = `Heart Rate: ${wearableData.heartRateBpm} bpm, Sleep Quality: ${wearableData.sleepData.quality}, Steps: ${wearableData.movementData.stepCount}`;
    const medicationDataSummary = medications.map(med => `${med.name} (${med.dosage}, ${med.schedule})`).join('; ');
    const notes = 'Placeholder for notes.';
    const treatmentHistory = 'Placeholder for treatment history';
    const activities = 'Placeholder for activities';

    const {output} = await generatePatientInsightsPrompt({
      moodData: moodDataSummary,
      wearableData: wearableDataSummary,
      medicationData: medicationDataSummary,
      notes: notes,
      treatmentHistory: treatmentHistory,
      activities: activities,
    });
    return output!;
  }
);
