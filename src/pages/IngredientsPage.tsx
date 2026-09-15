import { useMemo, useState } from "react";
import { useStore } from "../store/useStore";
import { da } from "../i18n/da";
import type { Ingredient } from "../domain/types";
import {
  Button,
  Card,
  EmptyState,
  Input,
} from "../components/ui/primitives";
import { IngredientEditor, makeBlankIngredient } from "../components/IngredientEditor";

export function IngredientsPage() {
  const ingredients = useStore((s) => s.ingredients);
  const units = useStore((s) => s.units);
  const categories = useStore((s) => s.categories);
  const recipes = useStore((s) => s.recipes);
  const days = useStore((s) => s.days);
  const upsert = useStore((s) => s.upsertIngredient);
  const del = useStore((s) => s.deleteIngredient);

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Ingredient | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...ingredients].sort((a, b) =>
      a.masterName.localeCompare(b.masterName, "da"),
    );
    if (!q) return list;
    return list.filter(
      (i) =>
        i.masterName.toLowerCase().includes(q) ||
        i.aliases.some((a) => a.toLowerCase().includes(q)) ||
        i.category.toLowerCase().includes(q),
    );
  }, [ingredients, query]);

  function isUsed(id: string): boolean {
    return (
      recipes.some((r) => r.ingredients.some((ri) => ri.ingredientId === id)) ||
      days.some((d) =>
        d.meals.some((m) =>
          m.extraItems.some((ei) => ei.ingredientId === id),
        ),
      )
    );
  }

  function handleDelete(i: Ingredient) {
    if (isUsed(i.id)) {
      if (!confirm(da.ingredients.deleteConfirm)) return;
    }
    del(i.id);
  }

  function newIngredient() {
    setEditing(makeBlankIngredient(categories));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h1 className="text-2xl font-bold">{da.ingredients.title}</h1>
        <Button variant="primary" onClick={newIngredient}>
          + {da.ingredients.new}
        </Button>
      </div>

      <Input
        placeholder={da.ingredients.searchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="text-xs text-slate-500">
        {filtered.length} / {ingredients.length}
      </div>

      {filtered.length === 0 ? (
        <EmptyState>{da.common.empty}</EmptyState>
      ) : (
        <div className="grid gap-2">
          {filtered.map((i) => (
            <Card key={i.id} className="!p-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{i.masterName}</div>
                  <div className="text-xs text-slate-500 truncate">
                    {i.category}
                    {" · "}
                    {i.allowedUnitIds
                      .map(
                        (uid) =>
                          units.find((u) => u.id === uid)?.symbol ?? uid,
                      )
                      .join(", ")}
                    {i.aliases.length > 0 && (
                      <> · også: {i.aliases.join(", ")}</>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button onClick={() => setEditing(i)}>{da.common.edit}</Button>
                  <Button variant="danger" onClick={() => handleDelete(i)}>
                    {da.common.delete}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <IngredientEditor
          ingredient={editing}
          onCancel={() => setEditing(null)}
          onSave={(i) => {
            upsert(i);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
