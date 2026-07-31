import { ROUTES } from "@/constants/routes";
import { navCategories } from "./NavCategories";
import { purchaseNavCategories } from "./PurchaseNavCategories";

export const MODULES = [
  { key: "customer", label: "Customer" },
  { key: "purchase", label: "Purchase" },
];

export const DEFAULT_MODULE = "customer";

export const MODULE_NAV_CATEGORIES = {
  customer: navCategories,
  purchase: purchaseNavCategories,
};

// Landing page each module switches to when picked from the ModuleSwitcher.
export const MODULE_DEFAULT_ROUTE = {
  customer: ROUTES.customers.billing.pcdClosure.root,
  purchase: ROUTES.purchase.locClosure.root,
};
