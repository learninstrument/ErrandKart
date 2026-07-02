/**
 * A lightweight 1D Kalman Filter implementation for smoothing noisy GPS data.
 * We apply this separately to Latitude and Longitude to remove erratic "teleporting".
 */
export class KalmanFilter {
  private r: number; // Measurement noise (e.g., GPS accuracy from device)
  private q: number; // Process noise (how fast we expect the runner to actually move)
  private a: number; // State vector multiplier
  private b: number; // Control vector multiplier
  private c: number; // Measurement vector multiplier

  private cov: number; // Covariance
  private x: number; // State (estimated value)

  /**
   * @param r Measurement noise (typically initial GPS accuracy)
   * @param q Process noise (lower means smoother but slower to react to turns)
   */
  constructor(r: number = 1, q: number = 0.1) {
    this.r = r;
    this.q = q;
    this.a = 1;
    this.b = 0;
    this.c = 1;

    this.cov = NaN;
    this.x = NaN; // Initial state is unknown
  }

  /**
   * Filter a new measurement
   * @param z The new raw measurement (e.g., raw latitude)
   * @param u Optional control input (usually 0 for GPS)
   * @returns The smoothed estimate
   */
  public filter(z: number, u: number = 0): number {
    if (isNaN(this.x)) {
      this.x = (1 / this.c) * z;
      this.cov = (1 / this.c) * this.r * (1 / this.c);
    } else {
      // Predict
      const predX = this.a * this.x + this.b * u;
      const predCov = this.a * this.cov * this.a + this.q;

      // Update
      const k = predCov * this.c * (1 / (this.c * predCov * this.c + this.r));
      this.x = predX + k * (z - this.c * predX);
      this.cov = predCov - k * this.c * predCov;
    }
    return this.x;
  }
}

/**
 * Helper class to manage 2D Coordinates (Latitude & Longitude)
 */
export class GPSKalmanFilter {
  private latFilter: KalmanFilter;
  private lngFilter: KalmanFilter;

  constructor(processNoise: number = 0.00001) {
    // Process noise for lat/lng is very small because coordinates are tiny decimals.
    // 0.00001 roughly equals ~1 meter of expected variance per update.
    this.latFilter = new KalmanFilter(0.0001, processNoise);
    this.lngFilter = new KalmanFilter(0.0001, processNoise);
  }

  /**
   * Feed raw GPS coordinates and get smoothed coordinates back.
   * @param lat Raw Latitude
   * @param lng Raw Longitude
   * @param accuracy GPS accuracy from the device (in meters). We convert it to a scaled measurement noise.
   */
  public filter(lat: number, lng: number, accuracy: number = 10): { lat: number; lng: number } {
    // Scale accuracy (meters) to approximate coordinate degrees
    // 1 degree ~ 111,320 meters. So 10 meters ~ 0.000089 degrees.
    const noise = Math.max(0.00001, accuracy / 111320);
    
    // Dynamically update measurement noise based on device's reported accuracy
    (this.latFilter as any).r = noise;
    (this.lngFilter as any).r = noise;

    const smoothedLat = this.latFilter.filter(lat);
    const smoothedLng = this.lngFilter.filter(lng);

    return { lat: smoothedLat, lng: smoothedLng };
  }
}
