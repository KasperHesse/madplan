import type { Ingredient, ItemConversion } from "../domain/types";

// Helper: makes an ingredient with common defaults
function ing(
  id: string,
  masterName: string,
  category: string,
  allowedUnitIds: string[],
  defaultDisplayUnitId: string,
  extras: Partial<Pick<Ingredient, "aliases" | "itemConversions" | "notes">> = {},
): Ingredient {
  return {
    id,
    masterName,
    aliases: extras.aliases ?? [],
    category,
    allowedUnitIds,
    defaultDisplayUnitId,
    itemConversions: extras.itemConversions ?? [],
    notes: extras.notes,
  };
}

// Common unit sets
const MASS = ["u_g", "u_kg"];
const MASS_SM = ["u_g", "u_kg", "u_spsk", "u_tsk"];
const VOL = ["u_ml", "u_dl", "u_l"];
const VOL_SM = ["u_ml", "u_dl", "u_l", "u_spsk", "u_tsk"];
const COUNT = ["u_stk"];
const COUNT_PK = ["u_stk", "u_pk"];
const BUNDT = ["u_stk", "u_bdt", "u_g"];
const DASE = ["u_dase", "u_g"];

// Per-item conversions for common baking staples
const flourConv: ItemConversion[] = [
  { fromUnitId: "u_spsk", toUnitId: "u_g", factor: 9 },
  { fromUnitId: "u_dl", toUnitId: "u_g", factor: 60 },
];
const sugarConv: ItemConversion[] = [
  { fromUnitId: "u_spsk", toUnitId: "u_g", factor: 12 },
  { fromUnitId: "u_dl", toUnitId: "u_g", factor: 85 },
];
const brownSugarConv: ItemConversion[] = [
  { fromUnitId: "u_spsk", toUnitId: "u_g", factor: 13 },
  { fromUnitId: "u_dl", toUnitId: "u_g", factor: 90 },
];
const saltConv: ItemConversion[] = [
  { fromUnitId: "u_tsk", toUnitId: "u_g", factor: 5 },
  { fromUnitId: "u_spsk", toUnitId: "u_g", factor: 15 },
];
const butterConv: ItemConversion[] = [
  { fromUnitId: "u_spsk", toUnitId: "u_g", factor: 14 },
];
const oilConv: ItemConversion[] = [
  { fromUnitId: "u_spsk", toUnitId: "u_g", factor: 13 },
  { fromUnitId: "u_dl", toUnitId: "u_g", factor: 92 },
];
const oatsConv: ItemConversion[] = [
  { fromUnitId: "u_dl", toUnitId: "u_g", factor: 35 },
];
const riceConv: ItemConversion[] = [
  { fromUnitId: "u_dl", toUnitId: "u_g", factor: 80 },
];

export const seedIngredients: Ingredient[] = [
  // ------- Mejeri -------
  ing("i_maelk", "Mælk, letmælk", "Mejeri", VOL, "u_l", { aliases: ["mælk"] }),
  ing("i_sodmaelk", "Sødmælk", "Mejeri", VOL, "u_l"),
  ing("i_skummetmaelk", "Skummetmælk", "Mejeri", VOL, "u_l"),
  ing("i_kaernemaelk", "Kærnemælk", "Mejeri", VOL, "u_l"),
  ing("i_yoghurt", "Yoghurt naturel", "Mejeri", VOL, "u_l"),
  ing("i_flode", "Piskefløde", "Mejeri", VOL_SM, "u_dl", { aliases: ["fløde"] }),
  ing("i_madlavflode", "Madlavningsfløde", "Mejeri", VOL_SM, "u_dl"),
  ing("i_cremefraiche", "Creme fraiche", "Mejeri", VOL_SM, "u_dl"),
  ing("i_smor", "Smør", "Mejeri", MASS_SM, "u_g", {
    aliases: ["smør"],
    itemConversions: butterConv,
  }),
  ing("i_margarine", "Margarine", "Mejeri", MASS_SM, "u_g"),
  ing("i_ost_gul", "Gul ost i skiver", "Mejeri", MASS, "u_g", {
    aliases: ["ost, gul", "ost"],
  }),
  ing("i_flodost", "Flødeost", "Mejeri", MASS, "u_g"),
  ing("i_feta", "Feta", "Mejeri", MASS, "u_g"),
  ing("i_mozzarella", "Mozzarella", "Mejeri", MASS, "u_g"),
  ing("i_parmesan", "Parmesan", "Mejeri", MASS, "u_g"),
  ing("i_hytteost", "Hytteost", "Mejeri", MASS, "u_g"),
  ing("i_skyr", "Skyr", "Mejeri", MASS, "u_g"),
  ing("i_aeg", "Æg", "Mejeri", COUNT, "u_stk", { aliases: ["æg"] }),

  // ------- Kød & fisk -------
  ing("i_hakket_okse", "Hakket oksekød", "Kød & fisk", MASS, "u_kg", {
    aliases: ["oksekød, hakket"],
  }),
  ing("i_hakket_svin", "Hakket svinekød", "Kød & fisk", MASS, "u_kg"),
  ing("i_hakket_blandet", "Hakket blandet (okse/svin)", "Kød & fisk", MASS, "u_kg"),
  ing("i_hakket_kylling", "Hakket kylling", "Kød & fisk", MASS, "u_kg"),
  ing("i_kyllingebryst", "Kyllingebryst", "Kød & fisk", MASS, "u_kg"),
  ing("i_kyllingelaar", "Kyllingelår", "Kød & fisk", MASS, "u_kg"),
  ing("i_kylling_hel", "Hel kylling", "Kød & fisk", COUNT, "u_stk"),
  ing("i_svinekotelet", "Svinekotelet", "Kød & fisk", MASS, "u_kg"),
  ing("i_svinemorbrad", "Svinemørbrad", "Kød & fisk", MASS, "u_kg"),
  ing("i_bacon", "Bacon", "Kød & fisk", MASS, "u_g"),
  ing("i_medisterpolse", "Medisterpølse", "Kød & fisk", MASS, "u_kg"),
  ing("i_polser", "Pølser", "Kød & fisk", COUNT_PK, "u_stk"),
  ing("i_frikadeller", "Frikadeller (færdige)", "Kød & fisk", MASS, "u_g"),
  ing("i_leverpostej", "Leverpostej", "Kød & fisk", MASS, "u_g"),
  ing("i_spegepolse", "Spegepølse", "Kød & fisk", MASS, "u_g"),
  ing("i_skinke", "Skinke", "Kød & fisk", MASS, "u_g"),
  ing("i_kalkun", "Kalkun (pålæg)", "Kød & fisk", MASS, "u_g"),
  ing("i_laks", "Laks", "Kød & fisk", MASS, "u_g"),
  ing("i_torsk", "Torsk", "Kød & fisk", MASS, "u_g"),
  ing("i_rejer", "Rejer", "Kød & fisk", MASS, "u_g"),
  ing("i_tun_dase", "Tun på dåse", "Kød & fisk", DASE, "u_dase"),
  ing("i_makrel_dase", "Makrel i tomat", "Kød & fisk", DASE, "u_dase"),
  ing("i_fiskefrikadeller", "Fiskefrikadeller", "Kød & fisk", COUNT, "u_stk"),

  // ------- Frugt & grønt -------
  ing("i_kartofler", "Kartofler", "Frugt & grønt", MASS, "u_kg"),
  ing("i_lon", "Løg", "Frugt & grønt", COUNT, "u_stk", { aliases: ["løg"] }),
  ing("i_rodlog", "Rødløg", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_hvidlog", "Hvidløg", "Frugt & grønt", ["u_fed", "u_stk"], "u_fed"),
  ing("i_porrer", "Porrer", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_gulerodder", "Gulerødder", "Frugt & grønt", MASS, "u_kg", {
    aliases: ["gulerod"],
  }),
  ing("i_persillerod", "Persillerod", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_selleri", "Knoldselleri", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_bladselleri", "Bladselleri", "Frugt & grønt", BUNDT, "u_bdt"),
  ing("i_tomat", "Tomater", "Frugt & grønt", MASS, "u_kg", {
    aliases: ["tomat"],
  }),
  ing("i_cherrytomat", "Cherrytomater", "Frugt & grønt", MASS, "u_g"),
  ing("i_agurk", "Agurk", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_peberfrugt_rod", "Rød peberfrugt", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_peberfrugt_gron", "Grøn peberfrugt", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_peberfrugt_gul", "Gul peberfrugt", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_salat_hoved", "Hovedsalat", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_salat_iceberg", "Icebergsalat", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_babyspinat", "Babyspinat", "Frugt & grønt", MASS, "u_g"),
  ing("i_ruccola", "Rucola", "Frugt & grønt", MASS, "u_g"),
  ing("i_broccoli", "Broccoli", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_blomkaal", "Blomkål", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_hvidkaal", "Hvidkål", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_spidskaal", "Spidskål", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_rodkaal", "Rødkål", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_squash", "Squash", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_aubergine", "Aubergine", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_champignon", "Champignon", "Frugt & grønt", MASS, "u_g"),
  ing("i_majskolber", "Majskolber", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_avocado", "Avocado", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_citron", "Citron", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_lime", "Lime", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_appelsin", "Appelsin", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_bananer", "Bananer", "Frugt & grønt", COUNT, "u_stk", {
    aliases: ["banan"],
  }),
  ing("i_aebler", "Æbler", "Frugt & grønt", COUNT, "u_stk", {
    aliases: ["æbler", "æble"],
  }),
  ing("i_paerer", "Pærer", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_druer", "Druer", "Frugt & grønt", MASS, "u_g"),
  ing("i_jordbaer", "Jordbær", "Frugt & grønt", MASS, "u_g"),
  ing("i_blaabaer", "Blåbær", "Frugt & grønt", MASS, "u_g"),
  ing("i_hindbaer", "Hindbær", "Frugt & grønt", MASS, "u_g"),
  ing("i_ingefaer", "Ingefær", "Frugt & grønt", MASS, "u_g"),
  ing("i_chili", "Frisk chili", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_persille", "Persille", "Frugt & grønt", BUNDT, "u_bdt"),
  ing("i_dild", "Dild", "Frugt & grønt", BUNDT, "u_bdt"),
  ing("i_purlog", "Purløg", "Frugt & grønt", BUNDT, "u_bdt"),
  ing("i_basilikum", "Basilikum (frisk)", "Frugt & grønt", COUNT, "u_stk"),
  ing("i_koriander", "Koriander (frisk)", "Frugt & grønt", BUNDT, "u_bdt"),
  ing("i_mynte", "Mynte", "Frugt & grønt", BUNDT, "u_bdt"),

  // ------- Tørvarer -------
  ing("i_mel", "Hvedemel", "Tørvarer", MASS_SM, "u_kg", {
    aliases: ["mel", "hvedemel"],
    itemConversions: flourConv,
  }),
  ing("i_rugmel", "Rugmel", "Tørvarer", MASS_SM, "u_kg", {
    itemConversions: flourConv,
  }),
  ing("i_grahamsmel", "Grahamsmel", "Tørvarer", MASS_SM, "u_kg", {
    itemConversions: flourConv,
  }),
  ing("i_havregryn", "Havregryn", "Tørvarer", MASS_SM, "u_kg", {
    itemConversions: oatsConv,
  }),
  ing("i_musli", "Mysli", "Tørvarer", MASS, "u_g"),
  ing("i_cornflakes", "Cornflakes", "Tørvarer", MASS, "u_g"),
  ing("i_ris", "Ris", "Tørvarer", MASS_SM, "u_kg", {
    itemConversions: riceConv,
  }),
  ing("i_basmatiris", "Basmatiris", "Tørvarer", MASS_SM, "u_kg", {
    itemConversions: riceConv,
  }),
  ing("i_pasta", "Pasta", "Tørvarer", MASS, "u_kg"),
  ing("i_spaghetti", "Spaghetti", "Tørvarer", MASS, "u_kg"),
  ing("i_lasagneplader", "Lasagneplader", "Tørvarer", MASS, "u_g"),
  ing("i_couscous", "Couscous", "Tørvarer", MASS, "u_g"),
  ing("i_bulgur", "Bulgur", "Tørvarer", MASS, "u_g"),
  ing("i_quinoa", "Quinoa", "Tørvarer", MASS, "u_g"),
  ing("i_bonner_sorte", "Sorte bønner", "Tørvarer", DASE, "u_dase"),
  ing("i_bonner_hvide", "Hvide bønner", "Tørvarer", DASE, "u_dase"),
  ing("i_kikaerter", "Kikærter", "Tørvarer", DASE, "u_dase", {
    aliases: ["kikærter"],
  }),
  ing("i_linser", "Røde linser", "Tørvarer", MASS, "u_g"),
  ing("i_sukker", "Sukker", "Tørvarer", MASS_SM, "u_kg", {
    itemConversions: sugarConv,
  }),
  ing("i_flormelis", "Flormelis", "Tørvarer", MASS_SM, "u_g", {
    itemConversions: sugarConv,
  }),
  ing("i_farin_brun", "Brun farin", "Tørvarer", MASS_SM, "u_g", {
    itemConversions: brownSugarConv,
  }),
  ing("i_farin_lys", "Lys farin", "Tørvarer", MASS_SM, "u_g", {
    itemConversions: brownSugarConv,
  }),
  ing("i_vanilliesukker", "Vaniljesukker", "Tørvarer", ["u_g", "u_spsk", "u_tsk"], "u_g"),
  ing("i_bagepulver", "Bagepulver", "Tørvarer", ["u_g", "u_spsk", "u_tsk"], "u_g"),
  ing("i_natron", "Natron", "Tørvarer", ["u_g", "u_tsk"], "u_g"),
  ing("i_gaer", "Gær", "Tørvarer", MASS, "u_g", { aliases: ["gær"] }),
  ing("i_torgaer", "Tørgær", "Tørvarer", MASS, "u_g"),
  ing("i_kakaopulver", "Kakaopulver", "Tørvarer", ["u_g", "u_spsk"], "u_g"),
  ing("i_chokolade_moerk", "Mørk chokolade", "Tørvarer", MASS, "u_g"),
  ing("i_chokolade_lys", "Lys chokolade", "Tørvarer", MASS, "u_g"),
  ing("i_nodder_blandede", "Blandede nødder", "Tørvarer", MASS, "u_g"),
  ing("i_mandler", "Mandler", "Tørvarer", MASS, "u_g"),
  ing("i_valnodder", "Valnødder", "Tørvarer", MASS, "u_g"),
  ing("i_hasselnodder", "Hasselnødder", "Tørvarer", MASS, "u_g"),
  ing("i_solsikkekerner", "Solsikkekerner", "Tørvarer", MASS, "u_g"),
  ing("i_graeskarkerner", "Græskarkerner", "Tørvarer", MASS, "u_g"),
  ing("i_sesamfro", "Sesamfrø", "Tørvarer", MASS, "u_g"),
  ing("i_rosiner", "Rosiner", "Tørvarer", MASS, "u_g"),
  ing("i_dadler", "Dadler", "Tørvarer", MASS, "u_g"),

  // ------- Bageri -------
  ing("i_rugbrod", "Rugbrød", "Bageri", COUNT_PK, "u_stk", {
    aliases: ["rugbrød"],
  }),
  ing("i_franskbrod", "Franskbrød", "Bageri", COUNT, "u_stk"),
  ing("i_toastbrod", "Toastbrød", "Bageri", COUNT, "u_stk"),
  ing("i_bagerbrod", "Bagerbrød", "Bageri", COUNT, "u_stk"),
  ing("i_pitabrod", "Pitabrød", "Bageri", COUNT, "u_stk"),
  ing("i_tortilla", "Tortillas", "Bageri", COUNT_PK, "u_pk"),
  ing("i_burgerboller", "Burgerboller", "Bageri", COUNT, "u_stk"),
  ing("i_hotdogboller", "Hotdogboller", "Bageri", COUNT, "u_stk"),
  ing("i_boller", "Boller", "Bageri", COUNT, "u_stk"),
  ing("i_kringle", "Kringle", "Bageri", COUNT, "u_stk"),
  ing("i_knaekbrod", "Knækbrød", "Bageri", COUNT_PK, "u_pk"),
  ing("i_tvebakker", "Tvebakker", "Bageri", COUNT_PK, "u_pk"),

  // ------- Krydderier -------
  ing("i_salt", "Salt", "Krydderier", MASS_SM, "u_g", {
    itemConversions: saltConv,
  }),
  ing("i_peber", "Peber", "Krydderier", ["u_g", "u_tsk", "u_spsk"], "u_g"),
  ing("i_paprika", "Paprika", "Krydderier", ["u_g", "u_tsk", "u_spsk"], "u_g"),
  ing("i_karry", "Karry", "Krydderier", ["u_g", "u_tsk", "u_spsk"], "u_g"),
  ing("i_spidskommen", "Spidskommen", "Krydderier", ["u_g", "u_tsk"], "u_g"),
  ing("i_koriander_stodt", "Koriander (stødt)", "Krydderier", ["u_g", "u_tsk"], "u_g"),
  ing("i_gurkemeje", "Gurkemeje", "Krydderier", ["u_g", "u_tsk"], "u_g"),
  ing("i_chili_pulver", "Chilipulver", "Krydderier", ["u_g", "u_tsk"], "u_g"),
  ing("i_oregano", "Oregano", "Krydderier", ["u_g", "u_tsk", "u_spsk"], "u_g"),
  ing("i_timian", "Timian", "Krydderier", ["u_g", "u_tsk", "u_spsk"], "u_g"),
  ing("i_rosmarin", "Rosmarin", "Krydderier", ["u_g", "u_tsk", "u_spsk"], "u_g"),
  ing("i_laurbaerblade", "Laurbærblade", "Krydderier", ["u_stk"], "u_stk"),
  ing("i_kanel", "Kanel", "Krydderier", ["u_g", "u_tsk", "u_spsk"], "u_g"),
  ing("i_kardemomme", "Kardemomme", "Krydderier", ["u_g", "u_tsk"], "u_g"),
  ing("i_muskatnod", "Muskatnød", "Krydderier", ["u_g", "u_tsk", "u_knsp"], "u_g"),
  ing("i_nelliker", "Nelliker", "Krydderier", ["u_g", "u_tsk"], "u_g"),
  ing("i_vanilje", "Vaniljestang", "Krydderier", COUNT, "u_stk"),
  ing("i_boullion_okse", "Oksebouillon (terninger)", "Krydderier", COUNT_PK, "u_stk"),
  ing("i_boullion_gron", "Grøntsagsbouillon (terninger)", "Krydderier", COUNT_PK, "u_stk"),
  ing("i_boullion_kylling", "Hønsebouillon (terninger)", "Krydderier", COUNT_PK, "u_stk"),

  // ------- Konserves -------
  ing("i_hakkede_tomater", "Hakkede tomater", "Konserves", DASE, "u_dase"),
  ing("i_tomatpure", "Tomatpuré", "Konserves", ["u_g", "u_spsk"], "u_g"),
  ing("i_passata", "Passata", "Konserves", ["u_ml", "u_dl", "u_l"], "u_ml"),
  ing("i_majs_dase", "Majs på dåse", "Konserves", DASE, "u_dase"),
  ing("i_kokosmelk", "Kokosmælk", "Konserves", DASE, "u_dase"),
  ing("i_olivenolie", "Olivenolie", "Konserves", VOL_SM, "u_ml", {
    itemConversions: oilConv,
  }),
  ing("i_solsikkeolie", "Solsikkeolie", "Konserves", VOL_SM, "u_ml", {
    itemConversions: oilConv,
  }),
  ing("i_rapsolie", "Rapsolie", "Konserves", VOL_SM, "u_ml", {
    itemConversions: oilConv,
  }),
  ing("i_eddike", "Lagereddike", "Konserves", VOL_SM, "u_ml"),
  ing("i_balsamico", "Balsamico", "Konserves", VOL_SM, "u_ml"),
  ing("i_soja", "Sojasovs", "Konserves", VOL_SM, "u_ml"),
  ing("i_ketchup", "Ketchup", "Konserves", ["u_ml", "u_dl", "u_l", "u_g"], "u_ml"),
  ing("i_sennep", "Sennep", "Konserves", ["u_g", "u_spsk", "u_tsk"], "u_g"),
  ing("i_mayo", "Mayonnaise", "Konserves", ["u_g", "u_spsk", "u_ml"], "u_g"),
  ing("i_remoulade", "Remoulade", "Konserves", ["u_g", "u_spsk"], "u_g"),
  ing("i_bearnaise", "Bearnaisesovs", "Konserves", VOL, "u_ml"),
  ing("i_honning", "Honning", "Konserves", ["u_g", "u_spsk"], "u_g"),
  ing("i_syltetoj_jordbaer", "Jordbærsyltetøj", "Konserves", MASS, "u_g"),
  ing("i_syltetoj_hindbaer", "Hindbærsyltetøj", "Konserves", MASS, "u_g"),
  ing("i_nutella", "Chokolade-nøddecreme", "Konserves", MASS, "u_g", {
    aliases: ["nutella"],
  }),
  ing("i_peanutbutter", "Peanutbutter", "Konserves", MASS, "u_g"),
  ing("i_agurkesalat", "Agurkesalat", "Konserves", ["u_g", "u_ml"], "u_g"),
  ing("i_asier", "Asier", "Konserves", COUNT_PK, "u_pk"),
  ing("i_rodbeder", "Rødbeder", "Konserves", COUNT_PK, "u_pk"),

  // ------- Frost -------
  ing("i_aerter_frost", "Ærter, frosne", "Frost", MASS, "u_g", {
    aliases: ["frosne ærter", "ærter frost"],
  }),
  ing("i_spinat_frost", "Spinat, frosset", "Frost", MASS, "u_g"),
  ing("i_broccoli_frost", "Broccoli, frosset", "Frost", MASS, "u_g"),
  ing("i_blandet_gront_frost", "Blandede grøntsager, frost", "Frost", MASS, "u_g"),
  ing("i_pommes_frost", "Pommes frites, frost", "Frost", MASS, "u_kg"),
  ing("i_fiskefileter_frost", "Fiskefileter, frosne", "Frost", MASS, "u_g"),
  ing("i_is_vanille", "Vaniljeis", "Frost", VOL, "u_l"),
  ing("i_baer_frost", "Bær, frosne", "Frost", MASS, "u_g"),

  // ------- Drikkevarer -------
  ing("i_kaffe", "Kaffe (bønner/malet)", "Drikkevarer", MASS, "u_g", {
    aliases: ["kaffe"],
  }),
  ing("i_te", "Te", "Drikkevarer", COUNT_PK, "u_pk"),
  ing("i_saft", "Saft", "Drikkevarer", VOL, "u_l"),
  ing("i_juice_appelsin", "Appelsinjuice", "Drikkevarer", VOL, "u_l"),
  ing("i_juice_aeble", "Æblejuice", "Drikkevarer", VOL, "u_l"),
  ing("i_kakao_maelk", "Kakaomælk", "Drikkevarer", VOL, "u_l"),
  ing("i_sodavand_cola", "Cola", "Drikkevarer", VOL, "u_l"),
  ing("i_sodavand_lemonade", "Sodavand, lemonade", "Drikkevarer", VOL, "u_l"),
  ing("i_vand_kildevand", "Kildevand", "Drikkevarer", VOL, "u_l"),
  ing("i_ol", "Øl", "Drikkevarer", COUNT_PK, "u_stk"),

  // ------- Snacks -------
  ing("i_chips", "Chips", "Snacks", MASS, "u_g"),
  ing("i_popcorn", "Popcorn (kerner)", "Snacks", MASS, "u_g"),
  ing("i_kiks", "Kiks", "Snacks", COUNT_PK, "u_pk"),
  ing("i_smaakager", "Småkager", "Snacks", MASS, "u_g"),
  ing("i_slik", "Slik (bland selv)", "Snacks", MASS, "u_g"),
  ing("i_musli_bar", "Müslibar", "Snacks", COUNT, "u_stk"),

  // ------- Andet -------
  ing("i_husholdningsfilm", "Husholdningsfilm", "Andet", COUNT, "u_stk"),
  ing("i_alufolie", "Alufolie", "Andet", COUNT, "u_stk"),
  ing("i_bagepapir", "Bagepapir", "Andet", COUNT, "u_stk"),
  ing("i_frysepose", "Fryseposer", "Andet", COUNT_PK, "u_pk"),
  ing("i_kaffefilter", "Kaffefiltre", "Andet", COUNT_PK, "u_pk"),
  ing("i_servietter", "Servietter", "Andet", COUNT_PK, "u_pk"),
  ing("i_koekkenrulle", "Køkkenrulle", "Andet", COUNT_PK, "u_stk"),
  ing("i_opvaskemiddel", "Opvaskemiddel", "Andet", VOL, "u_ml"),
  ing("i_opvaskesvamp", "Opvaskesvamp", "Andet", COUNT_PK, "u_pk"),
  ing("i_skraldeposer", "Skraldeposer", "Andet", COUNT_PK, "u_pk"),
  ing("i_taendstikker", "Tændstikker", "Andet", COUNT_PK, "u_pk"),
  ing("i_grill_kul", "Grillkul", "Andet", MASS, "u_kg"),
  ing("i_toiletpapir", "Toiletpapir", "Andet", COUNT_PK, "u_stk"),
];
