// apiClient.js — Full mock, no backend required.
// All GET requests read from localStorage. All writes return success.

const fakeDelay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// URL fragment → localStorage key + optional nested path
const URL_MAP = [
  // clients (rewritten separately, but keep fallback)
  { match: 'clients',             key: 'appClients',                     wrap: null },
  // users
  { match: 'users',               key: 'appUsers',                       wrap: null },
  // products
  { match: 'product_attributes',  key: 'appProductAttributes',           wrap: null },
  { match: 'products',            key: 'appProducts',                    wrap: 'data' },
  // categories
  { match: 'categories',          key: 'appCategories',                  wrap: null },
  // suppliers
  { match: 'supplier_payments',   key: 'appSupplierPayments',            wrap: null },
  { match: 'suppliers',           key: 'appSuppliers',                   wrap: 'data' },
  // warehouses
  { match: 'warehouses',          key: 'appWarehouses',                  wrap: 'data' },
  // inventory
  { match: 'inventory',           key: 'appInventory',                   wrap: null },
  // sales
  { match: 'sales_deliveries',    key: 'appSalesDeliveries',             wrap: null },
  { match: 'sales_returns',       key: 'appSalesReturns',                wrap: null },
  { match: 'sales_orders',        key: 'appSalesOrders',                 wrap: null },
  // purchases
  { match: 'purchase_returns',    key: 'appPurchaseReturns',             wrap: null },
  { match: 'purchase_orders',     key: 'appPurchaseOrders',              wrap: null },
  // goods receipts
  { match: 'goods_receipts',      key: 'appGoodsReceipts',               wrap: 'data' },
  // safes
  { match: 'safe_transfers',      key: 'appSafeTransfers',               wrap: null },
  { match: 'safe_transactions',   key: 'appSafeTransactions',            wrap: null },
  { match: 'safes',               key: 'appSafes',                       wrap: null },
  // payments
  { match: 'client_payments',     key: 'appClientPayments',              wrap: null },
  { match: 'payment_methods',     key: 'appPaymentMethods',              wrap: null },
  // client metadata
  { match: 'client_area_tags',    key: 'appClientAreaTags',              wrap: null },
  { match: 'client_industries',   key: 'appClientIndustries',            wrap: null },
  { match: 'client_types',        key: 'appClientTypes',                 wrap: null },
  { match: 'client_documents',    key: 'appClientDocuments',             wrap: null },
  { match: 'client_account_statement', key: 'appClientPayments',         wrap: null },
  { match: 'client_cash',         key: 'appClientPayments',              wrap: null },
  { match: 'client_refunds',      key: 'appSalesReturns',                wrap: null },
  { match: 'clientInterestedProducts', key: 'appProducts',               wrap: 'data' },
  // countries / governorates
  { match: 'governorates',        key: 'appCountriesWithGovernorates',   wrap: null },
  { match: 'countries',           key: 'appCountriesWithGovernorates',   wrap: null },
  // transfers
  { match: 'transfer_requests',   key: 'appTransferRequests',            wrap: null },
  { match: 'transfers',           key: 'appTransfers',                   wrap: null },
  // visits
  { match: 'visit_plans',         key: 'appVisitPlans',                  wrap: null },
  { match: 'visitPlans',          key: 'appVisitPlans',                  wrap: null },
  { match: 'visits',              key: 'appVisits',                      wrap: null },
  // notifications
  { match: 'notifications',       key: 'appNotifications',               wrap: null },
  // settings
  { match: 'settings',            key: 'appSettings',                    wrap: null },
  // representative
  { match: 'representative_attendance', key: 'appRepresentativeAttendance', wrap: null },
  { match: 'representativeSettings',    key: 'appRepresentativeSettings',   wrap: null },
  // packaging / units
  { match: 'packaging_types',     key: 'appPackagingTypes',              wrap: 'data' },
  { match: 'base_units',          key: 'appBaseUnits',                   wrap: 'data' },
  // financial
  { match: 'financial_transactions', key: 'appFinancialTransactions',    wrap: null },
  { match: 'accounts',            key: 'appAccounts',                    wrap: null },
  // dashboard
  { match: 'dashboard',           key: 'appDashboardStats',              wrap: null },
  // userSafes / userWarehouses
  { match: 'userSafes',           key: 'appUserSafes',                   wrap: null },
  { match: 'userWarehouses',      key: 'appUserWarehouses',              wrap: null },
  // odoo
  { match: 'odoo',                key: null,                             wrap: null },
];

function readFromLocalStorage(key, wrap) {
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return wrap ? { data: [] } : [];
    const parsed = JSON.parse(raw);
    if (wrap === 'data') {
      // parsed may already be { data: [...] } or a plain array
      if (parsed && parsed.data !== undefined) return parsed;
      return { data: Array.isArray(parsed) ? parsed : [] };
    }
    return parsed;
  } catch {
    return wrap ? { data: [] } : [];
  }
}

function resolve(url) {
  for (const entry of URL_MAP) {
    if (url.includes(entry.match)) {
      return readFromLocalStorage(entry.key, entry.wrap);
    }
  }
  return [];
}

const SUCCESS_WRITE = { status: 'success', message: 'تمت العملية بنجاح!', data: {} };

export const apiClient = {
  async get(url) {
    await fakeDelay();
    return { status: 'success', data: resolve(url) };
  },
  async post(url, body) {
    await fakeDelay();
    return { status: 'success', message: 'تمت العملية بنجاح!', data: body || {} };
  },
  async put(url, body) {
    await fakeDelay();
    return { status: 'success', message: 'تمت العملية بنجاح!', data: body || {} };
  },
  async delete() {
    await fakeDelay();
    return { status: 'success', message: 'تمت العملية بنجاح!', data: {} };
  },
  async postFormData(url, formData) {
    await fakeDelay();
    // Extract entries so callers that inspect the response get something back
    const data = {};
    if (formData instanceof FormData) {
      for (const [k, v] of formData.entries()) data[k] = v;
    }
    return { status: 'success', message: 'تمت العملية بنجاح!', data };
  },
};

export function setGlobalAuthContext() {}
export function clearGlobalAuthContext() {}
