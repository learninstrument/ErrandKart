/**
 * Location Filter — Outlier rejection based on accuracy and plausible speed.
 * 
 * Per the research: "reject any ping with accuracy worse than ~30–50m,
 * or implying an impossible speed for the current transport_mode."
 * This alone removes most visible glitches WITHOUT a Kalman filter.
 */

export type TransportMode = 'foot' | 'bike' | 'vehicle';

/** Maximum plausible speed in meters/second for each transport mode */
const MAX_SPEED: Record<TransportMode, number> = {
  foot: 2.5,     // ~9 km/h — fast walking/jogging
  bike: 8,       // ~29 km/h
  vehicle: 30,   // ~108 km/h
};

/** Maximum acceptable GPS accuracy in meters before we reject the point */
const MAX_ACCURACY_METERS = 50;

/** Minimum time between pings (ms) to avoid division-by-zero in speed calc */
const MIN_PING_INTERVAL_MS = 500;

interface FilteredPoint {
  lat: number;
  lng: number;
  timestamp: number;
  accepted: boolean;
  speed?: number; // m/s if calculated
}

interface LastKnown {
  lat: number;
  lng: number;
  timestamp: number;
}

/**
 * Haversine distance between two lat/lng points in meters.
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLng = (lng2 - lng1) * toRad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Stateful location filter that rejects outlier GPS points.
 * Create one instance per tracking session and feed it every raw GPS reading.
 */
export class LocationFilter {
  private lastKnown: LastKnown | null = null;
  private transportMode: TransportMode = 'foot';

  constructor(initialMode: TransportMode = 'foot') {
    this.transportMode = initialMode;
  }

  setTransportMode(mode: TransportMode) {
    this.transportMode = mode;
  }

  getTransportMode(): TransportMode {
    return this.transportMode;
  }

  /**
   * Feed a raw GPS point. Returns a FilteredPoint indicating whether
   * the point was accepted or rejected, and the calculated speed.
   */
  filter(lat: number, lng: number, accuracy: number): FilteredPoint {
    const now = Date.now();

    // Rule 1: Reject if accuracy is too poor
    if (accuracy > MAX_ACCURACY_METERS) {
      return { lat, lng, timestamp: now, accepted: false };
    }

    // First point is always accepted
    if (!this.lastKnown) {
      this.lastKnown = { lat, lng, timestamp: now };
      return { lat, lng, timestamp: now, accepted: true };
    }

    // Rule 2: Check speed plausibility
    const dt = now - this.lastKnown.timestamp;
    if (dt < MIN_PING_INTERVAL_MS) {
      // Too fast between pings — likely duplicate, accept but don't update lastKnown
      return { lat, lng, timestamp: now, accepted: true, speed: 0 };
    }

    const distance = haversineDistance(this.lastKnown.lat, this.lastKnown.lng, lat, lng);
    const speed = distance / (dt / 1000); // m/s

    const maxSpeed = MAX_SPEED[this.transportMode];

    if (speed > maxSpeed) {
      // This point implies teleportation — reject it
      console.warn(`[LocationFilter] Rejecting point: speed=${speed.toFixed(1)}m/s exceeds max=${maxSpeed}m/s for mode=${this.transportMode}`);
      return { lat, lng, timestamp: now, accepted: false, speed };
    }

    // Point is valid — update last known
    this.lastKnown = { lat, lng, timestamp: now };
    return { lat, lng, timestamp: now, accepted: true, speed };
  }

  /**
   * Auto-detect transport mode based on rolling average speed.
   * Call this with the last 3-5 speed readings.
   * Returns the suggested mode (manual toggle always overrides).
   */
  static detectMode(recentSpeeds: number[]): TransportMode {
    if (recentSpeeds.length === 0) return 'foot';
    
    const avg = recentSpeeds.reduce((a, b) => a + b, 0) / recentSpeeds.length;

    // Thresholds with hysteresis to avoid flickering
    if (avg > 10) return 'vehicle';  // >36 km/h sustained
    if (avg > 4) return 'bike';      // >14 km/h sustained
    return 'foot';
  }
}
