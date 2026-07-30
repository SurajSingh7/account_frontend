export const INTERNAL_API = {
  billing: {
    orders: '/api/billing/orders',
    monthly: '/api/billing/monthly',
    distributed: '/api/billing/distributed',
  },
  // NOTE: purchase route handlers are not implemented yet (see src/app/api/billing/*
  // for the customer equivalents, which share a Mongo `Order` model). These paths are
  // reserved so the frontend constant is ready once a backend/route handler exists.
  purchase: {
    orders: '/api/purchase/orders',
    monthly: '/api/purchase/monthly',
    distributed: '/api/purchase/distributed',
  },
};
