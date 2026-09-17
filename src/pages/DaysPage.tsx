import { useState } from "react";
import { useStore } from "../store/useStore";
import { da, plural, words } from "../i18n/da";
import type { Day, Meal, MealExtraItem, MealRecipeRef } from "../domain/types";
import {
  Button,
  Chevron,
  EmptyState,
  IconButton,
  Input,
  Label,
  NumberInput,
  Select,
} from "../components/ui/primitives";
import { ItemRows, pruneRows } from "../components/ItemRows";
import { formatNumber } from "../domain/units";

export function DaysPage() {
  const days = useStore((s) => s.days);
  const addDay = useStore((s) => s.addDay);

  const [openDays, setOpenDays] = useState<Set<string>>(new Set());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <h1 className="text-2xl font-bold">{da.days.title}</h1>
        <div className="flex gap-2">
          {days.length > 0 && (
            <Button
              onClick={() =>
                setOpenDays((prev) =>
                  prev.size === days.length
                    ? new Set()
                    : new Set(days.map((d) => d.id)),
                )
              }
            >
              {openDays.size === days.length
                ? da.common.collapseAll
                : da.common.expandAll}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => {
              const id = addDay();
              setOpenDays((prev) => new Set(prev).add(id));
            }}
          >
            + {da.days.addDay}
          </Button>
        </div>
      </div>

      {days.length === 0 ? (
        <EmptyState>{da.days.noDays}</EmptyState>
      ) : (
        <div className="space-y-3">
          {days.map((day, idx) => (
            <DayCard
              key={day.id}
              day={day}
              index={idx}
              total={days.length}
              open={openDays.has(day.id)}
              setOpen={(open) => {
                setOpenDays((prev) => {
                  const next = new Set(prev);
                  if (open) next.add(day.id);
                  else next.delete(day.id);
                  return next;
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DayCard({
  day,
  index,
  total,
  open,
  setOpen,
}: {
  day: Day;
  index: number;
  total: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const renameDay = useStore((s) => s.renameDay);
  const deleteDay = useStore((s) => s.deleteDay);
  const moveDay = useStore((s) => s.moveDay);
  const addMeal = useStore((s) => s.addMeal);
  const updateDayItems = useStore((s) => s.updateDayItems);

  const [editingName, setEditingName] = useState(false);
  const [editingItems, setEditingItems] = useState(false);
  // meal fold/edit state lives here so a newly added meal can open in edit mode
  const [openMeals, setOpenMeals] = useState<Set<string>>(new Set());
  const [editingMealId, setEditingMealId] = useState<string | null>(null);

  function setMealOpen(id: string, isOpen: boolean) {
    setOpenMeals((prev) => {
      const next = new Set(prev);
      if (isOpen) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleAddMeal() {
    const id = addMeal(day.id);
    setOpen(true);
    setMealOpen(id, true);
    setEditingMealId(id);
  }

  function stopEditingItems() {
    setEditingItems(false);
    updateDayItems(day.id, pruneRows(day.extraItems));
  }

  return (
    <section className="bg-white border border-slate-300 rounded-lg shadow-sm">
      {/* clicking anywhere on the header row folds/unfolds, same as meals */}
      <header className="flex items-center gap-2 p-3 bg-slate-50 rounded-t-lg">
        {editingName ? (
          <>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              className="shrink-0 self-stretch -my-3 -ml-3 pl-3 pr-1 rounded-l-lg hover:bg-slate-100"
            >
              <Chevron open={open} />
            </button>
            <Input
              autoFocus
              value={day.name}
              onChange={(e) => renameDay(day.id, e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape")
                  setEditingName(false);
              }}
              className="!w-56"
            />
          </>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 flex-1 min-w-0 text-left self-stretch -my-3 -ml-3 py-3 pl-3 rounded-l-lg hover:bg-slate-100"
            aria-expanded={open}
          >
            <Chevron open={open} />
            <span className="font-semibold text-lg truncate">
              {day.name || "—"}
            </span>
            <span className="text-xs text-slate-500 shrink-0">
              {plural(day.meals.length, ...words.meal)}
              {day.extraItems.length > 0 &&
                ` · ${plural(day.extraItems.length, ...words.item)}`}
            </span>
          </button>
        )}

        <div className="flex items-center gap-1 shrink-0 ml-auto">
          <IconButton
            title={da.common.rename}
            onClick={() => {
              setEditingName(true);
            }}
          >
            ✎
          </IconButton>
          <IconButton
            title={da.common.moveUp}
            disabled={index === 0}
            onClick={() => moveDay(day.id, -1)}
          >
            ↑
          </IconButton>
          <IconButton
            title={da.common.moveDown}
            disabled={index === total - 1}
            onClick={() => moveDay(day.id, 1)}
          >
            ↓
          </IconButton>
          <Button onClick={handleAddMeal}>+ {da.days.addMeal}</Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm(da.days.deleteDay)) deleteDay(day.id);
            }}
          >
            {da.common.delete}
          </Button>
        </div>
      </header>

      {open && (
        <div className="p-3 space-y-3">
          {day.meals.length === 0 ? (
            <p className="text-sm text-slate-400">{da.days.noMeals}</p>
          ) : (
            day.meals.map((meal, mIdx) => (
              <MealCard
                key={meal.id}
                dayId={day.id}
                meal={meal}
                index={mIdx}
                total={day.meals.length}
                open={openMeals.has(meal.id)}
                setOpen={(o) => setMealOpen(meal.id, o)}
                editing={editingMealId === meal.id}
                setEditing={(on) => setEditingMealId(on ? meal.id : null)}
              />
            ))
          )}

          {/* ---------- day-level individual items ---------- */}
          <div className="rounded-md border border-slate-200 bg-slate-50/60 p-2">
            <div className="flex items-center justify-between mb-1">
              <Label>{da.days.dayItemsGroup}</Label>
              {editingItems ? (
                <Button variant="primary" onClick={stopEditingItems}>
                  {da.common.done}
                </Button>
              ) : (
                <Button onClick={() => setEditingItems(true)}>
                  {da.common.edit}
                </Button>
              )}
            </div>
            <ItemRows
              rows={day.extraItems}
              editing={editingItems}
              onChange={(rows) =>
                updateDayItems(day.id, rows as MealExtraItem[])
              }
              addLabel={da.days.addItem}
              emptyLabel={da.days.noDayItems}
            />
            {editingItems && (
              <p className="text-xs text-slate-500 mt-1">
                {da.days.dayItemsHint}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function MealCard({
  dayId,
  meal,
  index,
  total,
  open,
  setOpen,
  editing,
  setEditing,
}: {
  dayId: string;
  meal: Meal;
  index: number;
  total: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  editing: boolean;
  setEditing: (on: boolean) => void;
}) {
  const updateMeal = useStore((s) => s.updateMeal);
  const deleteMeal = useStore((s) => s.deleteMeal);
  const moveMeal = useStore((s) => s.moveMeal);
  const recipes = useStore((s) => s.recipes);

  function patch(p: Partial<Meal>) {
    updateMeal(dayId, { ...meal, ...p });
  }

  function stopEditing() {
    setEditing(false);
    patch({ extraItems: pruneRows(meal.extraItems) });
  }

  /* ---- recipes group ---- */
  function addRecipeRef() {
    const first = recipes[0];
    if (!first) return;
    patch({ recipeRefs: [...meal.recipeRefs, { recipeId: first.id }] });
  }
  function updateRef(idx: number, p: Partial<MealRecipeRef>) {
    patch({
      recipeRefs: meal.recipeRefs.map((r, i) =>
        i === idx ? { ...r, ...p } : r,
      ),
    });
  }
  function removeRef(idx: number) {
    patch({ recipeRefs: meal.recipeRefs.filter((_, i) => i !== idx) });
  }

  function recipeName(id: string) {
    return recipes.find((r) => r.id === id)?.name || "—";
  }

  return (
    <div className="border border-slate-200 rounded-md">
      <div className="flex items-center gap-2 p-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left self-stretch -my-2 -ml-2 py-2 pl-2 rounded-l-md hover:bg-slate-50"
          aria-expanded={open}
        >
          <Chevron open={open} />
          <span className="font-medium truncate">{meal.name || "—"}</span>
          <span className="text-xs text-slate-500 shrink-0">
            {formatNumber(meal.participants)} pers. ·{" "}
            {plural(meal.recipeRefs.length, ...words.recipe)} ·{" "}
            {plural(meal.extraItems.length, ...words.item)}
          </span>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <IconButton
            title={da.common.moveUp}
            disabled={index === 0}
            onClick={() => moveMeal(dayId, meal.id, -1)}
          >
            ↑
          </IconButton>
          <IconButton
            title={da.common.moveDown}
            disabled={index === total - 1}
            onClick={() => moveMeal(dayId, meal.id, 1)}
          >
            ↓
          </IconButton>
          {editing ? (
            <Button variant="primary" onClick={stopEditing}>
              {da.common.done}
            </Button>
          ) : (
            <Button
              onClick={() => {
                setOpen(true);
                setEditing(true);
              }}
            >
              {da.common.edit}
            </Button>
          )}
          <Button
            variant="danger"
            onClick={() => {
              if (confirm(da.days.deleteMeal)) deleteMeal(dayId, meal.id);
            }}
          >
            {da.common.delete}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 p-3 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>{da.days.mealName}</Label>
              {editing ? (
                <Input
                  autoFocus
                  value={meal.name}
                  onChange={(e) => patch({ name: e.target.value })}
                />
              ) : (
                <ReadOnly>{meal.name || "—"}</ReadOnly>
              )}
            </div>
            <div>
              <Label>{da.days.participants}</Label>
              {editing ? (
                <NumberInput
                  min={0}
                  value={meal.participants}
                  onChange={(n) => patch({ participants: n ?? 0 })}
                />
              ) : (
                <ReadOnly>{formatNumber(meal.participants)}</ReadOnly>
              )}
            </div>
          </div>

          {/* ---------- group 1: recipes ---------- */}
          <div className="rounded-md border border-slate-200 bg-slate-50/60 p-2">
            <div className="flex items-center justify-between mb-1">
              <Label>{da.days.recipesGroup}</Label>
              {editing && (
                <Button onClick={addRecipeRef} disabled={recipes.length === 0}>
                  + {da.days.addRecipe}
                </Button>
              )}
            </div>
            {editing && recipes.length === 0 && (
              <p className="text-xs text-slate-500">{da.days.needRecipes}</p>
            )}
            {meal.recipeRefs.length === 0 ? (
              <p className="text-sm text-slate-400">{da.days.noRecipes}</p>
            ) : (
              <ul className="space-y-1">
                {meal.recipeRefs.map((rr, idx) => (
                  <li
                    key={idx}
                    onKeyDown={(e) => {
                      if (!editing || e.key !== "Enter") return;
                      e.preventDefault();
                      addRecipeRef();
                    }}
                  >
                    {editing ? (
                      <div className="grid grid-cols-[1fr_6rem_auto] gap-1 items-center">
                        <Select
                          value={rr.recipeId}
                          onChange={(e) =>
                            updateRef(idx, { recipeId: e.target.value })
                          }
                        >
                          {recipes.sort((a,b) => a.name.localeCompare(b.name)).map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name || "(uden navn)"} — til {r.feedsPeople}{" "}
                              pers.
                            </option>
                          ))}
                        </Select>
                        <NumberInput
                          min={0}
                          value={rr.servings}
                          placeholder={String(meal.participants)}
                          title={da.days.servingsHelp}
                          onChange={(n) => updateRef(idx, { servings: n })}
                        />
                        <IconButton
                          onClick={() => removeRef(idx)}
                          title={da.common.delete}
                        >
                          ✕
                        </IconButton>
                      </div>
                    ) : (
                      <div className="text-sm py-0.5 flex gap-2">
                        <span className="font-mono text-slate-600 w-20 shrink-0">
                          {formatNumber(rr.servings ?? meal.participants)} pers.
                        </span>
                        <span>{recipeName(rr.recipeId)}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {editing && meal.recipeRefs.length > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                {da.days.servingsHelp}
              </p>
            )}
          </div>

          {/* ---------- group 2: individual items ---------- */}
          <div className="rounded-md border border-slate-200 bg-slate-50/60 p-2">
            <Label>{da.days.itemsGroup}</Label>
            <ItemRows
              rows={meal.extraItems}
              editing={editing}
              onChange={(rows) => patch({ extraItems: rows as MealExtraItem[] })}
              addLabel={da.days.addItem}
              emptyLabel={da.days.noItems}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ReadOnly({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm px-2 py-1.5 bg-slate-50 border border-transparent rounded-md text-slate-800">
      {children}
    </div>
  );
}
