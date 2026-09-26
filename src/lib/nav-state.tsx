import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const COLLAPSE_KEY = "towercore.nav.collapsed";
const GROUPS_KEY = "towercore.nav.groups";

type NavState = {
  collapsed: boolean;
  toggleCollapsed: () => void;
  isGroupOpen: (id: string) => boolean;
  toggleGroup: (id: string) => void;
};

const NavStateContext = createContext<NavState | null>(null);

export function NavStateProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [closedGroups, setClosedGroups] = useState<string[]>([]);

  // Read persisted state after hydration to avoid SSR mismatches.
  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
      const raw = window.localStorage.getItem(GROUPS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setClosedGroups(parsed.filter((v) => typeof v === "string"));
      }
    } catch {
      /* armazenamento indisponível */
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const toggleGroup = useCallback((id: string) => {
    setClosedGroups((prev) => {
      const next = prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id];
      try {
        window.localStorage.setItem(GROUPS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const isGroupOpen = useCallback((id: string) => !closedGroups.includes(id), [closedGroups]);

  return (
    <NavStateContext.Provider value={{ collapsed, toggleCollapsed, isGroupOpen, toggleGroup }}>
      {children}
    </NavStateContext.Provider>
  );
}

export function useNavState(): NavState {
  const ctx = useContext(NavStateContext);
  if (!ctx) {
    return {
      collapsed: false,
      toggleCollapsed: () => {},
      isGroupOpen: () => true,
      toggleGroup: () => {},
    };
  }
  return ctx;
}
