import { pool } from "../lib/db.js";
import { env } from "../lib/env.js";

type GeocodeResult = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
};

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const cacheKey = address.trim().toLowerCase();
  const cachedResult = await pool.query(
    "SELECT latitude, longitude, formatted_address FROM geocode_cache WHERE cache_key = $1",
    [cacheKey],
  );
  const cached = cachedResult.rows[0] as
    | { latitude: number; longitude: number; formatted_address: string }
    | undefined;

  if (cached) {
    return {
      latitude: cached.latitude,
      longitude: cached.longitude,
      formattedAddress: cached.formatted_address,
    };
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", address);

  const response = await fetch(url, {
    headers: {
      "User-Agent": env.geocodingUserAgent,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed with status ${response.status}`);
  }

  const results = (await response.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (!results.length) return null;

  const first = results[0];
  const result = {
    latitude: Number(first.lat),
    longitude: Number(first.lon),
    formattedAddress: first.display_name,
  };

  await pool.query(
    `
    INSERT INTO geocode_cache (cache_key, latitude, longitude, formatted_address)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (cache_key)
    DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, formatted_address = EXCLUDED.formatted_address
    `,
    [cacheKey, result.latitude, result.longitude, result.formattedAddress],
  );

  return result;
}
