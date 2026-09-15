import { SCHEMA_VERSION, type AppState } from "../domain/types";
import { seedIngredients } from "./seedIngredients";
import { seedCategories, seedGlobalConversions, seedUnits } from "./seedUnits";

export function buildSeedState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    units: seedUnits,
    globalConversions: seedGlobalConversions,
    categories: seedCategories,
    ingredients: seedIngredients,
    recipes: [],
    days: [],
    settings: {
      campName: "Spejderlejr",
      defaultParticipants: 35,
    },
  };
}
