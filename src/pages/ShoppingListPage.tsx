import { useMemo, useState } from "react";
import { useStore } from "../store/useStore";
import { da } from "../i18n/da";
import { buildShoppingList, flattenMeals } from "../domain/aggregate";
import { formatNumber, unitLabel } from "../domain/units";
import { SCHEMA_VERSION, type AppState } from "../domain/types";
import {
  Button,
  Card,
  EmptyState,
  Label,
  NumberInput,
  Select,
} from "../components/ui/primitives";

export function ShoppingListPage() {
  const units = useStore((s) => s.units);
  const globalConversions = useStore((s) => s.globalConversions);
  const categories = useStore((s) => s.categories);
  const ingredients = useStore((s) => s.ingredients);
  const recipes = useStore((s) => s.recipes);
  const days = useStore((s) => s.days);
  const settings = useStore((s) => s.settings);
  const toggleMeal = useStore((s) => s.toggleMeal);
  const setMealsEnabled = useStore((s) => s.setMealsEnabled);
  const toggleDayItems = useStore((s) => s.toggleDayItems);
  const setDayItemsEnabled = useStore((s) => s.setDayItemsEnabled);

  const [scale, setScale] = useState<number | undefined>(undefined);
  const [unitOverrides, setUnitOverrides] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hideChecked, setHideChecked] = useState(false);

  const allMeals = useMemo(() => flattenMeals(days), [days]);
  const enabledMeals = allMeals.filter((m) => m.meal.enabled);

  const state: AppState = useMemo(
    () => ({
      schemaVersion: SCHEMA_VERSION,
      units,
      globalConversions,
      categories,
      ingredients,
      recipes,
      days,
      settings,
    }),
    [units, globalConversions, categories, ingredients, recipes, days, settings],
  );

  const groups = useMemo(
    () =>
      buildShoppingList(state, {
        scaleParticipants: scale ?? null,
        unitOverrides,
      }),
    [state, scale, unitOverrides],
  );

  const nothingToSelect =
    allMeals.length === 0 && days.every((d) => d.extraItems.length === 0);

  function setAll(enabled: boolean) {
    setMealsEnabled(
      allMeals.map((m) => m.meal.id),
      enabled,
    );
    setDayItemsEnabled(
      days.map((d) => d.id),
      enabled,
    );
  }

  function toggleCheck(id: string) {
    setChecked((c) => ({ ...c, [id]: !c[id] }));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center no-print">
        <h1 className="text-2xl font-bold">{da.shoppingList.title}</h1>
        <Button variant="primary" onClick={() => window.print()}>
          🖨 {da.shoppingList.print}
        </Button>
      </div>

      {/* ---------------- meal selector ---------------- */}
      <Card className="no-print">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <Label>{da.shoppingList.selectMeals}</Label>
          <div className="flex gap-2">
            <Button onClick={() => setAll(true)} disabled={nothingToSelect}>
              {da.shoppingList.selectAll}
            </Button>
            <Button onClick={() => setAll(false)} disabled={nothingToSelect}>
              {da.shoppingList.selectNone}
            </Button>
          </div>
        </div>

        {nothingToSelect ? (
          <p className="text-sm text-slate-500">{da.shoppingList.noMeals}</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-auto pr-1">
            {days
              .filter((d) => d.meals.length > 0 || d.extraItems.length > 0)
              .map((d) => {
                const ids = d.meals.map((m) => m.id);
                const allOn =
                  d.meals.every((m) => m.enabled) &&
                  (d.extraItems.length === 0 || d.extraItemsEnabled);
                return (
                  <div key={d.id}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {d.name}
                      </span>
                      <button
                        type="button"
                        className="text-xs text-teal-700 hover:underline"
                        onClick={() => {
                          setMealsEnabled(ids, !allOn);
                          setDayItemsEnabled([d.id], !allOn);
                        }}
                      >
                        {allOn
                          ? da.shoppingList.selectNone
                          : da.shoppingList.selectAll}
                      </button>
                    </div>
                    <ul className="grid gap-1 sm:grid-cols-2">
                      {d.meals.map((m) => (
                        <li key={m.id}>
                          <label
                            className={`flex items-center gap-2 px-2 py-1 rounded border cursor-pointer text-sm ${
                              m.enabled
                                ? "bg-teal-50 border-teal-300"
                                : "bg-white border-slate-200 text-slate-500"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={m.enabled}
                              onChange={() => toggleMeal(m.id)}
                            />
                            <span className="flex-1 truncate">
                              {m.name || "—"}
                            </span>
                            <span className="text-xs text-slate-500 shrink-0">
                              {formatNumber(m.participants)} pers.
                            </span>
                          </label>
                        </li>
                      ))}
                      {d.extraItems.length > 0 && (
                        <li>
                          <label
                            className={`flex items-center gap-2 px-2 py-1 rounded border cursor-pointer text-sm ${
                              d.extraItemsEnabled
                                ? "bg-teal-50 border-teal-300"
                                : "bg-white border-slate-200 text-slate-500"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={d.extraItemsEnabled}
                              onChange={() => toggleDayItems(d.id)}
                            />
                            <span className="flex-1 truncate italic">
                              {da.shoppingList.dayItems}
                            </span>
                            <span className="text-xs text-slate-500 shrink-0">
                              {d.extraItems.length}
                            </span>
                          </label>
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-slate-200 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>{da.shoppingList.scaleTo}</Label>
            <NumberInput
              min={0}
              value={scale}
              onChange={setScale}
              placeholder={da.shoppingList.scaleHint}
            />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={hideChecked}
                onChange={(e) => setHideChecked(e.target.checked)}
              />
              {da.shoppingList.hideChecked}
            </label>
            <Button onClick={() => setChecked({})}>
              {da.shoppingList.clearChecks}
            </Button>
          </div>
        </div>
      </Card>

      {/* ---------------- print header ---------------- */}
      <div className="hidden print:block mb-4">
        <h1 className="text-2xl font-bold">
          {settings.campName} – {da.shoppingList.title}
        </h1>
        <p className="text-sm">
          {enabledMeals.length} {da.shoppingList.activeMeals}
          {scale != null && ` · skaleret til ${formatNumber(scale)} personer`}
        </p>
      </div>

      {/* ---------------- the list ---------------- */}
      {groups.length === 0 ? (
        <EmptyState>{da.shoppingList.empty}</EmptyState>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => {
            const rows = hideChecked
              ? g.rows.filter((r) => !checked[r.ingredient.id])
              : g.rows;
            if (rows.length === 0) return null;
            return (
              <div key={g.category}>
                <h2 className="text-lg font-semibold mb-1 border-b border-slate-300 pb-1">
                  {g.category}
                </h2>
                <ul className="divide-y divide-slate-200">
                  {rows.map((row) => {
                    const id = row.ingredient.id;
                    const isChecked = !!checked[id];
                    return (
                      <li
                        key={id}
                        className="py-2 flex flex-wrap gap-2 items-center"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCheck(id)}
                          className="shrink-0"
                          aria-label={row.ingredient.masterName}
                        />
                        {/* clicking the name toggles the checkmark too */}
                        <button
                          type="button"
                          onClick={() => toggleCheck(id)}
                          className={`font-medium flex-1 min-w-[10rem] text-left cursor-pointer select-none hover:text-teal-700 ${
                            isChecked ? "line-through opacity-50" : ""
                          }`}
                        >
                          {row.ingredient.masterName}
                        </button>
                        <span
                          className={`font-mono ${isChecked ? "line-through opacity-50" : ""}`}
                        >
                          {formatNumber(row.totalConverted)}
                        </span>
                        <Select
                          value={row.displayUnitId}
                          onChange={(e) =>
                            setUnitOverrides((o) => ({
                              ...o,
                              [id]: e.target.value,
                            }))
                          }
                          className="!w-auto no-print"
                        >
                          {row.ingredient.allowedUnitIds.map((uid) => (
                            <option key={uid} value={uid}>
                              {unitLabel(units, uid)}
                            </option>
                          ))}
                        </Select>
                        <span className="hidden print:inline">
                          {unitLabel(units, row.displayUnitId)}
                        </span>
                        {row.leftovers.length > 0 && (
                          <span
                            className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-1 py-0.5"
                            title={da.shoppingList.warnMixed}
                          >
                            +{" "}
                            {row.leftovers
                              .map(
                                (l) =>
                                  `${formatNumber(l.amount)} ${unitLabel(units, l.unitId)}`,
                              )
                              .join(", ")}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
