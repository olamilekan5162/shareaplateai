/**
 * Location Constants
 *
 * Centralized list of allowed locations for the ShareAplate AI platform.
 * These locations are used across:
 * - User registration (donor & recipient profiles)
 * - Food listing creation
 * - AI proximity-based matching
 *
 * Limiting locations to nearby neighborhoods enables:
 * - Faster food pickup
 * - More accurate AI recommendations
 * - Better proximity calculations
 */

export const ALLOWED_LOCATIONS = [
  "Ikeja",
  "Yaba",
  "Surulere",
  "Lekki",
  "Victoria Island",
  "Ajah",
  "Maryland",
];

/**
 * Get location options formatted for Select component
 */
export const getLocationOptions = () => {
  return ALLOWED_LOCATIONS.map((location) => ({
    value: location,
    label: location,
  }));
};

/**
 * Validate if a location is in the allowed list
 */
export const isValidLocation = (location) => {
  return ALLOWED_LOCATIONS.includes(location);
};

/**
 * UI hint text for location selection
 */
export const LOCATION_HINT =
  "Locations are limited to nearby neighborhoods to enable faster food pickup.";
