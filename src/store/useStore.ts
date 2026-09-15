import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildSeedState } from "../data/seed";
import {
  SCHEMA_VERSION,
  parseAnyVersion,
  type AppState,
  type Day,
  type Ingredient,
  type Meal,
  type MealExtraItem,
  type Recipe,
  type Settings,
} from "../domain/types";

const STORAGE_KEY = "camp-shopping-v1";
const BACKUP_KEY = "camp-shopping-v1-backup";

interface Actions {
  upsertIngredient: (ing: Ingredient) => void;
  deleteIngredient: (id: string) => void;

  upsertRecipe: (r: Recipe) => void;
  deleteRecipe: (id: string) => void;

  addDay: (name?: string) => string;
  renameDay: (dayId: string, name: string) => void;
  deleteDay: (dayId: string) => void;
  moveDay: (dayId: string, direction: -1 | 1) => void;
  updateDayItems: (dayId: string, items: MealExtraItem[]) => void;
  setDayItemsEnabled: (dayIds: string[], enabled: boolean) => void;
  toggleDayItems: (dayId: string) => void;

  addMeal: (dayId: string, name?: string) => string;
  updateMeal: (dayId: string, meal: Meal) => void;
  deleteMeal: (dayId: string, mealId: string) => void;
  moveMeal: (dayId: string, mealId: string, direction: -1 | 1) => void;
  toggleMeal: (mealId: string) => void;
  setMealsEnabled: (mealIds: string[], enabled: boolean) => void;

  updateSettings: (s: Partial<Settings>) => void;

  resetToSeed: () => void;
  importState: (raw: unknown) => { ok: true } | { ok: false; error: string };
  exportState: () => AppState;
}

export type Store = AppState & Actions;

function backupCurrent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) localStorage.setItem(BACKUP_KEY, raw);
  } catch {
    /* localStorage may be unavailable – backup is best-effort */
  }
}

/** Apply a transform to one day, returning a new days array. */
function mapDay(days: Day[], dayId: string, fn: (d: Day) => Day): Day[] {
  return days.map((d) => (d.id === dayId ? fn(d) : d));
}

function moveInArray<T>(arr: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (index < 0 || target < 0 || target >= arr.length) return arr;
  const next = [...arr];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...buildSeedState(),

      /* ---------------- ingredients ---------------- */
      upsertIngredient: (ing) =>
        set((s) => {
          const idx = s.ingredients.findIndex((i) => i.id === ing.id);
          const next = [...s.ingredients];
          if (idx >= 0) next[idx] = ing;
          else next.push(ing);
          return { ingredients: next };
        }),
      deleteIngredient: (id) =>
        set((s) => ({ ingredients: s.ingredients.filter((i) => i.id !== id) })),

      /* ---------------- recipes ---------------- */
      upsertRecipe: (r) =>
        set((s) => {
          const idx = s.recipes.findIndex((x) => x.id === r.id);
          const next = [...s.recipes];
          if (idx >= 0) next[idx] = r;
          else next.push(r);
          return { recipes: next };
        }),
      deleteRecipe: (id) =>
        set((s) => ({
          recipes: s.recipes.filter((r) => r.id !== id),
          // also drop references from meals so totals stay correct
          days: s.days.map((d) => ({
            ...d,
            meals: d.meals.map((m) => ({
              ...m,
              recipeRefs: m.recipeRefs.filter((rr) => rr.recipeId !== id),
            })),
          })),
        })),

      /* ---------------- days ---------------- */
      addDay: (name) => {
        const id = newId("d");
        set((s) => ({
          days: [
            ...s.days,
            {
              id,
              name: name ?? `Dag ${s.days.length + 1}`,
              meals: [],
              extraItems: [],
              extraItemsEnabled: true,
            },
          ],
        }));
        return id;
      },
      renameDay: (dayId, name) =>
        set((s) => ({ days: mapDay(s.days, dayId, (d) => ({ ...d, name })) })),
      deleteDay: (dayId) =>
        set((s) => ({ days: s.days.filter((d) => d.id !== dayId) })),
      moveDay: (dayId, direction) =>
        set((s) => {
          const idx = s.days.findIndex((d) => d.id === dayId);
          return { days: moveInArray(s.days, idx, direction) };
        }),
      updateDayItems: (dayId, items) =>
        set((s) => ({
          days: mapDay(s.days, dayId, (d) => ({ ...d, extraItems: items })),
        })),
      setDayItemsEnabled: (dayIds, enabled) =>
        set((s) => {
          const ids = new Set(dayIds);
          return {
            days: s.days.map((d) =>
              ids.has(d.id) ? { ...d, extraItemsEnabled: enabled } : d,
            ),
          };
        }),
      toggleDayItems: (dayId) =>
        set((s) => ({
          days: mapDay(s.days, dayId, (d) => ({
            ...d,
            extraItemsEnabled: !d.extraItemsEnabled,
          })),
        })),

      /* ---------------- meals ---------------- */
      addMeal: (dayId, name) => {
        const id = newId("m");
        set((s) => ({
          days: mapDay(s.days, dayId, (d) => ({
            ...d,
            meals: [
              ...d.meals,
              {
                id,
                name: name ?? "Nyt måltid",
                participants: s.settings.defaultParticipants,
                recipeRefs: [],
                extraItems: [],
                enabled: true,
              },
            ],
          })),
        }));
        return id;
      },
      updateMeal: (dayId, meal) =>
        set((s) => ({
          days: mapDay(s.days, dayId, (d) => ({
            ...d,
            meals: d.meals.map((m) => (m.id === meal.id ? meal : m)),
          })),
        })),
      deleteMeal: (dayId, mealId) =>
        set((s) => ({
          days: mapDay(s.days, dayId, (d) => ({
            ...d,
            meals: d.meals.filter((m) => m.id !== mealId),
          })),
        })),
      moveMeal: (dayId, mealId, direction) =>
        set((s) => ({
          days: mapDay(s.days, dayId, (d) => {
            const idx = d.meals.findIndex((m) => m.id === mealId);
            return { ...d, meals: moveInArray(d.meals, idx, direction) };
          }),
        })),
      toggleMeal: (mealId) =>
        set((s) => ({
          days: s.days.map((d) => ({
            ...d,
            meals: d.meals.map((m) =>
              m.id === mealId ? { ...m, enabled: !m.enabled } : m,
            ),
          })),
        })),
      setMealsEnabled: (mealIds, enabled) =>
        set((s) => {
          const ids = new Set(mealIds);
          return {
            days: s.days.map((d) => ({
              ...d,
              meals: d.meals.map((m) =>
                ids.has(m.id) ? { ...m, enabled } : m,
              ),
            })),
          };
        }),

      /* ---------------- settings ---------------- */
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      /* ---------------- data management ---------------- */
      resetToSeed: () => {
        backupCurrent();
        set(() => buildSeedState());
      },

      importState: (raw) => {
        const res = parseAnyVersion(raw);
        if (!res.ok) return { ok: false, error: res.error };
        backupCurrent();
        set(() => res.state);
        return { ok: true };
      },

      exportState: () => {
        const s = get();
        return {
          schemaVersion: SCHEMA_VERSION,
          units: s.units,
          globalConversions: s.globalConversions,
          categories: s.categories,
          ingredients: s.ingredients,
          recipes: s.recipes,
          days: s.days,
          settings: s.settings,
        };
      },
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      migrate: (persisted, version) => {
        if (version >= SCHEMA_VERSION) return persisted as AppState;
        const res = parseAnyVersion(persisted);
        return res.ok ? res.state : buildSeedState();
      },
      partialize: (s): AppState => ({
        schemaVersion: SCHEMA_VERSION,
        units: s.units,
        globalConversions: s.globalConversions,
        categories: s.categories,
        ingredients: s.ingredients,
        recipes: s.recipes,
        days: s.days,
        settings: s.settings,
      }),
    },
  ),
);

export function newId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
