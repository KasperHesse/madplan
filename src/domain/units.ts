import type { GlobalConversion, Ingredient, Unit } from "./types";

export interface ConversionEdge {
  fromUnitId: string;
  toUnitId: string;
  factor: number;
}

/**
 * Build the conversion graph for a specific ingredient by combining
 * global conversions with the ingredient's own per-item conversions.
 * Item conversions override globals for the same (from,to) pair.
 */
export function buildConversionGraph(
  globals: GlobalConversion[],
  ingredient?: Ingredient,
): Map<string, ConversionEdge[]> {
  const graph = new Map<string, ConversionEdge[]>();
  const seen = new Set<string>();

  const addEdge = (from: string, to: string, factor: number) => {
    const key = `${from}->${to}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (!graph.has(from)) graph.set(from, []);
    graph.get(from)!.push({ fromUnitId: from, toUnitId: to, factor });
    // reverse
    const revKey = `${to}->${from}`;
    if (!seen.has(revKey)) {
      seen.add(revKey);
      if (!graph.has(to)) graph.set(to, []);
      graph.get(to)!.push({ fromUnitId: to, toUnitId: from, factor: 1 / factor });
    }
  };

  // Per-item first (win by insertion order)
  if (ingredient) {
    for (const c of ingredient.itemConversions) {
      addEdge(c.fromUnitId, c.toUnitId, c.factor);
    }
  }
  for (const c of globals) {
    addEdge(c.fromUnitId, c.toUnitId, c.factor);
  }
  return graph;
}

/**
 * Attempt to convert amount from `fromUnitId` to `toUnitId` using the graph.
 * Returns null if no path exists (non-lossless / not convertible here).
 */
export function convert(
  amount: number,
  fromUnitId: string,
  toUnitId: string,
  graph: Map<string, ConversionEdge[]>,
): number | null {
  if (fromUnitId === toUnitId) return amount;
  // BFS over unit graph, multiplying factors
  const queue: Array<{ unit: string; factor: number }> = [
    { unit: fromUnitId, factor: 1 },
  ];
  const visited = new Set<string>([fromUnitId]);
  while (queue.length) {
    const { unit, factor } = queue.shift()!;
    const edges = graph.get(unit) ?? [];
    for (const e of edges) {
      if (visited.has(e.toUnitId)) continue;
      const nextFactor = factor * e.factor;
      if (e.toUnitId === toUnitId) return amount * nextFactor;
      visited.add(e.toUnitId);
      queue.push({ unit: e.toUnitId, factor: nextFactor });
    }
  }
  return null;
}

export interface AggregatedContribution {
  amount: number;
  unitId: string;
}

/**
 * Sum a list of (amount, unit) contributions for one ingredient into a
 * target display unit. Contributions that can't be losslessly converted
 * are returned as separate "leftover" groups keyed by their original unit.
 */
export function aggregateContributions(
  contributions: AggregatedContribution[],
  targetUnitId: string,
  graph: Map<string, ConversionEdge[]>,
): { converted: number; leftovers: Map<string, number> } {
  let converted = 0;
  const leftovers = new Map<string, number>();
  for (const c of contributions) {
    if (c.amount === 0) continue;
    const v = convert(c.amount, c.unitId, targetUnitId, graph);
    if (v !== null) {
      converted += v;
    } else {
      leftovers.set(c.unitId, (leftovers.get(c.unitId) ?? 0) + c.amount);
    }
  }
  return { converted, leftovers };
}

export function formatNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  const rounded = Math.round(n * 100) / 100;
  return rounded.toLocaleString("da-DK", { maximumFractionDigits: 2 });
}

export function unitLabel(units: Unit[], id: string): string {
  return units.find((u) => u.id === id)?.symbol ?? id;
}

/**
 * Ids of units that are "interchangeable enough" that picking one should
 * auto-select the rest: all mass units, and the metric volume units
 * (ml/cl/dl/l). Spoon measures (spsk/tsk) form their own group – not every
 * volume ingredient makes sense in teaspoons, and spice-type ingredients
 * often want a mass unit plus just tbsp/tsp, without pulling in ml/cl/dl/l.
 */
const METRIC_VOLUME_IDS = new Set(["u_ml", "u_cl", "u_dl", "u_l"]);
export const METRIC_VOLUME_UNIT_IDS = Array.from(METRIC_VOLUME_IDS);
const SPOON_IDS = new Set(["u_spsk", "u_tsk"]);
export const SPOON_UNIT_IDS = Array.from(SPOON_IDS);

export function unitAutoGroup(units: Unit[], unitId: string): string[] {
  const unit = units.find((u) => u.id === unitId);
  if (!unit) return [unitId];
  if (unit.category === "mass") {
    return units.filter((u) => u.category === "mass").map((u) => u.id);
  }
  if (METRIC_VOLUME_IDS.has(unitId)) {
    return units
      .filter((u) => METRIC_VOLUME_IDS.has(u.id))
      .map((u) => u.id);
  }
  if (SPOON_IDS.has(unitId)) {
    return units.filter((u) => SPOON_IDS.has(u.id)).map((u) => u.id);
  }
  return [unitId];
}

