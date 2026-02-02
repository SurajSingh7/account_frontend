
// FOR FRONTED MAPPING PART: "DSR", path: "/dsr?form=create",
// FOR BACKEND MAPPING PART: "moduleName": "dsr",url:"/dsr",action:["CREATE","UPDATE","READ"],exceptions:["canViewAll"] 
export const navCategories = [
  {
    category: "Billing",
    items: [
      { name: "View Circuit", path: "/billing/view-circuit", moduleName: "dsr", url: "/dsr", action: ["CREATE", "UPDATE",], exceptions: ["canViewAll"] },
      { name: "Monthly Billing", path: "/billing/monthly-billing", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },
     
    ],
  },
];
