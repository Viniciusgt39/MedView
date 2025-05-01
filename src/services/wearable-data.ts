/**
 * Represents sleep data, including sleep quality and duration.
 */
export interface SleepData {
  /**
   * A description of sleep quality (e.g., "Bom", "Razoável", "Ruim").
   */
  quality: string;
  /**
   * The duration of sleep in hours.
   */
  durationHours: number;
}

/**
 * Represents movement data, including step count.
 */
export interface MovementData {
  /**
   * The number of steps taken.
   */
  stepCount: number;
}


/**
 * Represents a single snapshot of wearable sensor data at a specific time.
 */
export interface WearableData {
   /**
   * The timestamp when the data was recorded.
   */
  timestamp: Date;
  /**
   * The current heart rate in beats per minute (BPM). Optional as it might not always be available.
   */
  heartRateBpm?: number;
  /**
   * The heart rate variability in milliseconds (ms). Optional.
   */
  heartRateVariabilityMs?: number;
  /**
   * Electrodermal activity in microSiemens (µS). Optional.
   */
  edaMicrosiemens?: number;
  /**
   * Body temperature in degrees Celsius. Optional.
   */
  bodyTemperatureCelsius?: number;
  /**
   * An object containing sleep data, usually recorded once per day/sleep cycle. Optional.
   */
  sleepData?: SleepData;
  /**
   * An object containing movement data, like step count. Optional.
   */
  movementData?: MovementData;
}


/**
 * Asynchronously retrieves a list of wearable sensor data points for a given patient,
 * typically within a specified time range (though range not implemented in mock).
 *
 * @param patientId The ID of the patient for whom to retrieve wearable data.
 * @returns A promise that resolves to an array of WearableData objects, ordered by timestamp.
 */
export async function getWearableData(patientId: string): Promise<WearableData[]> {
   console.log(`Fetching wearable data for patient ${patientId}... (mock)`);
  // TODO: Implement this by calling an API, likely with date range parameters.
  // This mock generates data for the last 30 days.

  const data: WearableData[] = [];
  const now = new Date();
  let lastTemp = 36.5;
  let lastHr = 70 + Math.random() * 10; // Start with some variation
  let lastHrv = 55 + Math.random() * 15;
  let lastEda = 0.7 + Math.random() * 0.4;
  let lastSteps = 3000 + Math.random() * 4000;
  let lastSleep = 6.5 + Math.random() * 2;

  for (let i = 29; i >= 0; i--) { // Generate data for the last 30 days (index 0 = today)
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

    // Simulate some daily variation
    lastTemp += (Math.random() - 0.5) * 0.3;
    lastTemp = Math.max(35.8, Math.min(37.5, lastTemp));
    lastHr += (Math.random() - 0.5) * 8;
    lastHr = Math.max(55, Math.min(110, lastHr));
    lastHrv += (Math.random() - 0.5) * 10;
    lastHrv = Math.max(35, Math.min(100, lastHrv));
     lastEda += (Math.random() - 0.45) * 0.2; // Slightly more likely to increase?
    lastEda = Math.max(0.3, Math.min(1.5, lastEda));
    lastSteps = Math.max(500, lastSteps + randomInt(-1500, 2000));
    lastSleep += (Math.random() - 0.5) * 1;
    lastSleep = Math.max(4.5, Math.min(9.5, lastSleep));

    data.push({
      timestamp: timestamp,
      heartRateBpm: Math.round(lastHr),
      heartRateVariabilityMs: Math.round(lastHrv),
      edaMicrosiemens: parseFloat(lastEda.toFixed(1)),
      bodyTemperatureCelsius: parseFloat(lastTemp.toFixed(1)),
      // Only add sleep/steps data once per day (e.g., associate with the start of the day)
      sleepData: {
        quality: lastSleep > 7.5 ? 'Bom' : lastSleep > 6 ? 'Razoável' : 'Ruim',
        durationHours: parseFloat(lastSleep.toFixed(1)),
      },
      movementData: {
        stepCount: Math.round(lastSteps),
      },
    });
  }

   // Simulate API delay
   await new Promise(resolve => setTimeout(resolve, 70));

  return data; // Already sorted by generation logic (oldest first)
}
