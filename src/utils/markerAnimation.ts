/**
 * Minimal interface for a marker that can be animated.
 * Duck-typed to avoid importing the full mapbox-gl namespace.
 */
interface AnimatableMarker {
  getLngLat(): { lng: number; lat: number };
  setLngLat(lngLat: [number, number]): void;
}

/**
 * Smoothly animate a Mapbox marker from its current position to a new position.
 * Uses requestAnimationFrame + linear interpolation (lerp) instead of direct snapping.
 * 
 * This mirrors Uber's approach: drivers send GPS pings every few seconds,
 * and the client interpolates the marker between pings for a smooth visual.
 * 
 * @param marker - The Mapbox GL marker to animate
 * @param toCoords - Target [lng, lat] coordinates
 * @param durationMs - Animation duration in milliseconds (default 1000ms matches typical ping interval)
 */
export function animateMarkerTo(
  marker: AnimatableMarker,
  toCoords: [number, number],
  durationMs: number = 1000
): void {
  const from = marker.getLngLat();
  const fromCoords: [number, number] = [from.lng, from.lat];

  // If the marker hasn't been placed yet (0,0), just snap immediately
  if (fromCoords[0] === 0 && fromCoords[1] === 0) {
    marker.setLngLat(toCoords);
    return;
  }

  // If the distance is negligible, don't bother animating
  const dlng = toCoords[0] - fromCoords[0];
  const dlat = toCoords[1] - fromCoords[1];
  if (Math.abs(dlng) < 0.0000001 && Math.abs(dlat) < 0.0000001) {
    return;
  }

  const start = performance.now();

  function frame(now: number) {
    const elapsed = now - start;
    const t = Math.min(elapsed / durationMs, 1);

    // Ease-out cubic for a more natural deceleration feel
    const eased = 1 - Math.pow(1 - t, 3);

    const lng = fromCoords[0] + dlng * eased;
    const lat = fromCoords[1] + dlat * eased;

    marker.setLngLat([lng, lat]);

    if (t < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

/**
 * Calculate the bearing (heading) between two [lng, lat] points.
 * Returns degrees from north (0-360).
 * Lightweight alternative to turf.bearing for simple cases.
 */
export function calcBearing(from: [number, number], to: [number, number]): number {
  const toRad = Math.PI / 180;
  const lng1 = from[0] * toRad;
  const lng2 = to[0] * toRad;
  const lat1 = from[1] * toRad;
  const lat2 = to[1] * toRad;

  const dLng = lng2 - lng1;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const bearing = Math.atan2(y, x) * (180 / Math.PI);

  return (bearing + 360) % 360;
}
