
// FOR FRONTED MAPPING PART: "DSR", path: "/dsr?form=create",
// FOR BACKEND MAPPING PART: "moduleName": "dsr",url:"/dsr",action:["CREATE","UPDATE","READ"],exceptions:["canViewAll"] 
export const navCategories = [
  {
    category: "Account",
    items: [
      { name: "Pcd Closure", path: "/billing/account/pcd-closure", moduleName: "PCD Ready order module", url: "/billing/sale/ready-order/all", action: ["READ"],  },  
      { name: "Terminate Orders", path: "/billing/account/terminate-orders", moduleName: "Terminate Orders ", url: "/billing/sale/ready-order/all", action: ["READ"],  },  
      { name: "Outstanding Report", path: "/billing/account/outstanding-report", moduleName: "Sale outstanding", url: "/billing/sale/monthly/orders/outstanding", action: ["READ"],  },
      { name: "Billing sell Report", path: "/billing/account/billing-report", moduleName: "Billing Sale Access", url: "/billing/sale", action: ["READ"],  },
      { name: "Receipt Report", path: "/billing/account/receipt-report", moduleName: "Receipt report", url: "/billing/sale/monthly/orders/receipt", action: ["READ"],  },
    ]
     
  },
   {
    category: "Account Company Group",
    items: [
    
      { name: "Outstanding Group Report", path: "/billing/account/outstanding-group-report", moduleName: "", url: "/admin", action: ["CREATE", "UPDATE", "READ"], exceptions: ["canViewAll"] },
      { name: "Billing Group Report", path: "/billing/account/billing-group-report",moduleName: "", url: "/admin", action: ["CREATE", "UPDATE", "READ"], exceptions: ["canViewAll"]},
      { name: "Receipt Group Report", path: "/billing/account/receipt-group-report", moduleName: "", url: "/admin", action: ["CREATE", "UPDATE", "READ"], exceptions: ["canViewAll"]},
    ]
     
  },


  {
    category: "AccountD",
    items: [
      { name: "View Circuit D", path: "/billing/account/view-circuit1", moduleName: "dsr", url: "/dsr", action: ["CREATE", "UPDATE",], exceptions: ["canViewAll"] },
      { name: "Outstanding Report D", path: "/billing/account/outstanding-report1", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },
      { name: "Billing sell Report D", path: "/billing/account/billing-report1", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },
      { name: "Receipt Report D", path: "/billing/account/receipt1", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },
      { name: "Bulk update D", path: "/billing/account/bulk-update1", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },
    
    ],
  },
  {
    category: "Collection",
    items: [
      { name: "Outstanding Report", path: "/billing/collection/outstanding-report", moduleName: "dsr", url: "/dsr", action: ["READ"], exceptions: ["canViewAll"] },
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
