
// FOR FRONTED MAPPING PART: "DSR", path: "/dsr?form=create",
// FOR BACKEND MAPPING PART: "moduleName": "dsr",url:"/dsr",action:["CREATE","UPDATE","READ"],exceptions:["canViewAll"] 
export const navCategories = [
  {
    category: "Account",
    items: [
      { name: "Pcd Closure", path: "/billing/account/pcd-closure", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },  
      { name: "Outstanding Report", path: "/billing/account/outstanding-report", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },
      { name: "Billing sell Report", path: "/billing/account/billing-report", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },
      { name: "Receipt Report", path: "/billing/account/receipt", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },
    ]
     
  },

    {
    category: "AccountD",
    items: [
      { name: "View Circuit D", path: "/billing/account/view-circuit1", moduleName: "dsr", url: "/dsr", action: ["CREATE", "UPDATE",], exceptions: ["canViewAll"] },
      { name: "Outstanding Report D", path: "/billing/account/outstanding-report1", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },
      { name: "Billing sell Report D", path: "/billing/account/billing-report1", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },
      { name: "Receipt Report D", path: "/billing/account/receipt1", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },
      // { name: "Bulk update D", path: "/billing/account/bulk-update1", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },
    
    ],
  },
  {
    category: "Collection",
    items: [
      // { name: "Outstanding Report", path: "/billing/collection/outstanding-report", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },
      { name: "Test Psage", path: "/test-page", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },
     
    ],
  },
  {
    category: "Generator",
    items: [
      { name: "Monthly bill generator", path: "/billing/generator?orderId=", moduleName: "dsr", url: "/dsr", action: ["CREATE", "UPDATE",], exceptions: ["canViewAll"] },
      
    ],
  },
];
