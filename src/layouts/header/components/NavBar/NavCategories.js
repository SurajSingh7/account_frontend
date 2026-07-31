
// FOR FRONTEND MAPPING PART: "DSR", path: "/dsr?form=create",
// FOR BACKEND MAPPING PART:
// moduleName: "dsr", url: "/dsr", action: ["CREATE", "UPDATE", "READ"], exceptions: ["canViewAll"]


import { SHOW_DEV } from "@/config/getEnvVariables";
import { ROUTES } from "@/constants/routes";
import { API_ENDPOINTS } from "@/constants/api";

const { billing } = ROUTES.customers;
const { billing: billingApi } = API_ENDPOINTS.customers;

export const navCategories = [

  {
    category: "Reports",
    items: [

      {
        name: "Billing Sell Report",
        path: billing.billingReport,
        moduleName: "Billing Sell report",
        url: billingApi.report.sell,
        action: ["READ"],
      },
      {
        name: "Outstanding Report",
        path: billing.outstandingReport,
        moduleName: "Sale outstanding",
        url: billingApi.report.outstanding,
        action: ["READ"],
      },
      {
        name: "Receipt Report",
        path: billing.receiptReport,
        moduleName: "Receipt report",
        url: billingApi.report.receipt,
        action: ["READ"],
      },
    ],
  },
  {
    category: "Order Management",
    items: [
      {
        name: "Pcd Closure",
        path: billing.pcdClosure.root,
        moduleName: "PCD Ready order module",
        url: billingApi.readyOrder.all,
        action: ["READ"],
      },
      {
        name: "Terminate Orders",
        path: billing.terminateOrders,
        moduleName: "Terminate Orders",
        url: billingApi.readyOrder.all,
        action: ["READ"],
      },
      // {
      //   name: "Order Links",
      //   path: billing.orderLinks,
      //   moduleName: "Order Links",
      //   url: billingApi.readyOrder.all,
      //   action: ["READ"],
      // },
    ],
  },
  {
    category: "Bulk Operations",
    items: [
      {
        name: "Bulk Payment",
        path: billing.bulkPayment,
        moduleName: "Bulk Payment",
        url: "/billing/account/bulk-payment",
        action: ["READ"],
      },
      {
        name: "Bulk Transactions",
        path: billing.bulkTransactions,
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
        name: "Billing Group Report",
        path: billing.billingGroupReport,
        moduleName: "",
        url: "/admin",
        action: ["CREATE", "UPDATE", "READ"],
        exceptions: ["canViewAll"],
      },
       {
        name: "Outstanding Group Report",
        path: billing.outstandingGroupReport,
        moduleName: "",
        url: "/admin",
        action: ["CREATE", "UPDATE", "READ"],
        exceptions: ["canViewAll"],
      },
      {
        name: "Receipt Group Report",
        path: billing.receiptGroupReport,
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
        path: billing.uploadExcel,
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
            path: billing.demo.viewCircuit,
            moduleName: "dsr",
            url: "/dsr",
            action: ["CREATE", "UPDATE"],
            exceptions: ["canViewAll"],
          },
          {
            name: "Outstanding Report D",
            path: billing.demo.outstandingReport,
            moduleName: "dsr",
            url: "/dsr",
            action: ["READ"],
            exceptions: ["canViewAll"],
          },
          {
            name: "Billing Sell Report D",
            path: billing.demo.billingReport,
            moduleName: "dsr",
            url: "/dsr",
            action: ["READ"],
            exceptions: ["canViewAll"],
          },
          {
            name: "Receipt Report D",
            path: billing.demo.receiptReport,
            moduleName: "dsr",
            url: "/dsr",
            action: ["READ"],
            exceptions: ["canViewAll"],
          },
          {
            name: "Bulk Update D",
            path: billing.demo.bulkUpdate,
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
            path: billing.collectionOutstandingReport,
            moduleName: "dsr",
            url: "/dsr",
            action: ["READ"],
            exceptions: ["canViewAll"],
          },
          {
            name: "Test Page",
            path: ROUTES.customers.testPage,
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
            path: `${billing.generator}?orderId=`,
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
