'use server';
/**
 * @fileOverview AI-powered tool for doctors to analyze patient data (mood, activity, meds) and highlight potential issues or suggest treatment adjustments, presented as a brief summary.
 *
 * - generateInsights - A function that handles the patient insights generation process for doctors.
 * - GenerateInsightsInput - The input type for the generateInsights function.
 * - GenerateInsightsOutput - The return type for the generateInsights function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
// Assuming these services fetch relevant data for the given patientId
import { getMockPatientProfile } from '@/types/patient'; // Use the comprehensive mock function
// import { getMedications } from '@/services/medication'; // Included in getMockPatientProfile
// import { getWearableData } from '@/services/wearable-data'; // Included in getMockPatientProfile


const GenerateInsightsInputSchema = z.object({
  patientId: z.string().describe('The ID of the patient to generate insights for.'),
});
export type GenerateInsightsInput = z.infer<typeof GenerateInsightsInputSchema>;

const GenerateInsightsOutputSchema = z.object({
  insights: z.string().describe('A brief summary of insights for the doctor based on the patient data.'),
});
export type GenerateInsightsOutput = z.infer<typeof GenerateInsightsOutputSchema>;

// Exported function to be called from the UI
export async function generateInsights(input: GenerateInsightsInput): Promise<GenerateInsightsOutput> {
  // Add validation if needed before calling the flow
  GenerateInsightsInputSchema.parse(input);
  return generateInsightsFlow(input);
}

// Define the prompt for the AI model
const generateInsightsPrompt = ai.definePrompt({
  name: 'generateDoctorInsightsPrompt', // Renamed for clarity
  input: {
    schema: z.object({
      patientName: z.string().describe('The name of the patient.'),
      moodDataSummary: z.string().describe('Summary of the patient\'s recent mood check-ins (e.g., last 5 entries, overall trend).'),
      wearableDataSummary: z.string().describe('Summary of the patient\'s recent wearable data (e.g., trends in HR, sleep, steps over the last week).'),
      medicationDataSummary: z.string().describe('Summary of the patient\'s current medication list and reported adherence percentage.'),
      notesSummary: z.string().describe('Brief summary of recent clinical notes relevant to current status.'),
      treatmentHistorySummary: z.string().describe('Brief summary of recent significant treatment events (e.g., crises, achievements, medication changes).')
    }),
  },
  output: {
    schema: z.object({
      insights: z.string().describe('A brief summary of insights for the doctor, highlighting potential issues or suggesting areas for discussion/adjustment. Should be 2-3 concise sentences.'),
    }),
  },
  // Updated prompt tailored for doctor's perspective
  prompt: `Você é um assistente de IA ajudando um médico a analisar dados de pacientes para identificar rapidamente possíveis problemas ou áreas que precisam de atenção.

  Analise os seguintes dados resumidos do paciente "{{patientName}}" e forneça um resumo conciso (2-3 frases) para o médico. Destaque quaisquer tendências preocupantes, correlações notáveis ​​(por exemplo, baixo humor correlacionado com sono ruim) ou possíveis sugestões para discussão ou ajuste do tratamento. NÃO forneça diagnósticos ou conselhos médicos diretos. Concentre-se em apresentar os dados de forma útil para o médico.

  Resumo dos Dados do Paciente:
  - Humor Recente: {{{moodDataSummary}}}
  - Dados Vestíveis Recentes: {{{wearableDataSummary}}}
  - Medicações e Adesão: {{{medicationDataSummary}}}
  - Notas Clínicas Recentes: {{{notesSummary}}}
  - Histórico de Tratamento Recente: {{{treatmentHistorySummary}}}

  Insights Concisos para o Médico:`,
});

// Define the Genkit flow
const generateInsightsFlow = ai.defineFlow<
  typeof GenerateInsightsInputSchema,
  typeof GenerateInsightsOutputSchema
>(
  {
    name: 'generateDoctorInsightsFlow', // Renamed for clarity
    inputSchema: GenerateInsightsInputSchema,
    outputSchema: GenerateInsightsOutputSchema,
  },
  async (input) => {
    const { patientId } = input;

    // Fetch comprehensive patient data using the mock profile function
    const patientProfile = await getMockPatientProfile(patientId);

    if (!patientProfile) {
      throw new Error(`Paciente com ID ${patientId} não encontrado.`);
    }

    // --- Summarize data for the prompt ---

    // Mood Data Summary (e.g., last 3 check-ins and trend)
    const recentMoods = patientProfile.moodCheckins.slice(0, 3).map(m => `${m.mood} (${format(m.timestamp, 'dd/MM')})`).join(', ');
    const moodDataSummary = `Últimos check-ins: ${recentMoods || 'Nenhum recente'}. Tendência geral: ${patientProfile.moodTrend || 'estável'}.`;

    // Wearable Data Summary (e.g., Avg HR, Last Sleep, Avg Steps for last 7 days)
     const last7DaysWearable = patientProfile.wearableData.slice(-7);
     const avgHr = last7DaysWearable.length > 0 ? (last7DaysWearable.reduce((sum, d) => sum + d.heartRateBpm, 0) / last7DaysWearable.length).toFixed(0) : 'N/A';
     const lastSleep = last7DaysWearable[last7DaysWearable.length - 1]?.sleepData;
     const avgSteps = last7DaysWearable.length > 0 ? (last7DaysWearable.reduce((sum, d) => sum + d.movementData.stepCount, 0) / last7DaysWearable.length).toFixed(0) : 'N/A';
     const wearableDataSummary = `Média FC (7d): ${avgHr} bpm. Último Sono: ${lastSleep?.durationHours ?? 'N/A'}h (${lastSleep?.quality ?? 'N/A'}). Média Passos (7d): ${avgSteps}.`;


    // Medication Data Summary
    const medicationDataSummary = patientProfile.medications.map(med => `${med.name} (${med.dosage})`).join(', ') + `. Adesão geral relatada: ${patientProfile.medicationAdherence ?? 'N/A'}%.`;

    // Notes Summary (e.g., titles of last 2 notes)
     const recentNotes = patientProfile.notes.slice(0, 2).map(n => n.title).join('; ');
     const notesSummary = recentNotes || 'Nenhuma nota recente.';

     // Treatment History Summary (e.g., types of last 3 events)
     const recentHistory = patientProfile.treatmentHistory.slice(0, 3).map(e => `${e.type}: ${e.description.substring(0, 30)}...`).join('; ');
     const treatmentHistorySummary = recentHistory || 'Nenhum evento recente.';


    // --- Generate insights using the AI prompt ---
    try {
      const result = await generateInsightsPrompt({
        patientName: patientProfile.name,
        moodDataSummary: moodDataSummary,
        wearableDataSummary: wearableDataSummary,
        medicationDataSummary: medicationDataSummary,
        notesSummary: notesSummary,
        treatmentHistorySummary: treatmentHistorySummary
      });

       if (!result.output) {
           throw new Error("A resposta da IA estava vazia.");
       }

      return result.output;

    } catch (error) {
         console.error("Erro durante a chamada da IA para gerar insights:", error);
         // Rethrow or handle specific errors
         if (error instanceof Error) {
             throw new Error(`Falha ao gerar insights: ${error.message}`);
         } else {
             throw new Error("Ocorreu um erro desconhecido ao gerar insights.");
         }
    }
  }
);
