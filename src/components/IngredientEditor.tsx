import { useState } from "react";
import { newId, useStore } from "../store/useStore";
import { da } from "../i18n/da";
import type { Ingredient, ItemConversion } from "../domain/types";
import {
  Button,
  Input,
  Label,
  NumberInput,
  Select,
} from "./ui/primitives";
import { unitAutoGroup, METRIC_VOLUME_UNIT_IDS } from "../domain/units";

/** A blank ingredient draft, ready to hand to <IngredientEditor>. Starts with
 * no units selected – the user must explicitly turn on the units this
 * ingredient supports (Vægt, Volumen, Ske-mål, ...) before it can be saved. */
export function makeBlankIngredient(
  categories: string[],
  masterName = "",
): Ingredient {
  return {
    id: newId("i"),
    masterName,
    aliases: [],
    category: categories[0] ?? "Andet",
    allowedUnitIds: [],
    defaultDisplayUnitId: "",
    itemConversions: [],
  };
}


export function IngredientEditor({
  ingredient,
  isNew,
  onCancel,
  onSave,
}: {
  ingredient: Ingredient;
  /** Defaults to true when the draft has no name yet (the normal "Ny ingrediens" flow). */
  isNew?: boolean;
  onCancel: () => void;
  onSave: (i: Ingredient) => void;
}) {
  const creating = isNew ?? ingredient.masterName.trim().length === 0;
  const units = useStore((s) => s.units);
  const categories = useStore((s) => s.categories);
  const [draft, setDraft] = useState<Ingredient>(ingredient);
  // Raw text for the alias field. Splitting/rejoining on every keystroke would
  // swallow the space and comma the user is in the middle of typing, so the
  // text is kept verbatim here and only parsed on save.
  const [aliasText, setAliasText] = useState(ingredient.aliases.join(", "));

  function parsedAliases(): string[] {
    return aliasText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function toggleUnit(uid: string) {
    setDraft((d) => {
      // Mass units, and the metric volume units (ml/cl/dl/l), are all
      // mutually convertible, so picking any one of them pulls in the whole
      // group. Spoon measures (spsk/tsk) and count units toggle on their own.
      const groupIds = unitAutoGroup(units, uid);

      const allIn = groupIds.every((id) => d.allowedUnitIds.includes(id));
      const next = allIn
        ? d.allowedUnitIds.filter((id) => !groupIds.includes(id))
        : Array.from(new Set([...d.allowedUnitIds, ...groupIds]));

      // Zero units is allowed transiently (e.g. while switching from one
      // group to another) but blocks saving via `canSave` below.
      const defaultId = next.includes(d.defaultDisplayUnitId)
        ? d.defaultDisplayUnitId
        : (next[0] ?? d.defaultDisplayUnitId);
      return { ...d, allowedUnitIds: next, defaultDisplayUnitId: defaultId };
    });
  }

  function addConversion() {
    const first = draft.allowedUnitIds[0] ?? "u_g";
    const second = draft.allowedUnitIds[1] ?? "u_spsk";
    const c: ItemConversion = {
      fromUnitId: second,
      toUnitId: first,
      factor: 1,
    };
    setDraft((d) => ({ ...d, itemConversions: [...d.itemConversions, c] }));
  }

  function updateConv(idx: number, patch: Partial<ItemConversion>) {
    setDraft((d) => ({
      ...d,
      itemConversions: d.itemConversions.map((c, i) =>
        i === idx ? { ...c, ...patch } : c,
      ),
    }));
  }

  function removeConv(idx: number) {
    setDraft((d) => ({
      ...d,
      itemConversions: d.itemConversions.filter((_, i) => i !== idx),
    }));
  }

  const canSave = draft.masterName.trim().length > 0 && draft.allowedUnitIds.length > 0;

  return (
    <div className="fixed inset-0 bg-black/40 z-30 flex items-start justify-center p-4 overflow-auto no-print">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-5 space-y-3">
        <h2 className="text-lg font-bold">
          {creating ? da.ingredients.new : da.common.edit}
        </h2>

        <div>
          <Label>{da.ingredients.masterName}</Label>
          <Input
            value={draft.masterName}
            onChange={(e) => setDraft({ ...draft, masterName: e.target.value })}
            autoFocus
          />
        </div>

        <div>
          <Label>{da.ingredients.aliases}</Label>
          <Input
            value={aliasText}
            onChange={(e) => setAliasText(e.target.value)}
            placeholder={da.ingredients.aliasesHelp}
          />
        </div>

        <div>
          <Label>{da.common.category}</Label>
          <Select
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>{da.ingredients.allowedUnits}</Label>
          <p className="text-xs text-slate-500 mb-1">
            {da.ingredients.allowedUnitsHelp}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { label: da.ingredients.unitCategory.mass, isGroup: true, units: units.filter((u) => u.category === "mass") },
                { label: da.ingredients.unitCategory.volume, isGroup: true, units: units.filter((u) => METRIC_VOLUME_UNIT_IDS.includes(u.id)) },
                { label: da.ingredients.unitCategory.spoon, isGroup: true, units: units.filter((u) => u.id === "u_spsk" || u.id === "u_tsk") },
                { label: da.ingredients.unitCategory.count, isGroup: false, units: units.filter((u) => u.category === "count") },
                { label: da.ingredients.unitCategory.other, isGroup: false, units: units.filter((u) => u.category === "other") },
              ] as const
            ).map((row) => {
              if (row.units.length === 0) return null;
              if (row.isGroup) {
                // Mass/volume/spoon units are each mutually convertible, so a
                // single toggle turns the whole group on or off at once. The
                // button is only "active" once every unit in the group is
                // present, matching the direction toggleUnit() will take
                // (fully-in groups get removed, anything else gets completed).
                const active = row.units.every((u) =>
                  draft.allowedUnitIds.includes(u.id),
                );
                return (
                  <button
                    key={row.label}
                    type="button"
                    onClick={() => toggleUnit(row.units[0].id)}
                    title={da.ingredients.unitGroupHint}
                    className={`px-2 py-1 rounded text-xs border ${
                      active
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {row.label} ({row.units.map((u) => u.symbol).join(", ")})
                  </button>
                );
              }
              return row.units.map((u) => {
                const active = draft.allowedUnitIds.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleUnit(u.id)}
                    className={`px-2 py-1 rounded text-xs border ${
                      active
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-white border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {u.symbol}
                  </button>
                );
              });
            })}
          </div>
        </div>

        <div>
          <Label>{da.ingredients.defaultUnit}</Label>
          <Select
            value={draft.defaultDisplayUnitId}
            onChange={(e) =>
              setDraft({ ...draft, defaultDisplayUnitId: e.target.value })
            }
          >
            {draft.allowedUnitIds.map((uid) => {
              const u = units.find((u) => u.id === uid);
              return (
                <option key={uid} value={uid}>
                  {u?.name ?? uid} ({u?.symbol ?? uid})
                </option>
              );
            })}
          </Select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Label>{da.ingredients.itemConversions}</Label>
            <Button onClick={addConversion}>+ {da.ingredients.addConversion}</Button>
          </div>
          <p className="text-xs text-slate-500 mb-1">
            {da.ingredients.itemConversionsHelp}
          </p>
          {draft.itemConversions.length === 0 && (
            <p className="text-xs text-slate-400">–</p>
          )}
          <div className="space-y-1">
            {draft.itemConversions.map((c, idx) => (
              <div key={idx} className="flex gap-1 items-center">
                <span className="text-sm">1</span>
                <Select
                  value={c.fromUnitId}
                  onChange={(e) =>
                    updateConv(idx, { fromUnitId: e.target.value })
                  }
                  className="!w-auto"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.symbol}
                    </option>
                  ))}
                </Select>
                <span className="text-sm">=</span>
                <NumberInput
                  min={0}
                  value={c.factor}
                  onChange={(n) => updateConv(idx, { factor: n ?? 0 })}
                  className="!w-24"
                />
                <Select
                  value={c.toUnitId}
                  onChange={(e) => updateConv(idx, { toUnitId: e.target.value })}
                  className="!w-auto"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.symbol}
                    </option>
                  ))}
                </Select>
                <Button variant="ghost" onClick={() => removeConv(idx)}>
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>{da.common.notes}</Label>
          <Input
            value={draft.notes ?? ""}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onCancel}>{da.common.cancel}</Button>
          <Button
            variant="primary"
            disabled={!canSave}
            onClick={() => onSave({ ...draft, aliases: parsedAliases() })}
          >
            {da.common.save}
          </Button>
        </div>
      </div>
    </div>
  );
}
