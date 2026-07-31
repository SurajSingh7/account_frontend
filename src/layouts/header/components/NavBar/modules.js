import { ROUTES } from "@/constants/routes";
import { customerNavCategories } from "./CustomerNavCategories";
import { purchaseNavCategories } from "./PurchaseNavCategories";

export const MODULES = [
  { key: "customer", label: "Customer" },
  { key: "purchase", label: "Purchase" },
];

export const DEFAULT_MODULE = "customer";

export const SELECTED_MODULE_STORAGE_KEY = "selectedModule";

// Per-module colors for the ModuleSwitcher button/dropdown.
export const MODULE_COLORS = {
  customer: {
    button: "bg-purple-600 hover:bg-purple-500",
    active: "bg-purple-700 text-white",
  },
  purchase: {
    button: "bg-red-600 hover:bg-red-500",
    active: "bg-red-700 text-white",
  },
};

export const MODULE_NAV_CATEGORIES = {
  customer: customerNavCategories,
  purchase: purchaseNavCategories,
};

// Landing page each module switches to when picked from the ModuleSwitcher.
export const MODULE_DEFAULT_ROUTE = {
  customer: ROUTES.customers.billing.pcdClosure.root,
  purchase: ROUTES.purchase.locClosure.root,
};

// URL prefix that identifies which module a given pathname belongs to.
export const MODULE_ROUTE_PREFIX = {
  customer: "/customers",
  purchase: "/purchase",
};

// Resolves the module for a pathname (e.g. typed/pasted URL, direct link),
// so the navbar reflects the page actually being viewed. Returns null when
// the path doesn't belong to any module (e.g. shared/non-module routes).
export const getModuleFromPath = (pathname) => {
  if (!pathname) return null;
  const entry = Object.entries(MODULE_ROUTE_PREFIX).find(([, prefix]) =>
    pathname.startsWith(prefix)
  );
  return entry ? entry[0] : null;
};
