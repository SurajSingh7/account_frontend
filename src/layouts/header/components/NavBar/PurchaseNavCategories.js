import { SHOW_DEV } from "@/config/getEnvVariables";
import { ROUTES } from "@/constants/routes";
import { API_ENDPOINTS } from "@/constants/api";

const { purchase } = ROUTES;
const purchaseApi = API_ENDPOINTS.purchase;
const { billing: billingApi } = API_ENDPOINTS.customers;

// NOTE: Purchase module has no backend permission entries yet, so these items
// are only ever visible to admin (Navbar bypasses permission filtering for admin).
export const purchaseNavCategories = [

  {
    category: "Reports",
    items: [
      {
        name: "Billing Sell Report",
        path: purchase.billingReport,
        moduleName: "Purchase Billing Sell report",
        // url: purchaseApi.report.sell,
         url: billingApi.report.sell,
        action: ["READ"],
      },
      {
        name: "Outstanding Report",
        path: purchase.outstandingReport,
        moduleName: "Purchase Sale outstanding",
        // url: purchaseApi.report.outstanding,
           url: billingApi.report.outstanding,
        action: ["READ"],
      },
      {
        name: "Receipt Report",
        path: purchase.receiptReport,
        moduleName: "Purchase Receipt report",
        // url: purchaseApi.report.receipt,
          url: billingApi.report.receipt,
        action: ["READ"],
      },
    ],
  },
  {
    category: "Order Management",
    items: [
      {
        name: "Loc Closure",
        path: purchase.locClosure.root,
        moduleName: "Purchase LOC Ready order module",
        // url: purchaseApi.readyOrder.all,
          url: billingApi.readyOrder.all,
        action: ["READ"],
      },
      {
        name: "Terminate Orders",
        path: purchase.terminateOrders,
        moduleName: "Purchase Terminate Orders",
        // url: purchaseApi.readyOrder.all,
         url: billingApi.readyOrder.all,
        action: ["READ"],
      },
      // {
      //   name: "Order Links",
      //   path: purchase.orderLinks,
      //   moduleName: "Purchase Order Links",
      //   url: purchaseApi.readyOrder.all,
      //   action: ["READ"],
      // },
    ],
  },
  {
    category: "Bulk Operations",
    items: [
      {
        name: "Bulk Payment",
        path: purchase.bulkPayment,
        moduleName: "Purchase Bulk Payment",
        // url: "/purchase/account/bulk-payment",
         url: "/billing/account/bulk-payment",
        action: ["READ"],
      },
      {
        name: "Bulk Transactions",
        path: purchase.bulkTransactions,
        moduleName: "Purchase Bulk Transactions",
        // url: "/purchase/account/bulk-transactions",
          url: "/billing/account/bulk-transactions",
        action: ["READ"],
      },
    ],
  },
  {
    category: "Group Reports",
    items: [
      {
        name: "Billing Group Report",
        path: purchase.billingGroupReport,
        moduleName: "",
        url: "/admin",
        action: ["CREATE", "UPDATE", "READ"],
        exceptions: ["canViewAll"],
      },
        {
        name: "Outstanding Group Report",
        path: purchase.outstandingGroupReport,
        moduleName: "",
        url: "/admin",
        action: ["CREATE", "UPDATE", "READ"],
        exceptions: ["canViewAll"],
      },
      {
        name: "Receipt Group Report",
        path: purchase.receiptGroupReport,
        moduleName: "",
        url: "/admin",
        action: ["CREATE", "UPDATE", "READ"],
        exceptions: ["canViewAll"],
      },
    ],
  },
  // {
  //   category: "Data Import",
  //   items: [
  //     {
  //       name: "Upload Opening Excel",
  //       path: purchase.uploadExcel,
  //       moduleName: "Purchase Upload Excel",
  //       url: "/purchase/account/upload-excel",
  //       action: ["READ"],
  //     },
  //   ],
  // },

  // DEV ONLY MENUS -- mirrors the SHOW_DEV-gated Collection/Generator entries in
  // Customer's CustomerNavCategories.js (the legacy "AccountD"/"Test Page" demo items are
  // intentionally not mirrored -- they have no wired-up Purchase pages).
  ...(SHOW_DEV
    ? [
      {
        category: "Collection",
        items: [
          {
            name: "Outstanding Report",
            path: purchase.collectionOutstandingReport,
            moduleName: "dsr",
            url: "/dsr",
            action: ["READ"],
            exceptions: ["canViewAll"],
          },
        ],
      },
      {
        category: "Generator",
        items: [
          {
            name: "Monthly Bill Generator",
            path: `${purchase.generator}?orderId=`,
            moduleName: "dsr",
            url: "/dsr",
            action: ["CREATE", "UPDATE"],
            exceptions: ["canViewAll"],
          },
        ],
      },
    ]
    : []),
];
