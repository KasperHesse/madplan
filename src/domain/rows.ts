/** Shape shared by recipe ingredients, meal extra items and day extra items. */
export interface ItemRow {
  ingredientId: string;
  amount: number;
  unitId: string;
}

/** Rows without a chosen ingredient are meaningless – drop them. */
export function pruneRows<T extends ItemRow>(rows: T[]): T[] {
  return rows.filter((r) => r.ingredientId !== "");
}

/** True if any row still lacks an ingredient (blocks adding another row). */
export function hasIncompleteRow(rows: ItemRow[]): boolean {
  return rows.some((r) => r.ingredientId === "");
}
