import type { AppState, Ingredient, Meal } from "./types";
import {
  aggregateContributions,
  buildConversionGraph,
  type AggregatedContribution,
} from "./units";

export interface ShoppingRow {
  ingredient: Ingredient;
  displayUnitId: string;
  totalConverted: number;
  leftovers: { unitId: string; amount: number }[];
}

export interface ShoppingGroup {
  category: string;
  rows: ShoppingRow[];
}

export interface MealWithDay {
  meal: Meal;
  dayId: string;
  dayName: string;
}

/** Flatten all days into an ordered list of meals with their day context. */
export function flattenMeals(days: AppState["days"]): MealWithDay[] {
  const out: MealWithDay[] = [];
  for (const d of days) {
    for (const m of d.meals) {
      out.push({ meal: m, dayId: d.id, dayName: d.name });
    }
  }
  return out;
}

/**
 * Build the aggregated shopping list from all enabled meals across all days,
 * plus each day's own (enabled) extra items.
 *
 * `scaleParticipants` optionally overrides each meal's headcount. It is applied
 * as a *ratio* (scaleParticipants / meal.participants) so that explicit
 * per-recipe `servings` overrides scale proportionally too — e.g. a salad
 * recipe that feeds 8 but is entered as 4 servings for a 35-person meal stays
 * at "half a recipe per 35 people" when the list is scaled to 40.
 *
 * Day-level extra items have no headcount of their own, so they are scaled
 * relative to `settings.defaultParticipants`.
 */
export function buildShoppingList(
  state: AppState,
  opts: {
    scaleParticipants?: number | null;
    unitOverrides?: Record<string, string>;
  } = {},
): ShoppingGroup[] {
  const { scaleParticipants = null, unitOverrides = {} } = opts;
  const byIngredient = new Map<string, AggregatedContribution[]>();

  function add(ingredientId: string, amount: number, unitId: string) {
    if (!ingredientId) return; // unfinished row – ignore
    const arr = byIngredient.get(ingredientId) ?? [];
    arr.push({ amount, unitId });
    byIngredient.set(ingredientId, arr);
  }

  // Day-level items: no headcount of their own, so scale against the camp default.
  const dayReference = state.settings.defaultParticipants || 1;
  const dayRatio =
    scaleParticipants != null ? scaleParticipants / dayReference : 1;
  for (const day of state.days) {
    if (!day.extraItemsEnabled) continue;
    for (const extra of day.extraItems) {
      add(extra.ingredientId, extra.amount * dayRatio, extra.unitId);
    }
  }

  for (const { meal } of flattenMeals(state.days)) {
    if (!meal.enabled) continue;
    if (!meal.participants) continue;

    // Ratio by which this whole meal is scaled up/down.
    const ratio =
      scaleParticipants != null ? scaleParticipants / meal.participants : 1;

    for (const ref of meal.recipeRefs) {
      const recipe = state.recipes.find((r) => r.id === ref.recipeId);
      if (!recipe || !recipe.feedsPeople) continue;
      // servings defaults to the meal's headcount, and is scaled by the ratio
      // whether or not it was explicitly overridden.
      const servings = (ref.servings ?? meal.participants) * ratio;
      const scale = servings / recipe.feedsPeople;
      for (const ing of recipe.ingredients) {
        add(ing.ingredientId, ing.amount * scale, ing.unitId);
      }
    }

    for (const extra of meal.extraItems) {
      add(extra.ingredientId, extra.amount * ratio, extra.unitId);
    }
  }

  const groups = new Map<string, ShoppingRow[]>();
  for (const [ingredientId, contributions] of byIngredient) {
    const ingredient = state.ingredients.find((i) => i.id === ingredientId);
    if (!ingredient) continue;
    const override = unitOverrides[ingredientId];
    const displayUnitId =
      override && ingredient.allowedUnitIds.includes(override)
        ? override
        : ingredient.defaultDisplayUnitId;
    const graph = buildConversionGraph(state.globalConversions, ingredient);
    const { converted, leftovers } = aggregateContributions(
      contributions,
      displayUnitId,
      graph,
    );
    const row: ShoppingRow = {
      ingredient,
      displayUnitId,
      totalConverted: converted,
      leftovers: Array.from(leftovers, ([unitId, amount]) => ({
        unitId,
        amount,
      })),
    };
    const list = groups.get(ingredient.category) ?? [];
    list.push(row);
    groups.set(ingredient.category, list);
  }

  for (const rows of groups.values()) {
    rows.sort((a, b) =>
      a.ingredient.masterName.localeCompare(b.ingredient.masterName, "da"),
    );
  }

  const ordered: ShoppingGroup[] = [];
  for (const cat of state.categories) {
    const rows = groups.get(cat);
    if (rows && rows.length) ordered.push({ category: cat, rows });
  }
  for (const [cat, rows] of groups) {
    if (!state.categories.includes(cat)) ordered.push({ category: cat, rows });
  }
  return ordered;
}
