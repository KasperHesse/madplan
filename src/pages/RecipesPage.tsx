import { useMemo, useState } from "react";
import { newId, useStore } from "../store/useStore";
import { da, plural, words } from "../i18n/da";
import type { Recipe, RecipeIngredient } from "../domain/types";
import {
  Button,
  Chevron,
  EmptyState,
  Input,
  Label,
  NumberInput,
  Textarea,
} from "../components/ui/primitives";
import { ItemRows, pruneRows } from "../components/ItemRows";
import { formatNumber } from "../domain/units";

export function RecipesPage() {
  const recipes = useStore((s) => s.recipes);
  const upsert = useStore((s) => s.upsertRecipe);
  const del = useStore((s) => s.deleteRecipe);
  const days = useStore((s) => s.days);

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...recipes].sort((a, b) => a.name.localeCompare(b.name, "da")),
    [recipes],
  );

  function toggleOpen(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addRecipe() {
    const r: Recipe = {
      id: newId("r"),
      name: "",
      feedsPeople: 10,
      ingredients: [],
      notes: "",
    };
    upsert(r);
    setOpenIds((prev) => new Set(prev).add(r.id));
    setEditingId(r.id);
  }

  function isUsed(id: string) {
    return days.some((d) =>
      d.meals.some((m) => m.recipeRefs.some((rr) => rr.recipeId === id)),
    );
  }

  function handleDelete(r: Recipe) {
    if (isUsed(r.id) && !confirm(da.recipes.deleteConfirm)) return;
    del(r.id);
    setEditingId((cur) => (cur === r.id ? null : cur));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <h1 className="text-2xl font-bold">{da.recipes.title}</h1>
        <div className="flex gap-2">
          {sorted.length > 0 && (
            <Button
              onClick={() =>
                setOpenIds((prev) =>
                  prev.size === sorted.length
                    ? new Set()
                    : new Set(sorted.map((r) => r.id)),
                )
              }
            >
              {openIds.size === sorted.length
                ? da.common.collapseAll
                : da.common.expandAll}
            </Button>
          )}
          <Button variant="primary" onClick={addRecipe}>
            + {da.recipes.new}
          </Button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState>{da.common.empty}</EmptyState>
      ) : (
        <div className="space-y-2">
          {sorted.map((r) => (
            <RecipeRow
              key={r.id}
              recipe={r}
              open={openIds.has(r.id)}
              editing={editingId === r.id}
              onToggleOpen={() => toggleOpen(r.id)}
              onStartEdit={() => {
                setOpenIds((prev) => new Set(prev).add(r.id));
                setEditingId(r.id);
              }}
              onStopEdit={() => setEditingId(null)}
              onChange={upsert}
              onDelete={() => handleDelete(r)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeRow({
  recipe,
  open,
  editing,
  onToggleOpen,
  onStartEdit,
  onStopEdit,
  onChange,
  onDelete,
}: {
  recipe: Recipe;
  open: boolean;
  editing: boolean;
  onToggleOpen: () => void;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onChange: (r: Recipe) => void;
  onDelete: () => void;
}) {

  function patch(p: Partial<Recipe>) {
    onChange({ ...recipe, ...p });
  }

  function stopEdit() {
    // drop rows where no ingredient was ever picked
    patch({ ingredients: pruneRows(recipe.ingredients) });
    onStopEdit();
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
      {/* ---------- header (always visible) ---------- */}
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          onClick={onToggleOpen}
          className="flex items-center gap-2 flex-1 min-w-0 text-left self-stretch -my-3 -ml-3 py-3 pl-3 rounded-l-lg hover:bg-slate-50"
          aria-expanded={open}
        >
          <Chevron open={open} />
          <span className="font-medium truncate">
            {recipe.name || (
              <span className="text-slate-400 italic">{da.recipes.unnamed}</span>
            )}
          </span>
          <span className="text-xs text-slate-500 shrink-0">
            {formatNumber(recipe.feedsPeople)} {da.recipes.feedsShort} ·{" "}
            {plural(recipe.ingredients.length, ...words.ingredient)}
          </span>
        </button>
        <div className="flex gap-1 shrink-0">
          {editing ? (
            <Button variant="primary" onClick={stopEdit}>
              {da.common.done}
            </Button>
          ) : (
            <Button onClick={onStartEdit}>{da.common.edit}</Button>
          )}
          <Button variant="danger" onClick={onDelete}>
            {da.common.delete}
          </Button>
        </div>
      </div>

      {/* ---------- body (unfolded) ---------- */}
      {open && (
        <div className="border-t border-slate-200 p-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>{da.common.name}</Label>
              {editing ? (
                <Input
                  value={recipe.name}
                  autoFocus
                  onChange={(e) => patch({ name: e.target.value })}
                />
              ) : (
                <ReadOnly>{recipe.name || "—"}</ReadOnly>
              )}
            </div>
            <div>
              <Label>{da.recipes.feedsPeople}</Label>
              {editing ? (
                <NumberInput
                  min={0}
                  value={recipe.feedsPeople}
                  onChange={(n) => patch({ feedsPeople: n ?? 0 })}
                />
              ) : (
                <ReadOnly>{formatNumber(recipe.feedsPeople)}</ReadOnly>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>{da.recipes.ingredientRows}</Label>
            </div>

            <ItemRows
              rows={recipe.ingredients}
              editing={editing}
              onChange={(rows) =>
                patch({ ingredients: rows as RecipeIngredient[] })
              }
              addLabel={da.recipes.addIngredient}
              emptyLabel={da.recipes.noIngredients}
            />
          </div>

          <div>
            <Label>{da.common.notes}</Label>
            {editing ? (
              <Textarea
                rows={2}
                value={recipe.notes ?? ""}
                onChange={(e) => patch({ notes: e.target.value })}
              />
            ) : (
              <ReadOnly>{recipe.notes || "—"}</ReadOnly>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ReadOnly({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm px-2 py-1.5 bg-slate-50 border border-transparent rounded-md text-slate-800 whitespace-pre-wrap">
      {children}
    </div>
  );
}
