import { GoogleGenAI } from "@google/genai";
import type { SaleFilters } from "../types/index.js";
import { env } from "../lib/env.js";
import { buildAnalytics } from "./analytics.js";
import { listSales } from "./sales.js";

export async function generateInsights(filters: SaleFilters) {
  const analytics = await buildAnalytics(filters);
  const sales = (await listSales(filters)).slice(0, 20);

  if (!env.geminiApiKey) {
    return {
      generatedAt: new Date().toISOString(),
      fallback: true,
      insights: [
        `Revenue in the current filtered view is INR ${analytics.kpis.totalRevenue.toLocaleString("en-IN")}.`,
        analytics.topCities[0]
          ? `${analytics.topCities[0].city} is currently the best-performing city by revenue.`
          : "Add more sales records to unlock city-level comparisons.",
        analytics.sellerPerformance.at(-1)
          ? `${analytics.sellerPerformance.at(-1)?.seller} needs attention based on current filtered revenue.`
          : "Seller-level opportunity analysis will appear when more data is available.",
      ],
      predictions: [
        "Monthly trend prediction requires Gemini API configuration. The local analytics baseline is ready.",
      ],
      suggestions: [
        "Focus on cities already converting well and upsell multi-table bundles to increase average order value.",
      ],
    };
  }

  const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });
  const prompt = `
You are an operations analyst for a table installation business in India.
Use only the supplied data. Do not invent facts.
Return strict JSON with keys: insights, predictions, suggestions.
Each key must be an array of 3 concise strings.

Analytics:
${JSON.stringify(analytics, null, 2)}

Recent filtered sales:
${JSON.stringify(sales, null, 2)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text || "{}";
  const parsed = JSON.parse(text) as {
    insights: string[];
    predictions: string[];
    suggestions: string[];
  };

  return {
    generatedAt: new Date().toISOString(),
    fallback: false,
    ...parsed,
  };
}

export async function chatWithData(question: string, filters: SaleFilters) {
  const analytics = await buildAnalytics(filters);
  const sales = await listSales(filters);

  if (!env.geminiApiKey) {
    return {
      answer:
        "Gemini API key is not configured yet. The app is ready for AI chat once GEMINI_API_KEY is added to apps/server/.env.",
    };
  }

  const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });
  const prompt = `
You answer business questions using only the structured sales data below.
Be direct, precise, and useful for operators.
If the answer cannot be proven from the data, say so clearly.

Question: ${question}

Analytics:
${JSON.stringify(analytics, null, 2)}

Sales:
${JSON.stringify(sales, null, 2)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return { answer: response.text || "No response received." };
}
