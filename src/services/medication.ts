/**
 * Represents base medication information (as potentially stored in a DB).
 */
export interface Medication {
  /**
   * Unique identifier for the medication entry.
   */
  id: string;
  /**
   * The name of the medication.
   */
  name: string;
  /**
   * The dosage of the medication (e.g., "100mg", "10mg/5ml").
   */
  dosage: string;
  /**
   * The schedule for taking the medication (e.g., "Manhã", "Antes de dormir").
   */
  schedule: string;
   /**
   * Indicates if reminders are enabled for this medication.
   */
  remindersEnabled: boolean;
  /**
   * ID of the patient this medication belongs to.
   */
  patientId: string;
   /**
   * Date the medication was added or prescribed.
   */
  addedAt: Date;
}

/**
 * Retrieves a list of medications for a specific patient.
 * In a real app, this would fetch from a database based on patientId.
 * @param patientId The ID of the patient.
 * @returns A promise that resolves to an array of medications for the patient.
 */
export async function getMedications(patientId: string): Promise<Medication[]> {
  console.log(`Fetching medications for patient ${patientId}... (mock)`);
  // TODO: Replace with actual API/database call filtered by patientId.
  // For now, return a static list or filter a larger mock list if available.
  const allMockMeds = [
     { id: 'med_1', patientId: 'pat_1', name: 'Sertralina', dosage: '50mg', schedule: 'Manhã', remindersEnabled: true, addedAt: new Date(2024, 1, 15) },
     { id: 'med_2', patientId: 'pat_1', name: 'Clonazepam', dosage: '0.5mg', schedule: 'Noite', remindersEnabled: false, addedAt: new Date(2024, 1, 15) },
     { id: 'med_3', patientId: 'pat_2', name: 'Ritalina LA', dosage: '20mg', schedule: 'Manhã', remindersEnabled: true, addedAt: new Date(2024, 3, 1) },
     { id: 'med_4', patientId: 'pat_3', name: 'Venlafaxina', dosage: '75mg', schedule: 'Manhã', remindersEnabled: true, addedAt: new Date(2023, 11, 10) },
     { id: 'med_5', patientId: 'pat_4', name: 'Escitalopram', dosage: '10mg', schedule: 'Manhã', remindersEnabled: true, addedAt: new Date(2024, 0, 5) },
     { id: 'med_6', patientId: 'pat_5', name: 'Quetiapina', dosage: '25mg', schedule: 'Noite', remindersEnabled: false, addedAt: new Date(2024, 4, 20) },
     { id: 'med_7', patientId: 'pat_6', name: 'Atenolol', dosage: '50mg', schedule: 'Manhã', remindersEnabled: true, addedAt: new Date(2024, 2, 28) },
  ];

   // Simulate API delay
   await new Promise(resolve => setTimeout(resolve, 40));

  return allMockMeds.filter(med => med.patientId === patientId);
}

/**
 * Adds a new medication for a patient.
 * In a real app, this would send data to a backend API.
 * @param medicationData Data for the new medication (excluding id, patientId, addedAt which backend would handle).
 * @param patientId The ID of the patient.
 * @returns A promise that resolves to the newly created Medication object (including generated ID).
 */
export async function addMedication(
    medicationData: Omit<Medication, 'id' | 'patientId' | 'addedAt'>,
    patientId: string
): Promise<Medication> {
    console.log(`Adding medication for patient ${patientId}:`, medicationData);
    // TODO: Replace with actual API call.
    const newMed: Medication = {
        ...medicationData,
        id: `med_${Date.now()}`, // Simple mock ID
        patientId: patientId,
        addedAt: new Date(),
    };
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 60));
    return newMed;
}

// Add functions for updating and deleting medications as needed...
// export async function updateMedication(medicationId: string, updates: Partial<Medication>): Promise<Medication> { ... }
// export async function deleteMedication(medicationId: string): Promise<void> { ... }
