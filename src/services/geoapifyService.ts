import axios from 'axios';

const GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v1';
const apiKey = process.env.REACT_APP_GEOAPIFY_API_KEY;

if (!apiKey) {
  console.error(
    'Geoapify API key is missing. Please set REACT_APP_GEOAPIFY_API_KEY environment variable.'
  );
}

/**
 * Generic function to make requests to the Geoapify API.
 * @param endpoint The API endpoint (e.g., '/geocode/search').
 * @param params URL parameters for the request.
 * @returns Promise<T> The API response data.
 */
async function geoapifyApiRequest<T>(endpoint: string, params: Record<string, any>): Promise<T> {
  if (!apiKey) {
    throw new Error('Geoapify API key is not configured.');
  }

  try {
    const response = await axios.get(`${GEOAPIFY_BASE_URL}${endpoint}`, {
      params: {
        ...params,
        apiKey,
      },
    });
    return response.data as T;
  } catch (error) {
    console.error(`Error calling Geoapify API endpoint ${endpoint}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        `Geoapify API Error: ${error.response.status} ${JSON.stringify(error.response.data)}`
      );
    }
    throw error;
  }
}

// --- Geocoding API --- //
interface GeocodingRequestParams {
  text?: string;
  housenumber?: string;
  street?: string;
  postcode?: string;
  city?: string;
  state?: string;
  country?: string;
  lang?: string;
  limit?: number;
  format?: 'json' | 'xml' | 'geojson';
  filter?: string;
  bias?: string;
  // ... add other params as needed from Geoapify docs
}

// Define a more specific response type based on Geoapify's Geocoding API documentation
// This is a simplified example; you'll need to expand it based on the actual API response structure.
interface GeocodingFeatureProperties {
  country: string;
  country_code: string;
  state: string;
  city: string;
  postcode: string;
  street: string;
  housenumber: string;
  lon: number;
  lat: number;
  formatted: string;
  address_line1: string;
  address_line2: string;
  // ... and many more properties
  [key: string]: any; // Allow other properties
}

interface GeocodingFeature {
  type: 'Feature';
  properties: GeocodingFeatureProperties;
  geometry: {
    type: string; // e.g., 'Point'
    coordinates: [number, number]; // [lon, lat]
  };
  bbox?: [number, number, number, number];
}

interface GeocodingResponse {
  type: 'FeatureCollection';
  features: GeocodingFeature[];
  query: Record<string, any>;
}

export const geocodeAddress = (params: GeocodingRequestParams): Promise<GeocodingResponse> => {
  return geoapifyApiRequest<GeocodingResponse>('/geocode/search', params);
};

// --- Reverse Geocoding API --- //
interface ReverseGeocodingRequestParams {
  lat: number;
  lon: number;
  lang?: string;
  limit?: number;
  format?: 'json' | 'xml' | 'geojson';
  filter?: string;
  type?: 'amenity' | 'building' | 'street'; // Example types
  // ... add other params as needed
}

// Response type for Reverse Geocoding would be similar to GeocodingResponse, focusing on features found at lat/lon
// You would typically expect one or a few features in the response.
export const reverseGeocode = (
  params: ReverseGeocodingRequestParams
): Promise<GeocodingResponse> => {
  return geoapifyApiRequest<GeocodingResponse>('/geocode/reverse', params);
};

// --- Places API --- //
interface PlacesRequestParams {
  categories: string; // e.g., "tourism.sights,commercial.shopping_mall"
  conditions?: string;
  filter?: string; // e.g., "circle:-0.12,51.5,5000" (lon,lat,radius_in_meters) or "rect:..." or "geometry:..."
  bias?: string; // e.g., "proximity:-0.12,51.5"
  lang?: string;
  limit?: number;
  // ... add other params
}

// The response for Places API is also a FeatureCollection, similar to GeocodingResponse
// but the properties within features will be specific to places (name, categories, etc.)
export const findPlaces = (params: PlacesRequestParams): Promise<GeocodingResponse> => {
  // Re-using GeocodingResponse for now, refine as needed
  return geoapifyApiRequest<GeocodingResponse>('/places', params);
};

// --- Place Details API --- //
interface PlaceDetailsRequestParams {
  id: string; // Place ID from other API calls
  lang?: string;
  // ... add other params
}

// Response for Place Details would again be a FeatureCollection, likely with a single feature containing rich details.
export const getPlaceDetails = (params: PlaceDetailsRequestParams): Promise<GeocodingResponse> => {
  // Re-using GeocodingResponse for now, refine as needed
  return geoapifyApiRequest<GeocodingResponse>('/place-details', params);
};

// --- Autocomplete API --- //
interface AutocompleteRequestParams {
  text: string;
  apiKey: string;
  type?: 'amenity' | 'city' | 'country' | 'postcode' | 'street' | 'housenumber';
  lang?: string;
  limit?: number;
  filter?: string;
  bias?: string;
  format?: string;
}

// Define a more specific response type based on Geoapify's Autocomplete API documentation
// This is a simplified example; you'll need to expand it based on the actual API response structure.
interface AutocompleteApiResponse {
  features: Array<{
    properties: {
      address_line1: string;
      address_line2: string;
      city: string;
      country: string;
      formatted: string;
      lat: number;
      lon: number;
      place_id: string;
      postcode: string;
      state: string;
      street: string;
      housenumber: string;
      // Include other relevant properties based on the API response
    };
    // Include other parts of the feature object if needed
  }>;
  // Include other parts of the response object if needed
}

export const autocompleteAddress = (
  params: AutocompleteRequestParams
): Promise<AutocompleteApiResponse> => {
  return geoapifyApiRequest<AutocompleteApiResponse>('/geocode/autocomplete', params);
};

// TODO: Add more functions for other Geoapify APIs as needed:
// - Routing API
// - Route Matrix API
// - Isoline API
// - Map Tiles (though these are usually URLs, a helper might be useful)
// - Static Maps API
// - etc.

// Example of how to define a more specific type for Place properties if needed later:
/*
interface PlaceFeatureProperties extends GeocodingFeatureProperties {
  name?: string;
  categories?: string[];
  website?: string;
  opening_hours?: string;
  // ... other place-specific details
}

interface PlaceFeature extends GeocodingFeature {
  properties: PlaceFeatureProperties;
}

interface PlacesResponse {
  type: 'FeatureCollection';
  features: PlaceFeature[];
  query: Record<string, any>;
}
*/
