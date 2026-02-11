
// FOR FRONTED MAPPING PART: "DSR", path: "/dsr?form=create",
// FOR BACKEND MAPPING PART: "moduleName": "dsr",url:"/dsr",action:["CREATE","UPDATE","READ"],exceptions:["canViewAll"] 
export const navCategories = [
  {
    category: "Account",
    items: [
      { name: "View Circuit", path: "/billing/account/view-circuit", moduleName: "dsr", url: "/dsr", action: ["CREATE", "UPDATE",], exceptions: ["canViewAll"] },
      { name: "Billing Report", path: "/billing/account/billing-report", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },
      { name: "Outstanding Report", path: "/billing/account/outstanding-report", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },
     
    ],
  },
  {
    category: "Collection",
    items: [
      { name: "Outstanding Report", path: "/billing/collection/outstanding-report", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },
     
    ],
  },
  {
    category: "Generator",
    items: [
      { name: "Monthly bill generator", path: "/billing/generator?orderId=", moduleName: "dsr", url: "/dsr", action: ["CREATE", "UPDATE",], exceptions: ["canViewAll"] },
      
    ],
  },
];
