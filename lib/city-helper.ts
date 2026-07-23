// lib/city-helper.ts
import levenshtein from 'fast-levenshtein';
import { connectDB } from '@/lib/db';
import Shop from '@/models/Shop';

export async function getSmartCityMatch(userInput: string): Promise<string> {
  if (!userInput || !userInput.trim()) return userInput;

  const cleanInput = userInput.trim().toLowerCase();

  await connectDB();
  // 1. Récupération dynamique de toutes les villes existantes en BDD
  const activeCities = (await Shop.distinct('city')) as string[];
  const validCities = activeCities.filter((c): c is string => Boolean(c && c.trim()));

  if (validCities.length === 0) return userInput;

  // 2. ÉTAPE 1 : Recherche par PRÉFIXE ("casa" -> "Casablanca", "marra" -> "Marrakech")
  const prefixMatch = validCities.find((city) =>
    city.toLowerCase().startsWith(cleanInput)
  );
  if (prefixMatch) return prefixMatch;

  // 3. ÉTAPE 2 : Tolérance aux fautes (Levenshtein adaptatif jusqu'à 3 fautes)
  let bestMatch = userInput;
  let lowestDistance = Infinity;

  for (const city of validCities) {
    const cityLower = city.toLowerCase();
    const distance = levenshtein.get(cleanInput, cityLower);

    // Seuil adaptatif : 
    // - Mots longs (>= 8 lettres) : jusqu'à 3 fautes ("Marrackeck" -> "Marrakech")
    // - Mots moyens (5-7 lettres) : max 2 fautes
    // - Mots courts (< 5 lettres) : max 1 faute
    let maxAllowedEdits = 2;
    if (cityLower.length >= 8) maxAllowedEdits = 3;
    if (cityLower.length < 5) maxAllowedEdits = 1;

    if (distance <= maxAllowedEdits && distance < lowestDistance) {
      lowestDistance = distance;
      bestMatch = city;
    }
  }

  return bestMatch;
}