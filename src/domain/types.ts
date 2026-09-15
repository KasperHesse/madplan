import { z } from "zod";

export type UnitCategory = "mass" | "volume" | "count" | "other";

export const UnitSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  category: z.enum(["mass", "volume", "count", "other"]),
});
export type Unit = z.infer<typeof UnitSchema>;

export const GlobalConversionSchema = z.object({
  fromUnitId: z.string(),
  toUnitId: z.string(),
  factor: z.number().positive(),
});
export type GlobalConversion = z.infer<typeof GlobalConversionSchema>;

export const ItemConversionSchema = z.object({
  fromUnitId: z.string(),
  toUnitId: z.string(),
  factor: z.number().positive(),
});
export type ItemConversion = z.infer<typeof ItemConversionSchema>;

export const IngredientSchema = z.object({
  id: z.string(),
  masterName: z.string(),
  aliases: z.array(z.string()).default([]),
  category: z.string(),
  allowedUnitIds: z.array(z.string()).min(1),
  defaultDisplayUnitId: z.string(),
  itemConversions: z.array(ItemConversionSchema).default([]),
  notes: z.string().optional(),
});
export type Ingredient = z.infer<typeof IngredientSchema>;

export const RecipeIngredientSchema = z.object({
  ingredientId: z.string(),
  amount: z.number().nonnegative(),
  unitId: z.string(),
});
export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;

export const RecipeSchema = z.object({
  id: z.string(),
  name: z.string(),
  feedsPeople: z.number().positive(),
  notes: z.string().optional(),
  ingredients: z.array(RecipeIngredientSchema).default([]),
});
export type Recipe = z.infer<typeof RecipeSchema>;

export const MealRecipeRefSchema = z.object({
  recipeId: z.string(),
  /**
   * Optional override of how many people this recipe should cover inside the
   * meal. Interpreted relative to the meal's own `participants`, so it scales
   * proportionally when the whole list is scaled to another headcount.
   */
  servings: z.number().positive().optional(),
});
export type MealRecipeRef = z.infer<typeof MealRecipeRefSchema>;

export const MealExtraItemSchema = z.object({
  ingredientId: z.string(),
  amount: z.number().nonnegative(),
  unitId: z.string(),
});
export type MealExtraItem = z.infer<typeof MealExtraItemSchema>;

export const MealSchema = z.object({
  id: z.string(),
  name: z.string(),
  participants: z.number().positive(),
  recipeRefs: z.array(MealRecipeRefSchema).default([]),
  extraItems: z.array(MealExtraItemSchema).default([]),
  enabled: z.boolean().default(true),
});
export type Meal = z.infer<typeof MealSchema>;

/** A named, reorderable day that groups one or more meals. */
export const DaySchema = z.object({
  id: z.string(),
  name: z.string(),
  meals: z.array(MealSchema).default([]),
  /** Items needed for the whole day, not tied to a single meal. */
  extraItems: z.array(MealExtraItemSchema).default([]),
  extraItemsEnabled: z.boolean().default(true),
});
export type Day = z.infer<typeof DaySchema>;

export const SettingsSchema = z.object({
  campName: z.string().default("Spejderlejr"),
  defaultParticipants: z.number().positive().default(35),
});
export type Settings = z.infer<typeof SettingsSchema>;

export const SCHEMA_VERSION = 3;

export const StateSchema = z.object({
  schemaVersion: z.number(),
  units: z.array(UnitSchema),
  globalConversions: z.array(GlobalConversionSchema),
  categories: z.array(z.string()),
  ingredients: z.array(IngredientSchema),
  recipes: z.array(RecipeSchema),
  days: z.array(DaySchema),
  settings: SettingsSchema,
});
export type AppState = z.infer<typeof StateSchema>;

/* ------------------------------------------------------------------ */
/* Migration from schema v1 (flat `meals` list with a numeric day tag)  */
/* ------------------------------------------------------------------ */

const V1MealSchema = z.object({
  id: z.string(),
  name: z.string(),
  day: z.number().nullable().optional(),
  participants: z.number().positive(),
  recipeRefs: z.array(MealRecipeRefSchema).default([]),
  extraItems: z.array(MealExtraItemSchema).default([]),
  enabled: z.boolean().default(true),
});

const V1StateSchema = z.object({
  schemaVersion: z.number().optional(),
  units: z.array(UnitSchema),
  globalConversions: z.array(GlobalConversionSchema),
  categories: z.array(z.string()),
  ingredients: z.array(IngredientSchema),
  recipes: z.array(RecipeSchema),
  meals: z.array(V1MealSchema),
  settings: z.object({
    campName: z.string(),
    defaultParticipants: z.number().positive(),
    days: z.number().optional(),
  }),
});

/** Convert a v1 state object into the current shape. Returns null if not v1. */
export function migrateV1(raw: unknown): AppState | null {
  const parsed = V1StateSchema.safeParse(raw);
  if (!parsed.success) return null;
  const v1 = parsed.data;

  const byDay = new Map<number | "none", Meal[]>();
  for (const m of v1.meals) {
    const key = m.day ?? "none";
    const arr = byDay.get(key) ?? [];
    arr.push({
      id: m.id,
      name: m.name,
      participants: m.participants,
      recipeRefs: m.recipeRefs,
      extraItems: m.extraItems,
      enabled: m.enabled,
    });
    byDay.set(key, arr);
  }

  const dayNumbers = Array.from(byDay.keys())
    .filter((k): k is number => k !== "none")
    .sort((a, b) => a - b);

  const days: Day[] = dayNumbers.map((n) => ({
    id: `d_v1_${n}`,
    name: `Dag ${n}`,
    meals: byDay.get(n)!,
    extraItems: [],
    extraItemsEnabled: true,
  }));
  if (byDay.has("none")) {
    days.push({
      id: "d_v1_none",
      name: "Uden dag",
      meals: byDay.get("none")!,
      extraItems: [],
      extraItemsEnabled: true,
    });
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    units: v1.units,
    globalConversions: v1.globalConversions,
    categories: v1.categories,
    ingredients: v1.ingredients,
    recipes: v1.recipes,
    days,
    settings: {
      campName: v1.settings.campName,
      defaultParticipants: v1.settings.defaultParticipants,
    },
  };
}

/** Parse any supported state version (current or v1) into the current shape. */
export function parseAnyVersion(
  raw: unknown,
): { ok: true; state: AppState } | { ok: false; error: string } {
  const current = StateSchema.safeParse(raw);
  if (current.success)
    return {
      ok: true,
      state: { ...current.data, schemaVersion: SCHEMA_VERSION },
    };
  const migrated = migrateV1(raw);
  if (migrated) return { ok: true, state: migrated };
  return { ok: false, error: current.error.message };
}
