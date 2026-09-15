import type { GlobalConversion, Unit } from "../domain/types";

export const seedUnits: Unit[] = [
  { id: "u_g", name: "gram", symbol: "g", category: "mass" },
  { id: "u_kg", name: "kilogram", symbol: "kg", category: "mass" },
  { id: "u_ml", name: "milliliter", symbol: "ml", category: "volume" },
  { id: "u_cl", name: "centiliter", symbol: "cl", category: "volume" },
  { id: "u_dl", name: "deciliter", symbol: "dl", category: "volume" },
  { id: "u_l", name: "liter", symbol: "l", category: "volume" },
  { id: "u_spsk", name: "spiseske", symbol: "spsk", category: "volume" },
  { id: "u_tsk", name: "teske", symbol: "tsk", category: "volume" },
  { id: "u_knsp", name: "knivspids", symbol: "knsp", category: "other" },
  { id: "u_stk", name: "stykker", symbol: "stk", category: "count" },
  { id: "u_pk", name: "pakke", symbol: "pk", category: "count" },
  { id: "u_dase", name: "dåse", symbol: "dåse", category: "count" },
  { id: "u_bdt", name: "bundt", symbol: "bdt", category: "count" },
  { id: "u_fed", name: "fed", symbol: "fed", category: "count" },
];

export const seedGlobalConversions: GlobalConversion[] = [
  // mass
  { fromUnitId: "u_kg", toUnitId: "u_g", factor: 1000 },
  // volume
  { fromUnitId: "u_l", toUnitId: "u_dl", factor: 10 },
  { fromUnitId: "u_dl", toUnitId: "u_cl", factor: 10 },
  { fromUnitId: "u_cl", toUnitId: "u_ml", factor: 10 },
  { fromUnitId: "u_spsk", toUnitId: "u_ml", factor: 15 },
  { fromUnitId: "u_tsk", toUnitId: "u_ml", factor: 5 },
];

export const seedCategories: string[] = [
  "Mejeri",
  "Kød & fisk",
  "Frugt & grønt",
  "Tørvarer",
  "Bageri",
  "Krydderier",
  "Konserves",
  "Frost",
  "Drikkevarer",
  "Snacks",
  "Andet",
];
