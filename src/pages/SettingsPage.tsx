import { useRef } from "react";
import { useStore } from "../store/useStore";
import { da, plural, words } from "../i18n/da";
import { Button, Card, Input, Label, NumberInput } from "../components/ui/primitives";

export function SettingsPage() {
  // NOTE: each value is selected individually. Returning a freshly-built object
  // from a Zustand v5 selector creates a new reference on every render and
  // triggers an infinite update loop (React error #185).
  const settings = useStore((s) => s.settings);
  const ingredientCount = useStore((s) => s.ingredients.length);
  const recipeCount = useStore((s) => s.recipes.length);
  const dayCount = useStore((s) => s.days.length);
  const schemaVersion = useStore((s) => s.schemaVersion);
  const days = useStore((s) => s.days);

  const update = useStore((s) => s.updateSettings);
  const reset = useStore((s) => s.resetToSeed);
  const importState = useStore((s) => s.importState);
  const exportState = useStore((s) => s.exportState);

  const fileRef = useRef<HTMLInputElement>(null);

  const mealCount = days.reduce((n, d) => n + d.meals.length, 0);

  function doExport() {
    const data = exportState();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const a = document.createElement("a");
    a.href = url;
    a.download = `lejrindkoeb-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function doImport(file: File) {
    if (!confirm(da.settings.importConfirm)) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result));
        const res = importState(raw);
        if (!res.ok) alert(`${da.settings.importBad}: ${res.error}`);
        else alert(da.settings.importOk);
      } catch (err) {
        alert(`${da.settings.importBad}: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold">{da.settings.title}</h1>

      <Card className="space-y-3">
        <div>
          <Label>{da.settings.campName}</Label>
          <Input
            value={settings.campName}
            onChange={(e) => update({ campName: e.target.value })}
          />
        </div>
        <div>
          <Label>{da.settings.defaultParticipants}</Label>
          <NumberInput
            min={0}
            value={settings.defaultParticipants}
            onChange={(n) => update({ defaultParticipants: n ?? 0 })}
          />
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-semibold">{da.settings.data}</h2>
        <p className="text-sm text-slate-600">
          {da.settings.counts}: {plural(ingredientCount, ...words.ingredient)},{" "}
          {plural(recipeCount, ...words.recipe)}, {plural(dayCount, ...words.day)},{" "}
          {plural(mealCount, ...words.meal)} ·{" "}
          {da.settings.schemaVersion} {schemaVersion}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={doExport}>
            {da.settings.exportBtn}
          </Button>
          <Button onClick={() => fileRef.current?.click()}>
            {da.settings.importBtn}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) doImport(f);
              e.target.value = "";
            }}
          />
          <Button
            variant="danger"
            onClick={() => {
              if (confirm(da.settings.resetConfirm)) reset();
            }}
          >
            {da.settings.resetBtn}
          </Button>
        </div>
        <p className="text-xs text-slate-500">{da.settings.storageNote}</p>
      </Card>
    </div>
  );
}
