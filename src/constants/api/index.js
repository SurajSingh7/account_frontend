import { CORE_API } from './core';
import { CUSTOMER_API, EXTERNAL_API } from './customers';
import { PURCHASE_API } from './purchase';
import { INTERNAL_API } from './internal';

export const API_ENDPOINTS = {
  core: CORE_API,
  customers: CUSTOMER_API,
  purchase: PURCHASE_API,
  internal: INTERNAL_API,
  external: EXTERNAL_API,
};
