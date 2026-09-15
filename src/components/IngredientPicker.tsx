import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../store/useStore";
import type { Ingredient } from "../domain/types";
import { Input, Button } from "./ui/primitives";
import { IngredientEditor, makeBlankIngredient } from "./IngredientEditor";
import { da } from "../i18n/da";

interface Props {
  value: string; // ingredient id, or "" if none
  onChange: (id: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
}

/** Rank a match: lower is better. Exact name match first, then "starts with"
 * (name, then alias), then "contains" (name, then alias). This way typing
 * "Te" surfaces "Te" before "Hytteost", which merely contains the substring. */
function matchRank(i: Ingredient, q: string): number {
  const name = i.masterName.toLowerCase();
  if (name === q) return 0;
  if (name.startsWith(q)) return 1;
  if (i.aliases.some((a) => a.toLowerCase().startsWith(q))) return 2;
  if (name.includes(q)) return 3;
  return 4; // alias contains-match; membership already checked by the caller
}

/**
 * Autocomplete for ingredient selection. Only accepts items from the DB.
 * Search matches master name + aliases, prioritizing prefix matches over
 * matches that merely contain the typed substring.
 *
 * Keyboard: ↑/↓ moves the highlight, Enter picks the highlighted match and
 * closes the list. When the list is closed, Enter is left unhandled so the
 * surrounding row can use it to add a new row. When nothing matches, an
 * "opret ny ingrediens" action lets the user add it from right here.
 */
export function IngredientPicker({
  value,
  onChange,
  autoFocus,
  placeholder,
}: Props) {
  const ingredients = useStore((s) => s.ingredients);
  const categories = useStore((s) => s.categories);
  const upsertIngredient = useStore((s) => s.upsertIngredient);
  const byId = useMemo(
    () => new Map(ingredients.map((i) => [i.id, i])),
    [ingredients],
  );
  const selected = value ? byId.get(value) : undefined;

  const [query, setQuery] = useState(selected?.masterName ?? "");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [creating, setCreating] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(selected?.masterName ?? "");
  }, [selected?.id, selected?.masterName]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const matches = useMemo<Ingredient[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ingredients.slice(0, 30);
    return ingredients
      .filter((i) => {
        if (i.masterName.toLowerCase().includes(q)) return true;
        return i.aliases.some((a) => a.toLowerCase().includes(q));
      })
      .sort((a, b) => {
        const r = matchRank(a, q) - matchRank(b, q);
        return r !== 0 ? r : a.masterName.localeCompare(b.masterName, "da");
      })
      .slice(0, 30);
  }, [ingredients, query]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  function pick(i: Ingredient) {
    onChange(i.id);
    setQuery(i.masterName);
    setOpen(false);
  }

  function startCreate() {
    setOpen(false);
    setCreating(true);
  }

  return (
    <div ref={rootRef} className="relative">
      <Input
        value={query}
        placeholder={placeholder ?? "Vælg ingrediens..."}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoFocus={autoFocus}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setHighlight((h) => Math.min(h + 1, matches.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Escape") {
            setOpen(false);
          } else if (e.key === "Enter") {
            if (open && matches[highlight]) {
              // consume Enter: it selects, it must not also add a new row
              e.preventDefault();
              e.stopPropagation();
              pick(matches[highlight]);
            }
          } else if (e.key === "Tab") {
            // Tabbing out of an open dropdown with a highlighted match should
            // finalize that selection instead of leaving the field half-typed.
            if (open && matches[highlight] && matches[highlight].id !== value) {
              pick(matches[highlight]);
            }
          }
        }}
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full max-h-64 overflow-auto bg-white border border-slate-300 rounded-md shadow-lg text-sm">
          {matches.map((i, idx) => (
            <li
              key={i.id}
              className={`px-2 py-1.5 cursor-pointer hover:bg-teal-50 ${
                idx === highlight ? "bg-teal-50" : ""
              } ${i.id === value ? "bg-teal-100" : ""}`}
              onMouseEnter={() => setHighlight(idx)}
              onClick={() => pick(i)}
            >
              <div className="font-medium">{i.masterName}</div>
              <div className="text-xs text-slate-500">
                {i.category}
                {i.aliases.length > 0 && ` · også: ${i.aliases.join(", ")}`}
              </div>
            </li>
          ))}
        </ul>
      )}
      {open && matches.length === 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-300 rounded-md shadow-lg p-2 text-sm text-slate-600 space-y-2">
          <p>{da.ingredients.noMatch}</p>
          <Button
            variant="primary"
            onClick={startCreate}
            className="w-full justify-center"
          >
            + {query.trim() ? da.ingredients.addNamed(query.trim()) : da.ingredients.new}
          </Button>
        </div>
      )}
      {creating && (
        <IngredientEditor
          ingredient={makeBlankIngredient(categories, query.trim())}
          isNew
          onCancel={() => setCreating(false)}
          onSave={(i) => {
            upsertIngredient(i);
            setCreating(false);
            pick(i);
          }}
        />
      )}
    </div>
  );
}
