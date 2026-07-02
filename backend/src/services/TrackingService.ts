import { HttpError } from '../utils/http-error.js';

export class TrackingService {
  /**
   * Snaps a series of raw GPS coordinates to the road network using Mapbox Map Matching API (HMM).
   * @param coordinates Array of [longitude, latitude] arrays representing the recent path.
   * @returns The snapped coordinates and the matched GeoJSON geometry.
   */
  static async matchPath(coordinates: [number, number][]) {
    if (!coordinates || coordinates.length < 2) {
      throw new HttpError(400, 'Map matching requires at least 2 coordinate points.');
    }

    // Mapbox requires up to 100 coordinates per request. If we have more, we should trim or sample.
    const coordsToMatch = coordinates.slice(-100);
    const coordinatesString = coordsToMatch.map(c => `${c[0]},${c[1]}`).join(';');
    // We check process.env.MAPBOX_TOKEN (if they define it in backend/.env) or fallback to frontend's if available
    const token = process.env.MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN;

    if (!token) {
      throw new HttpError(500, 'Mapbox token is not configured on the server.');
    }

    const url = `https://api.mapbox.com/matching/v5/mapbox/driving/${coordinatesString}?geometries=geojson&radiuses=${coordsToMatch.map(() => 25).join(';')}&access_token=${token}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Mapbox API returned status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.code !== 'Ok' || !data.matchings || data.matchings.length === 0) {
        // If it cannot match, return the raw points as a fallback
        return {
          snapped: false,
          geometry: {
            type: 'LineString',
            coordinates: coordsToMatch
          },
          currentLocation: coordsToMatch[coordsToMatch.length - 1]
        };
      }

      const match = data.matchings[0];
      const snappedCoords = match.geometry.coordinates;

      return {
        snapped: true,
        geometry: match.geometry,
        currentLocation: snappedCoords[snappedCoords.length - 1] // The most recent snapped point
      };
    } catch (error) {
      console.error('[TrackingService] Map Matching failed:', error);
      throw new HttpError(500, 'Failed to process map matching');
    }
  }

  /**
   * Generates A* directions from a series of coordinates (e.g., runner -> pickup -> dropoff).
   * @param coordsString Semicolon-separated coordinate string (lng,lat;lng,lat)
   */
  static async getDirections(coordsString: string) {
    const token = process.env.MAPBOX_TOKEN || process.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      throw new HttpError(500, 'Mapbox token is not configured on the server.');
    }

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsString}?geometries=geojson&access_token=${token}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Mapbox API returned status ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      return {
        geometry: data.routes[0].geometry,
        duration: data.routes[0].duration, // Estimated Time in seconds
        distance: data.routes[0].distance  // Distance in meters
      };
    } catch (error) {
      console.error('[TrackingService] Directions failed:', error);
      throw new HttpError(500, 'Failed to process directions');
    }
  }
}
