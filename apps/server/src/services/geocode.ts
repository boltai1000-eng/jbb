import { db } from "../lib/db.js";
import { env } from "../lib/env.js";

type GeocodeResult = {
  latitude: number;
  longitude: number;
  formattedAddress: string;
};

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const cacheKey = address.trim().toLowerCase();
  const cached = db
    .prepare(
      "SELECT latitude, longitude, formatted_address FROM geocode_cache WHERE cache_key = ?",
    )
    .get(cacheKey) as
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

  db.prepare(
    "INSERT OR REPLACE INTO geocode_cache (cache_key, latitude, longitude, formatted_address) VALUES (?, ?, ?, ?)",
  ).run(cacheKey, result.latitude, result.longitude, result.formattedAddress);

  return result;
}
