import { useEffect, useRef, useState } from "react";
import { useStore } from "../store/useStore";
import { IngredientPicker } from "./IngredientPicker";
import { Button, IconButton, NumberInput, Select } from "./ui/primitives";
import { formatNumber } from "../domain/units";
import { da } from "../i18n/da";
import { hasIncompleteRow, type ItemRow } from "../domain/rows";

export { pruneRows, hasIncompleteRow } from "../domain/rows";
export type { ItemRow } from "../domain/rows";


/**
 * Single-column, edit-in-place list of ingredient/amount/unit rows.
 *
 * Pressing Enter in a row appends a new row and focuses it, so a whole
 * ingredient list can be typed without touching the mouse. Enter inside the
 * ingredient autocomplete picks the highlighted match instead (the picker
 * stops propagation), so the flow is: type → Enter (pick) → Tab → amount →
 * Enter (new row).
 */
export function ItemRows({
  rows,
  onChange,
  editing,
  addLabel,
  emptyLabel,
}: {
  rows: ItemRow[];
  onChange: (rows: ItemRow[]) => void;
  editing: boolean;
  addLabel: string;
  emptyLabel: string;
}) {
  const ingredients = useStore((s) => s.ingredients);
  const units = useStore((s) => s.units);
  const [focusIdx, setFocusIdx] = useState<number | null>(null);
  const prevLen = useRef(rows.length);

  useEffect(() => {
    // only auto-focus rows that were just appended, never on re-render
    if (rows.length <= prevLen.current) setFocusIdx(null);
    prevLen.current = rows.length;
  }, [rows.length]);

  function unitSym(id: string) {
    return units.find((u) => u.id === id)?.symbol ?? id;
  }
  function ingName(id: string) {
    return ingredients.find((i) => i.id === id)?.masterName ?? "—";
  }

  function addRow() {
    onChange([...rows, { ingredientId: "", amount: 0, unitId: "u_g" }]);
    setFocusIdx(rows.length);
  }

  function updateRow(idx: number, p: Partial<ItemRow>) {
    onChange(
      rows.map((row, i) => {
        if (i !== idx) return row;
        const merged = { ...row, ...p };
        if (p.ingredientId) {
          const ing = ingredients.find((x) => x.id === p.ingredientId);
          if (ing && !ing.allowedUnitIds.includes(merged.unitId)) {
            merged.unitId = ing.defaultDisplayUnitId;
          }
        }
        return merged;
      }),
    );
  }

  function removeRow(idx: number) {
    onChange(rows.filter((_, i) => i !== idx));
  }

  const blockAdd = hasIncompleteRow(rows);

  return (
    <div>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400">{emptyLabel}</p>
      ) : (
        <ul className="space-y-1">
          {rows.map((row, idx) => {
            const ing = ingredients.find((i) => i.id === row.ingredientId);
            const unitOpts = ing ? ing.allowedUnitIds : units.map((u) => u.id);
            if (!editing) {
              return (
                <li key={idx}>
                  <div className="text-sm py-0.5 border-b border-slate-100 flex gap-2">
                    <span className="font-mono text-slate-600 w-28 shrink-0">
                      {formatNumber(row.amount)} {unitSym(row.unitId)}
                    </span>
                    <span>{ingName(row.ingredientId)}</span>
                  </div>
                </li>
              );
            }
            return (
              <li
                key={idx}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  if (rows[idx].ingredientId === "") return;
                  addRow();
                }}
              >
                <div className="grid grid-cols-[1fr_5.5rem_5.5rem_auto] gap-1 items-start">
                  <IngredientPicker
                    value={row.ingredientId}
                    autoFocus={focusIdx === idx}
                    onChange={(id) => updateRow(idx, { ingredientId: id })}
                  />
                  <NumberInput
                    min={0}
                    value={row.amount}
                    onChange={(n) => updateRow(idx, { amount: n ?? 0 })}
                  />
                  <Select
                    value={row.unitId}
                    onChange={(e) => updateRow(idx, { unitId: e.target.value })}
                  >
                    {unitOpts.map((uid) => (
                      <option key={uid} value={uid}>
                        {unitSym(uid)}
                      </option>
                    ))}
                  </Select>
                  <IconButton
                    onClick={() => removeRow(idx)}
                    title={da.common.delete}
                  >
                    ✕
                  </IconButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <div className="mt-1 flex items-center gap-2">
          <Button onClick={addRow} disabled={blockAdd}>
            + {addLabel}
          </Button>
          {blockAdd ? (
            <span className="text-xs text-slate-500">
              {da.common.finishRowFirst}
            </span>
          ) : (
            rows.length > 0 && (
              <span className="text-xs text-slate-400">
                {da.common.enterHint}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
}
