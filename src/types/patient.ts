import type { WearableData } from '@/services/wearable-data';
import type { Medication } from '@/services/medication';

export interface PatientSummary {
  id: string;
  name: string;
  lastMood?: string; // e.g., 'Happy', 'Anxious'
  moodTrend?: 'up' | 'down' | 'stable';
  recentActivity?: string; // e.g., 'Focus Timer Used', 'Breathing Exercise'
  medicationAdherence?: number; // Percentage, e.g., 85
  lastCheckin?: Date;
}

// Extended Medication type for UI state
export interface UIMedication extends Medication {
    id: string; // Add an ID for list rendering
    remindersEnabled: boolean;
}


export interface MoodCheckin {
  id: string;
  timestamp: Date;
  mood: string;
  symptoms: string[];
  notes?: string;
}

export interface Note {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  content: string;
}

export interface TreatmentEvent {
  id: string;
  timestamp: Date;
  type: 'moodCheckin' | 'medication' | 'note' | 'activity' | 'insight' | 'crisis' | 'achievement';
  description: string;
  details?: any; // Could store specific data related to the event type
}

export interface PatientProfile extends PatientSummary {
  dateJoined: Date;
  wearableData: WearableData[]; // Array of historical data
  moodCheckins: MoodCheckin[];
  medications: UIMedication[]; // Use UIMedication type
  notes: Note[];
  treatmentHistory: TreatmentEvent[];
  aiInsights?: string; // Store latest AI insight summary
}

// Mock data functions (replace with actual API calls later)

let mockPatientCounter = 0;
const generateMockId = (prefix = 'pat') => `${prefix}_${++mockPatientCounter}`;
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};
const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const moods = ['Feliz', 'Calmo', 'Ansioso', 'Triste', 'Irritado', 'Estressado'];
const activities = ['Usou Timer de Foco', 'Exercício de Respiração', 'Tomou Medicação', 'Anotação Rápida', 'Caminhada Leve'];
const symptoms = ['Dor de cabeça', 'Fadiga', 'Insônia', 'Falta de apetite', 'Náusea', 'Tontura'];

export const mockPatientSummaries: PatientSummary[] = [
  { id: generateMockId(), name: 'Ana Silva', lastMood: 'Calmo', moodTrend: 'stable', recentActivity: 'Usou Timer de Foco', medicationAdherence: 90, lastCheckin: randomDate(new Date(2024, 5, 1), new Date()) },
  { id: generateMockId(), name: 'Bruno Costa', lastMood: 'Ansioso', moodTrend: 'down', recentActivity: 'Exercício de Respiração', medicationAdherence: 75, lastCheckin: randomDate(new Date(2024, 5, 1), new Date()) },
  { id: generateMockId(), name: 'Carla Dias', lastMood: 'Feliz', moodTrend: 'up', recentActivity: 'Tomou Medicação', medicationAdherence: 100, lastCheckin: randomDate(new Date(2024, 5, 1), new Date()) },
  { id: generateMockId(), name: 'Daniel Martins', lastMood: 'Triste', moodTrend: 'stable', recentActivity: 'Anotação Rápida', medicationAdherence: 80, lastCheckin: randomDate(new Date(2024, 5, 1), new Date()) },
  { id: generateMockId(), name: 'Eduarda Ferreira', lastMood: 'Estressado', moodTrend: 'down', recentActivity: 'Usou Timer de Foco', medicationAdherence: 60, lastCheckin: randomDate(new Date(2024, 5, 1), new Date()) },
  { id: generateMockId(), name: 'Fábio Gomes', lastMood: 'Calmo', moodTrend: 'up', recentActivity: 'Caminhada Leve', medicationAdherence: 95, lastCheckin: randomDate(new Date(2024, 5, 1), new Date()) },
];

const generateMockWearableData = (count: number): WearableData[] => {
  const data: WearableData[] = [];
  let lastTemp = 36.5;
  let lastHr = 75;
  let lastHrv = 60;
  let lastEda = 0.8;
  let lastSteps = 5000;
  let lastSleep = 7;

  for (let i = 0; i < count; i++) {
    lastTemp += (Math.random() - 0.5) * 0.4; // Small fluctuations
    lastTemp = Math.max(35.5, Math.min(37.8, lastTemp)); // Clamp temp
    lastHr += randomInt(-5, 5);
    lastHr = Math.max(55, Math.min(115, lastHr)); // Clamp HR
    lastHrv += randomInt(-8, 8);
    lastHrv = Math.max(30, Math.min(110, lastHrv)); // Clamp HRV
    lastEda += (Math.random() - 0.5) * 0.3;
    lastEda = Math.max(0.2, Math.min(1.8, lastEda)); // Clamp EDA
    lastSteps += randomInt(-1000, 1500);
    lastSteps = Math.max(500, lastSteps); // Min steps
    lastSleep += (Math.random() - 0.5) * 1.5;
    lastSleep = Math.max(4, Math.min(10, lastSleep)); // Clamp sleep


    data.push({
      timestamp: new Date(Date.now() - (count - i) * 24 * 60 * 60 * 1000), // Timestamp for each day
      heartRateBpm: lastHr,
      heartRateVariabilityMs: lastHrv,
      edaMicrosiemens: parseFloat(lastEda.toFixed(1)),
      bodyTemperatureCelsius: parseFloat(lastTemp.toFixed(1)),
      sleepData: {
        quality: lastSleep > 7.5 ? 'Bom' : lastSleep > 6 ? 'Razoável' : 'Ruim',
        durationHours: parseFloat(lastSleep.toFixed(1)),
      },
      movementData: {
        stepCount: lastSteps,
      },
    });
  }
  return data;
}


const generateMockMoodCheckins = (count: number): MoodCheckin[] => {
  const data: MoodCheckin[] = [];
  for (let i = 0; i < count; i++) {
    data.push({
      id: generateMockId('mc'),
      timestamp: randomDate(new Date(2024, 0, 1), new Date()),
      mood: randomElement(moods),
      symptoms: Array.from({ length: randomInt(0, 3) }, () => randomElement(symptoms)),
      notes: Math.random() > 0.7 ? `Observação sobre o humor ${i}` : undefined,
    });
  }
  return data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

const generateMockMedications = (): UIMedication[] => {
  return [
    { id: generateMockId('med'), name: 'Sertralina', dosage: '50mg', schedule: 'Manhã', remindersEnabled: true },
    { id: generateMockId('med'), name: 'Ritalina LA', dosage: '20mg', schedule: 'Manhã', remindersEnabled: true },
    { id: generateMockId('med'), name: 'Clonazepam', dosage: '0.5mg', schedule: 'Noite', remindersEnabled: false },
  ];
}

const generateMockNotes = (count: number): Note[] => {
    const data: Note[] = [];
    for (let i = 0; i < count; i++) {
        const createdAt = randomDate(new Date(2024, 0, 1), new Date());
        data.push({
            id: generateMockId('note'),
            createdAt: createdAt,
            updatedAt: Math.random() > 0.3 ? createdAt : randomDate(createdAt, new Date()),
            title: `Nota Clínica ${i + 1}`,
            content: `Paciente relatou [sintoma ou evento]. Discutido [plano ou intervenção]. Próximos passos incluem [ação]. Observações adicionais: [detalhes].`
        });
    }
    return data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

const generateMockTreatmentHistory = (moodCheckins: MoodCheckin[], notes: Note[]): TreatmentEvent[] => {
    const events: TreatmentEvent[] = [];

    moodCheckins.forEach(mc => {
        events.push({
            id: generateMockId('evt_mc'),
            timestamp: mc.timestamp,
            type: 'moodCheckin',
            description: `Check-in Emocional: ${mc.mood}`,
            details: mc,
        });
    });

     notes.forEach(note => {
        events.push({
            id: generateMockId('evt_note'),
            timestamp: note.createdAt,
            type: 'note',
            description: `Anotação Adicionada: ${note.title}`,
            details: note,
        });
    });

    // Add some mock activity/medication/other events
     for (let i = 0; i < 15; i++) {
         const type = randomElement(['medication', 'activity', 'insight', 'crisis', 'achievement'] as TreatmentEvent['type'][]);
         let description = '';
         switch(type) {
            case 'medication': description = 'Medicação registrada como tomada'; break;
            case 'activity': description = `Atividade Realizada: ${randomElement(activities)}`; break;
            case 'insight': description = 'Insight de IA: Sugestão de monitoramento de sono'; break;
            case 'crisis': description = 'Relato de momento de crise/ansiedade elevada'; break;
            case 'achievement': description = 'Conquista: Meta de passos atingida'; break;
         }
        events.push({
            id: generateMockId('evt_other'),
            timestamp: randomDate(new Date(2024, 0, 1), new Date()),
            type: type,
            description: description,
        });
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}


export const getMockPatientProfile = async (patientId: string): Promise<PatientProfile | null> => {
  const summaryIndex = mockPatientSummaries.findIndex(p => p.id === patientId);
  const summary = summaryIndex !== -1 ? mockPatientSummaries[summaryIndex] : null;

  if (!summary) return null;

  // Use index to slightly vary data per patient for demo purposes
  const moodCheckins = generateMockMoodCheckins(15 + summaryIndex);
  const notes = generateMockNotes(3 + Math.floor(summaryIndex/2));
  const treatmentHistory = generateMockTreatmentHistory(moodCheckins, notes);

  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay

  return {
    ...summary,
    dateJoined: randomDate(new Date(2023, 0, 1), new Date(2024, 0, 1)),
    wearableData: generateMockWearableData(30), // Last 30 readings
    moodCheckins: moodCheckins,
    medications: generateMockMedications(),
    notes: notes,
    treatmentHistory: treatmentHistory,
    aiInsights: summaryIndex % 2 === 0
      ? "Paciente demonstra melhora na estabilidade do humor, mas a adesão à medicação 'Ritalina LA' precisa de atenção. Monitorar níveis de estresse nos próximos dias."
      : "Dados recentes sugerem uma melhora na qualidade do sono. A tendência do humor está estável. Recomenda-se continuar monitorando a atividade física e os check-ins emocionais.", // Example insights
  };
};

export const getMockPatientSummaries = async (): Promise<PatientSummary[]> => {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 30)); // 30ms delay
    // Reset counter for fresh IDs if needed, or manage state differently
    mockPatientCounter = 0; // Reset for predictable IDs if called multiple times
    // Regenerate summaries with new IDs if needed
    const summaries = [
      { id: generateMockId(), name: 'Ana Silva', lastMood: 'Calmo', moodTrend: 'stable', recentActivity: 'Usou Timer de Foco', medicationAdherence: 90, lastCheckin: randomDate(new Date(2024, 5, 1), new Date()) },
      { id: generateMockId(), name: 'Bruno Costa', lastMood: 'Ansioso', moodTrend: 'down', recentActivity: 'Exercício de Respiração', medicationAdherence: 75, lastCheckin: randomDate(new Date(2024, 5, 1), new Date()) },
      { id: generateMockId(), name: 'Carla Dias', lastMood: 'Feliz', moodTrend: 'up', recentActivity: 'Tomou Medicação', medicationAdherence: 100, lastCheckin: randomDate(new Date(2024, 5, 1), new Date()) },
      { id: generateMockId(), name: 'Daniel Martins', lastMood: 'Triste', moodTrend: 'stable', recentActivity: 'Anotação Rápida', medicationAdherence: 80, lastCheckin: randomDate(new Date(2024, 5, 1), new Date()) },
      { id: generateMockId(), name: 'Eduarda Ferreira', lastMood: 'Estressado', moodTrend: 'down', recentActivity: 'Usou Timer de Foco', medicationAdherence: 60, lastCheckin: randomDate(new Date(2024, 5, 1), new Date()) },
      { id: generateMockId(), name: 'Fábio Gomes', lastMood: 'Calmo', moodTrend: 'up', recentActivity: 'Caminhada Leve', medicationAdherence: 95, lastCheckin: randomDate(new Date(2024, 5, 1), new Date()) },
      { id: generateMockId(), name: 'Gabriela Lima', lastMood: 'Irritado', moodTrend: 'down', recentActivity: 'Nenhuma', medicationAdherence: 88, lastCheckin: randomDate(new Date(2024, 5, 1), new Date()) },
      { id: generateMockId(), name: 'Hugo Mendes', lastMood: 'Feliz', moodTrend: 'stable', recentActivity: 'Exercício de Respiração', medicationAdherence: 92, lastCheckin: randomDate(new Date(2024, 5, 1), new Date()) },
    ];
    // Update the global mock array if necessary, or just return the new list
    // Object.assign(mockPatientSummaries, summaries); // If you want to update the global array in place
    return summaries;
}
