import { HashRouter, NavLink, Navigate, Route, Routes } from "react-router-dom";
import { da } from "./i18n/da";
import { IngredientsPage } from "./pages/IngredientsPage";
import { RecipesPage } from "./pages/RecipesPage";
import { DaysPage } from "./pages/DaysPage";
import { ShoppingListPage } from "./pages/ShoppingListPage";
import { SettingsPage } from "./pages/SettingsPage";

const tabs = [
  { to: "/ingredienser", label: da.nav.ingredients },
  { to: "/opskrifter", label: da.nav.recipes },
  { to: "/maaltider", label: da.nav.days },
  { to: "/indkoebsliste", label: da.nav.shoppingList },
  { to: "/indstillinger", label: da.nav.settings },
];

function Nav() {
  return (
    <nav className="bg-teal-700 text-white no-print">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-1 px-4 py-2">
        <span className="font-bold mr-4">🍳 {da.appName}</span>
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded text-sm ${
                isActive
                  ? "bg-white text-teal-800 font-semibold"
                  : "text-white/90 hover:bg-teal-600"
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-full flex flex-col">
        <Nav />
        <main className="max-w-5xl mx-auto w-full p-4 flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/indkoebsliste" replace />} />
            <Route path="/ingredienser" element={<IngredientsPage />} />
            <Route path="/opskrifter" element={<RecipesPage />} />
            <Route path="/maaltider" element={<DaysPage />} />
            <Route path="/indkoebsliste" element={<ShoppingListPage />} />
            <Route path="/indstillinger" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/indkoebsliste" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
