# Lejrindkøb – Camp Shopping List

En simpel webapp til at planlægge og samle indkøb til en spejderlejr (eller anden gruppe-madlavning) for mange deltagere. UI er på dansk.

## Funktioner

- **Ingredienser** – Central database med hovednavn, alternative navne, kategori, tilladte enheder og per-vare omregninger (fx `1 spsk mel = 9 g`). ~220 danske dagligvarer forindlæst.
- **Opskrifter** – Opskrifter med "til X personer". Ingredienser vælges kun fra databasen (autocomplete). Hver opskrift vises som en foldbar række; klik **Rediger** for at ændre felterne direkte i listen – ingen popups.
- **Måltider** – Opbygget som **dage → måltider**. Tilføj en dag (kan navngives og flyttes op/ned), og læg måltider ind i dagen. Et nyt måltid åbnes automatisk i redigeringstilstand. Hvert måltid har deltagerantal og to adskilte grupper: **Opskrifter** (auto-skaleres ift. deltagere) og **Enkeltvarer**. Dagen har desuden sin egen gruppe **Enkeltvarer (hele dagen)** til ting der ikke hører til ét bestemt måltid. Alt redigeres direkte på siden.
- **Tastaturflow** – Når du udfylder en ingredienslinje: skriv, vælg med ↑/↓ og **Enter**, tab til mængden og tryk **Enter** for at få en ny linje. Linjer uden valgt ingrediens fjernes automatisk når du gemmer.
- **Indkøbsliste** – Vælg her hvilke måltider der skal med (grupperet pr. dag, med vælg alle/ingen); dagens egne enkeltvarer kan slås til/fra som sin egen post. Aggregeret liste på tværs af de valgte måltider, grupperet efter kategori, med per-linje enhedsvælger (g / kg / spsk), afkrydsning (klik på navnet eller boksen), skjul afkrydsede, print-visning og "skalér til X personer" – skalering er forholdsmæssig, så også opskrifter med eget portionsantal skaleres korrekt.
- **Alternative navne** – Ingredienser med aliaser (fx "frosne ærter" og "ærter, frosne") samles automatisk under hovednavnet i indkøbslisten.
- **Enhedsomregning** – Globale omregninger (g↔kg, ml↔l, spsk↔ml) plus per-vare omregninger for volumen↔masse (bagning). Ikke-omregnelige bidrag vises separat med advarsel.
- **Gem tilstand** – Alt gemmes automatisk i browserens localStorage. Eksportér/importér som JSON-fil for backup og deling.

## Kør lokalt

```bash
npm install
npm run dev
```

Åbn `http://localhost:5173` i browseren.

## Byg til produktion

```bash
npm run build
npm run preview   # test build lokalt
```

Bygget output ligger i `dist/` – kan uploades til enhver statisk hosting (GitHub Pages, Netlify, Vercel, S3, ...).

App'en kan installeres som PWA og virker offline efter første besøg (service worker, network-first).

### GitHub Pages

`base` er sat til `'./'` i `vite.config.ts`, og app'en bruger hash-routing
(`#/indkoebsliste`). Derfor virker bygget uden ændringer fra en hvilken som
helst GitHub Pages-undermappe.

Projektet bruger pakken [`gh-pages`](https://www.npmjs.com/package/gh-pages).
Første gang skal kildekoden forbindes til et GitHub-repository:

```bash
git init -b main
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/DIT-BRUGERNAVN/DIT-REPOSITORY.git
git push -u origin main
```

Udgiv derefter appen:

```bash
npm run deploy
```

`predeploy` bygger automatisk appen, og `deploy` publicerer `dist/` på en
separat `gh-pages`-gren. Efter første deploy vælges **Settings → Pages →
Deploy from a branch → `gh-pages` / `(root)`** i repositoryets indstillinger.
Appen bliver derefter tilgængelig på:

```text
https://DIT-BRUGERNAVN.github.io/DIT-REPOSITORY/
```

Ved senere opdateringer pushes kildekoden normalt til `main`, hvorefter
`npm run deploy` køres igen for at opdatere websitet.

## Data & persistens

- **localStorage nøgle:** `camp-shopping-v1`
- **Backup ved nulstilling/import:** `camp-shopping-v1-backup`
- **Eksport:** `Indstillinger → Eksportér som JSON` giver dig en fil du kan gemme.
- **Import:** vælg en tidligere eksporteret fil. Skema valideres med Zod før overskrivning.
- **Nulstil:** genindlæser den forindlæste database (dine egne opskrifter/måltider slettes – tag en eksport først!).
- **Skemaversion:** `3`. Gemte data og eksporterede JSON-filer migreres automatisk ved indlæsning: version 1 (flade måltider med et `dag`-nummer) omdannes til dag→måltid-modellen (måltider uden dag samles under "Uden dag"), og version 2 får tilføjet dagens egne enkeltvarer (tom liste, slået til).

Der er ingen backend og ingen login. Alle brugere af en given browser-installation deler samme lokale database.

## Arkitektur

```
src/
├── domain/
│   ├── types.ts     # Typer, Zod-skemaer + migrering fra skema v1
│   ├── units.ts     # Omregningsgraf (BFS) – global + per-vare
│   ├── rows.ts      # Rene hjælpere til ingredienslinjer (validering/oprydning)
│   └── aggregate.ts # Sammenlægning af måltider til indkøbsliste
├── data/            # Startdata: enheder, kategorier, ~220 ingredienser
├── store/           # Zustand-store med localStorage-persistens
├── components/      # Genbrugelige UI-komponenter (knapper, NumberInput, IngredientPicker...)
├── pages/           # Én side pr. tab (Ingredienser, Opskrifter, Måltider=DaysPage, Indkøbsliste, Indstillinger)
├── i18n/da.ts       # Alle UI-strenge + flertalshjælper samlet ét sted
├── App.tsx          # Router
└── main.tsx
```

### Datamodel

```
Dag (navngivet, kan flyttes op/ned)
├── Måltid (deltagerantal, til/fra i indkøbslisten)
│   ├── Opskrifter   → { opskrift, portioner? }   portioner tom = måltidets deltagere
│   └── Enkeltvarer  → { ingrediens, mængde, enhed }
└── Enkeltvarer (hele dagen, til/fra i indkøbslisten)
```

Skalering sker som et **forhold**: `skaléret antal / måltidets deltagere`. Derfor skalerer et
eksplicit portionsantal (fx "salat til 4" i et 35-personers måltid) også korrekt, når hele
listen skaleres til fx 40 personer. Dagens egne enkeltvarer har intet eget deltagerantal og
skaleres derfor ift. standard-deltagerantallet i Indstillinger.

**Stak:** React 19 + TypeScript + Vite + Tailwind CSS + Zustand + Zod + React Router (hash mode).

## Tilføj nye ingredienser

Gå til **Ingredienser → Ny ingrediens**. Angiv hovednavn, evt. alternative navne (kommaseparerede), kategori, tilladte enheder og en standard visningsenhed. Hvis varen skal kunne bruges i både volumen og masse (fx spsk og g), tilføj en per-vare omregning – ellers vises den ene enhed separat i indkøbslisten som ikke-omregnelig.

## Redigér standarddatabasen

Der er to måder, afhængigt af om ændringen kun gælder dig eller skal være den nye standard for alle.

### 1. Kun i din egen browser (ingen kodeændring)

Rediger frit under **Ingredienser** – tilføj, ret eller slet varer. Ændringerne ligger i
localStorage og overlever genindlæsning. Tag en sikkerhedskopi med
**Indstillinger → Eksportér som JSON**, og hent den ind igen med **Importér JSON...**.

Bemærk at **Nulstil til standarddatabase** kaster dine ændringer væk og lægger den
indbyggede startdatabase tilbage (den forrige tilstand gemmes dog som backup i localStorage).

### 2. Ret selve standarddatabasen (kræver kodeændring + genbyg)

Startdatabasen er ren TypeScript i `src/data/`:

| Fil | Indhold |
|-----|---------|
| `seedIngredients.ts` | De ~220 varer og kategorierne |
| `seedUnits.ts` | Enheder og de globale omregninger |
| `seed.ts` | Sætter det hele sammen til starttilstanden |

En vare er én linje via `ing()`-hjælperen:

```ts
ing("i_maelk", "Mælk, letmælk", "Mejeri", VOL, "u_l", { aliases: ["mælk"] })
//   ^id       ^hovednavn        ^kategori ^tilladte ^standardenhed
```

Enhedssættene (`MASS`, `MASS_SM`, `VOL`, `VOL_SM`, `COUNT`, ...) er defineret øverst i filen.
Skal varen kunne omregnes mellem volumen og masse, giv den en per-vare omregning:

```ts
ing("i_mel", "Hvedemel", "Kolonial", MASS_SM, "u_kg", {
  itemConversions: [
    { fromUnitId: "u_spsk", toUnitId: "u_g", factor: 9 },
    { fromUnitId: "u_dl",   toUnitId: "u_g", factor: 60 },
  ],
})
```

Tre ting at holde styr på:

1. **`id` skal være unikt og bør ikke ændres** – opskrifter og måltider peger på det. Ændrer du
   et `id`, mister eksisterende data forbindelsen til varen.
2. **`category` skal findes i kategorilisten**, ellers havner varen nederst i indkøbslisten i sin
   egen gruppe.
3. **`defaultDisplayUnitId` skal være med i `allowedUnitIds`**.

Kør derefter `npm run build` (eller `npm run dev`). Eksisterende brugere ser først den nye
standarddatabase efter **Indstillinger → Nulstil til standarddatabase**, da deres egen
kopi ligger i localStorage.

### Genvej: byg din database i UI'et og lås den fast bagefter

Den nemmeste vej er som regel: ret varerne i UI'et, **eksportér til JSON**, og brug den fil som
din delte udgangsdatabase – enten ved at dele filen med de andre, eller ved at kopiere
`ingredients`-arrayet fra JSON-filen ind i `seedIngredients.ts`.
