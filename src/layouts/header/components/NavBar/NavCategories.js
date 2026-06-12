
// FOR FRONTEND MAPPING PART: "DSR", path: "/dsr?form=create",
// FOR BACKEND MAPPING PART:
// moduleName: "dsr", url: "/dsr", action: ["CREATE", "UPDATE", "READ"], exceptions: ["canViewAll"]


import { SHOW_DEV } from "@/config/getEnvVariables";


export const navCategories = [


  {
    category: "Reports",
    items: [

      {
        name: "Billing Sell Report",
        path: "/billing/account/billing-report",
        moduleName: "Billing Sell report",
        url: "/billing/sale/report/sell",
        action: ["READ"],
      },
      {
        name: "Outstanding Report",
        path: "/billing/account/outstanding-report",
        moduleName: "Sale outstanding",
        url: "/billing/sale/report/outstanding",
        action: ["READ"],
      },
      {
        name: "Receipt Report",
        path: "/billing/account/receipt-report",
        moduleName: "Receipt report",
        url: "/billing/sale/report/receipt",
        action: ["READ"],
      },
    ],
  },
  {
    category: "Order Management",
    items: [
      {
        name: "Pcd Closure",
        path: "/billing/account/pcd-closure",
        moduleName: "PCD Ready order module",
        url: "/billing/sale/ready-order/all",
        action: ["READ"],
      },
      {
        name: "Terminate Orders",
        path: "/billing/account/terminate-orders",
        moduleName: "Terminate Orders",
        url: "/billing/sale/ready-order/all",
        action: ["READ"],
      },
      {
        name: "Order Links",
        path: "/billing/account/order-links",
        moduleName: "Order Links",
        url: "/billing/sale/ready-order/all",
        action: ["READ"],
      },
    ],
  },
  {
    category: "Bulk Operations",
    items: [
      {
        name: "Bulk Payment",
        path: "/billing/account/bulk-payment",
        moduleName: "Bulk Payment",
        url: "/billing/account/bulk-payment",
        action: ["READ"],
      },
      {
        name: "Bulk Transactions",
        path: "/billing/account/bulk-transactions",
        moduleName: "Bulk Transactions",
        url: "/billing/account/bulk-transactions",
        action: ["READ"],
      },
    ],
  },

  {
    category: "Group Reports",
    items: [
      {
        name: "Outstanding Group Report",
        path: "/billing/account/outstanding-group-report",
        moduleName: "",
        url: "/admin",
        action: ["CREATE", "UPDATE", "READ"],
        exceptions: ["canViewAll"],
      },
      {
        name: "Billing Group Report",
        path: "/billing/account/billing-group-report",
        moduleName: "",
        url: "/admin",
        action: ["CREATE", "UPDATE", "READ"],
        exceptions: ["canViewAll"],
      },
      {
        name: "Receipt Group Report",
        path: "/billing/account/receipt-group-report",
        moduleName: "",
        url: "/admin",
        action: ["CREATE", "UPDATE", "READ"],
        exceptions: ["canViewAll"],
      },
    ],
  },
  {
    category: "Data Import",
    items: [
      {
        name: "Upload Opening Excel",
        path: "/billing/account/upload-excel",
        moduleName: "Upload Excel",
        url: "/billing/account/upload-excel",
        action: ["READ"],
      },
    ],
  },

  // DEV ONLY MENUS
  ...( (SHOW_DEV)
    ? [
      {
        category: "AccountD",
        items: [
          {
            name: "View Circuit D",
            path: "/billing/account/view-circuit1",
            moduleName: "dsr",
            url: "/dsr",
            action: ["CREATE", "UPDATE"],
            exceptions: ["canViewAll"],
          },
          {
            name: "Outstanding Report D",
            path: "/billing/account/outstanding-report1",
            moduleName: "dsr",
            url: "/dsr",
            action: ["READ"],
            exceptions: ["canViewAll"],
          },
          {
            name: "Billing Sell Report D",
            path: "/billing/account/billing-report1",
            moduleName: "dsr",
            url: "/dsr",
            action: ["READ"],
            exceptions: ["canViewAll"],
          },
          {
            name: "Receipt Report D",
            path: "/billing/account/receipt1",
            moduleName: "dsr",
            url: "/dsr",
            action: ["READ"],
            exceptions: ["canViewAll"],
          },
          {
            name: "Bulk Update D",
            path: "/billing/account/bulk-update1",
            moduleName: "dsr",
            url: "/dsr",
            action: ["READ"],
            exceptions: ["canViewAll"],
          },
        ],
      },
      {
        category: "Collection",
        items: [
          {
            name: "Outstanding Report",
            path: "/billing/collection/outstanding-report",
            moduleName: "dsr",
            url: "/dsr",
            action: ["READ"],
            exceptions: ["canViewAll"],
          },
          {
            name: "Test Page",
            path: "/test-page",
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
            path: "/billing/generator?orderId=",
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
