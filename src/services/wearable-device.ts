/**
 * Represents wearable device data.
 */
export interface WearableData {
  /**
   * Body temperature in Celsius.
   */
  bodyTemperatureCelsius: number;
  /**
   * Sleep data represented as a number between 0 and 1 (inclusive) where 0 is not good and 1 is good.
   */
  sleepQuality: number;
  /**
   * Number of steps taken.
   */
  steps: number;
  /**
   * Heart rate variability in milliseconds.
   */
  heartRateVariabilityMs: number;
  /**
   * Electrodermal activity in microSiemens.
   */
  electrodermalActivityMicroS: number;
  /**
   * Heart rate in beats per minute.
   */
  heartRateBpm: number;
}

/**
 * Retrieves wearable device data.
 * @returns A promise that resolves to wearable data.
 */
export async function getWearableData(): Promise<WearableData> {
  // TODO: Implement this by calling an API.
  return {
    bodyTemperatureCelsius: 37,
    sleepQuality: 0.8,
    steps: 5000,
    heartRateVariabilityMs: 75,
    electrodermalActivityMicroS: 0.9,
    heartRateBpm: 80,
  };
}
