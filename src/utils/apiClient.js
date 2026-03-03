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

// ── Tiny helpers ───────────────────────────────────────────────────────────
function readArr(key) {
  try {
    const r = JSON.parse(localStorage.getItem(key) || 'null');
    if (!r) return [];
    if (Array.isArray(r)) return r;
    if (Array.isArray(r.data)) return r.data;
    return [];
  } catch { return []; }
}

function getUrlParams(url) {
  try {
    // Handle relative URLs by providing a base
    const parsed = new URL(url, 'http://localhost');
    return Object.fromEntries(parsed.searchParams);
  }
  catch { return {}; }
}

// ── Smart enrichers ─────────────────────────────────────────────────────────
function buildSalesOrderEnricher() {
  const clients       = readArr('appClients');
  const warehouses    = readArr('appWarehouses');
  const users         = readArr('appUsers');
  const allItems      = readArr('appSalesOrderItems');
  const variants      = readArr('appProductVariants');
  const productsRaw   = (() => { try { const r = JSON.parse(localStorage.getItem('appProducts') || 'null'); return Array.isArray(r) ? r : (r?.data || []); } catch { return []; } })();
  const packTypes     = readArr('appPackagingTypes');
  return { clients, warehouses, users, allItems, variants, products: productsRaw, packTypes };
}

function enrichOrder(order, { clients, warehouses, users, allItems }) {
  const client    = clients.find(c => c.clients_id === order.sales_orders_client_id);
  const warehouse = warehouses.find(w => w.warehouse_id === order.sales_orders_warehouse_id);
  const rep       = users.find(u => u.users_id === order.sales_orders_representative_id);
  const count     = allItems.filter(i => i.sales_order_items_sales_order_id === order.sales_orders_id).length;
  return {
    ...order,
    clients_company_name : client?.clients_company_name || client?.clients_contact_name || `عميل #${order.sales_orders_client_id}`,
    client_name          : client?.clients_company_name || client?.clients_contact_name || `عميل #${order.sales_orders_client_id}`,
    clients_id           : order.sales_orders_client_id,
    warehouse_name       : warehouse?.warehouse_name || `مخزن #${order.sales_orders_warehouse_id}`,
    representative_name  : rep?.users_name || `مندوب #${order.sales_orders_representative_id}`,
    items_count          : count,
    total_items          : count,
  };
}

function enrichOrderWithItems(order, ctx) {
  const { allItems, variants, products, packTypes } = ctx;
  const enriched = enrichOrder(order, ctx);
  const items = allItems
    .filter(i => i.sales_order_items_sales_order_id === order.sales_orders_id)
    .map(item => {
      const variant = variants.find(v => v.product_variants_id === item.sales_order_items_variant_id);
      const product = variant ? products.find(p => p.products_id === variant.product_variants_product_id) : null;
      const pkg     = packTypes.find(pt => pt.packaging_types_id === item.sales_order_items_packaging_type_id);
      return {
        ...item,
        variant_name              : variant?.product_variants_name || variant?.variant_name || 'منتج غير محدد',
        products_name             : product?.products_name || 'منتج غير محدد',
        variant_sku               : variant?.product_variants_sku || variant?.variant_sku || '',
        packaging_types_name      : pkg?.packaging_types_name || '',
        delivered_quantity        : 0,
        returned_quantity         : 0,
        sales_order_items_discount_amount : item.sales_order_items_discount || 0,
        sales_order_items_has_tax         : item.sales_order_items_tax_rate > 0 ? 1 : 0,
        sales_order_items_tax_amount      : (item.sales_order_items_total || 0) * ((item.sales_order_items_tax_rate || 0) / 100),
        sales_order_items_total_price     : item.sales_order_items_total || 0,
      };
    });
  return { ...enriched, items };
}

export const apiClient = {
  async get(url) {
    await fakeDelay();
    const params = getUrlParams(url);
    const urlId  = params.id ? parseInt(params.id, 10) : null;

    // ── Sales Orders ─────────────────────────────────────────────────────────
    if (url.includes('sales_orders')) {
      const orders = readArr('appSalesOrders');
      const ctx    = buildSalesOrderEnricher();

      if (urlId) {
        const order = orders.find(o => o.sales_orders_id === urlId);
        return { status: 'success', data: order ? enrichOrderWithItems(order, ctx) : {} };
      }

      let filtered = [...orders];
      if (params.client_id)        filtered = filtered.filter(o => String(o.sales_orders_client_id)         === params.client_id);
      if (params.status)           filtered = filtered.filter(o => o.sales_orders_status                    === params.status);
      if (params.delivery_status)  filtered = filtered.filter(o => o.sales_orders_delivery_status           === params.delivery_status);
      if (params.representative_id)filtered = filtered.filter(o => String(o.sales_orders_representative_id)  === params.representative_id);
      if (params.warehouse_id)     filtered = filtered.filter(o => String(o.sales_orders_warehouse_id)        === params.warehouse_id);
      if (params.date_from)        filtered = filtered.filter(o => (o.sales_orders_order_date||'') >= params.date_from);
      if (params.date_to)          filtered = filtered.filter(o => (o.sales_orders_order_date||'') <= params.date_to);
      if (params.search) {
        const t = params.search.toLowerCase();
        filtered = filtered.filter(o => {
          const cl = ctx.clients.find(c => c.clients_id === o.sales_orders_client_id);
          return String(o.sales_orders_id||'').includes(t)
              || (cl?.clients_company_name||'').toLowerCase().includes(t)
              || (o.sales_orders_notes||'').toLowerCase().includes(t);
        });
      }
      filtered.sort((a,b) => b.sales_orders_id - a.sales_orders_id);

      const total  = filtered.length;
      const page   = parseInt(params.page  || '1',  10);
      const limit  = parseInt(params.limit || '10', 10);
      const offset = (page - 1) * limit;
      const data   = filtered.slice(offset, offset + limit).map(o => enrichOrder(o, ctx));

      return { status: 'success', data: { data, total, page, per_page: limit, total_pages: Math.max(1, Math.ceil(total / limit)) } };
    }

    // ── Sales Returns ─────────────────────────────────────────────────────────
    if (url.includes('sales_returns')) {
      const returns   = readArr('appSalesReturns');
      const orders    = readArr('appSalesOrders');
      const clients   = readArr('appClients');
      const allItems  = readArr('appSalesReturnItems');
      const variants  = readArr('appProductVariants');
      const productsR = (() => { try { const r = JSON.parse(localStorage.getItem('appProducts')||'null'); return Array.isArray(r)?r:(r?.data||[]); } catch{return[];} })();
      const packTypes = readArr('appPackagingTypes');

      const getClientForReturn = (ret) => {
        const cid = ret.sales_returns_client_id
          || orders.find(o => o.sales_orders_id === ret.sales_returns_sales_order_id)?.sales_orders_client_id;
        return clients.find(c => c.clients_id === cid);
      };

      const enrich = (ret) => {
        const client   = getClientForReturn(ret);
        const count    = allItems.filter(i => i.sales_return_items_sales_return_id === ret.sales_returns_id).length;
        const clientId = client?.clients_id;
        return {
          ...ret,
          returns_id             : ret.sales_returns_id,
          id                     : ret.sales_returns_id,
          returns_client_id      : clientId,
          returns_client_name    : client?.clients_company_name || `عميل #${clientId}`,
          client_name            : client?.clients_company_name || `عميل #${clientId}`,
          clients_company_name   : client?.clients_company_name || `عميل #${clientId}`,
          returns_return_date    : ret.sales_returns_return_date,
          return_date            : ret.sales_returns_return_date,
          returns_reason         : ret.sales_returns_reason,
          reason                 : ret.sales_returns_reason,
          returns_notes          : ret.sales_returns_notes,
          notes                  : ret.sales_returns_notes,
          returns_total_amount   : ret.sales_returns_total_amount,
          total_amount           : ret.sales_returns_total_amount,
          returns_status         : ret.sales_returns_status || 'Processed',
          status                 : ret.sales_returns_status || 'Processed',
          items_count            : count,
          total_items            : count,
        };
      };

      if (urlId) {
        const ret = returns.find(r => r.sales_returns_id === urlId);
        if (ret) {
          const enriched = enrich(ret);
          const items = allItems
            .filter(i => i.sales_return_items_sales_return_id === urlId)
            .map(item => {
              const variant = variants.find(v => v.product_variants_id === item.sales_return_items_variant_id);
              const product = variant ? productsR.find(p => p.products_id === variant.product_variants_product_id) : null;
              const pkg     = packTypes.find(pt => pt.packaging_types_id === item.sales_return_items_packaging_type_id);
              return { ...item, variant_name: variant?.product_variants_name||'منتج غير محدد', products_name: product?.products_name||'منتج غير محدد', packaging_types_name: pkg?.packaging_types_name||'' };
            });
          return { status: 'success', data: { ...enriched, items } };
        }
        return { status: 'success', data: {} };
      }

      let filtered = [...returns];
      if (params.client_id) {
        filtered = filtered.filter(r => {
          const o = orders.find(o2 => o2.sales_orders_id === r.sales_returns_sales_order_id);
          return String(r.sales_returns_client_id || o?.sales_orders_client_id || '') === params.client_id;
        });
      }
      if (params.status)    filtered = filtered.filter(r => r.sales_returns_status === params.status);
      if (params.date_from) filtered = filtered.filter(r => (r.sales_returns_return_date||'') >= params.date_from);
      if (params.date_to)   filtered = filtered.filter(r => (r.sales_returns_return_date||'') <= params.date_to);
      if (params.search) {
        const t = params.search.toLowerCase();
        filtered = filtered.filter(r => {
          const cl = getClientForReturn(r);
          return String(r.sales_returns_id||'').includes(t)
              || (cl?.clients_company_name||'').toLowerCase().includes(t)
              || (r.sales_returns_reason||'').toLowerCase().includes(t);
        });
      }
      filtered.sort((a,b) => b.sales_returns_id - a.sales_returns_id);

      const total  = filtered.length;
      const page   = parseInt(params.page  || '1',  10);
      const limit  = parseInt(params.limit || '10', 10);
      const offset = (page - 1) * limit;
      const data   = filtered.slice(offset, offset + limit).map(enrich);

      return { status: 'success', data: { data, pagination: { total_items: total, total, page, current_page: page, limit, per_page: limit, total_pages: Math.max(1, Math.ceil(total / limit)) } } };
    }

    // ── Safes ─────────────────────────────────────────────────────────────────
    if (url.includes('safes')) {
      const safes    = readArr('appSafes');
      const users    = readArr('appUsers');
      const methods  = readArr('appPaymentMethods');
      const enrichSafe = (s) => {
        const rep    = s.rep_user_id ? users.find(u => u.users_id === s.rep_user_id) : null;
        const method = s.payment_method_id ? methods.find(m => m.payment_methods_id === s.payment_method_id) : null;
        return {
          ...s,
          rep_name           : rep?.users_name || s.rep_name || '',
          payment_method_name: method?.payment_methods_name || s.payment_method_name || '',
          safes_is_active    : s.safes_is_active ?? (s.safes_status === 'active' ? 1 : 0),
        };
      };
      if (urlId) {
        const safe = safes.find(s => s.safes_id === urlId);
        return { status: 'success', data: safe ? enrichSafe(safe) : {} };
      }
      return { status: 'success', data: safes.map(enrichSafe) };
    }

    // ── Safe Transactions ─────────────────────────────────────────────────────
    if (url.includes('safe_transactions')) {
      const txns   = readArr('appSafeTransactions');
      const users  = readArr('appUsers');
      const safeId = params.safe_id ? parseInt(params.safe_id, 10) : null;
      if (urlId) {
        const txn = txns.find(t => t.safe_transactions_id === urlId);
        if (!txn) return { status: 'success', data: {} };
        const u = users.find(u => u.users_id === txn.safe_transactions_user_id);
        return { status: 'success', data: { ...txn, user_name: u?.users_name || txn.user_name || '' } };
      }
      let filtered = safeId ? txns.filter(t => t.safe_transactions_safe_id === safeId) : [...txns];
      if (params.type)      filtered = filtered.filter(t => t.safe_transactions_type === params.type);
      if (params.status)    filtered = filtered.filter(t => t.safe_transactions_status === params.status);
      if (params.date_from) filtered = filtered.filter(t => (t.safe_transactions_date||'') >= params.date_from);
      if (params.date_to)   filtered = filtered.filter(t => (t.safe_transactions_date||'') <= params.date_to);
      if (params.search) {
        const t = params.search.toLowerCase();
        filtered = filtered.filter(tx =>
          String(tx.safe_transactions_id||'').includes(t) ||
          (tx.safe_transactions_description||'').toLowerCase().includes(t) ||
          (tx.safe_transactions_reference||'').toLowerCase().includes(t)
        );
      }
      filtered.sort((a, b) => b.safe_transactions_id - a.safe_transactions_id);
      const total  = filtered.length;
      const page   = parseInt(params.page  || '1',  10);
      const limit  = parseInt(params.limit || '10', 10);
      const offset = (page - 1) * limit;
      const enrichedTxns = filtered.slice(offset, offset + limit).map(t => {
        const u = users.find(u => u.users_id === t.safe_transactions_user_id);
        return { ...t, user_name: u?.users_name || t.user_name || '' };
      });
      return { status: 'success', data: enrichedTxns, pagination: { total, page, per_page: limit, total_pages: Math.max(1, Math.ceil(total / limit)) } };
    }

    // ── Safe Transfers ────────────────────────────────────────────────────────
    if (url.includes('safe_transfers')) {
      const transfers = readArr('appSafeTransfers');
      const safes     = readArr('appSafes');
      const users     = readArr('appUsers');
      if (urlId) {
        const tfr = transfers.find(t => t.transfer_out_id === urlId || t.safe_transactions_id === urlId);
        return { status: 'success', data: tfr ? tfr : {} };
      }
      let filtered = [...transfers];
      const safeId     = params.safe_id     ? parseInt(params.safe_id, 10) : null;
      const userId     = params.user_id     ? parseInt(params.user_id, 10) : null;
      const outDestId  = params.out_dest_safe_id ? parseInt(params.out_dest_safe_id, 10) : null;
      const inDestId   = params.in_dest_safe_id  ? parseInt(params.in_dest_safe_id, 10)  : null;
      const statusF    = params.status ? params.status.toLowerCase() : null;
      const transferIdF= params.transfer_id ? parseInt(params.transfer_id, 10) : null;
      if (safeId)      filtered = filtered.filter(t => t.affected_safe_id === safeId || t.safe_transactions_counterpart_safe_id === safeId);
      if (outDestId)   filtered = filtered.filter(t => t.affected_safe_id === outDestId);
      if (inDestId)    filtered = filtered.filter(t => t.safe_transactions_counterpart_safe_id === inDestId);
      if (userId)      filtered = filtered.filter(t => t.safe_transactions_user_id === userId);
      if (statusF)     filtered = filtered.filter(t => (t.transfer_out_status||'').toLowerCase() === statusF || (t.safe_transactions_status||'').toLowerCase() === statusF);
      if (transferIdF) filtered = filtered.filter(t => t.transfer_out_id === transferIdF || t.transfer_in_id === transferIdF);
      if (params.date_range) {
        const [df, dt] = params.date_range.split(',');
        if (df) filtered = filtered.filter(t => (t.safe_transactions_date||'') >= df);
        if (dt) filtered = filtered.filter(t => (t.safe_transactions_date||'') <= dt);
      }
      if (params.search) {
        const t = params.search.toLowerCase();
        filtered = filtered.filter(tr =>
          String(tr.transfer_out_id||'').includes(t) ||
          (tr.user_name||'').toLowerCase().includes(t) ||
          (tr.affected_safe_name||'').toLowerCase().includes(t) ||
          (tr.counterpart_safe_name||'').toLowerCase().includes(t) ||
          (tr.safe_transactions_reference||'').toLowerCase().includes(t)
        );
      }
      filtered.sort((a, b) => b.transfer_out_id - a.transfer_out_id);
      const total  = filtered.length;
      const page   = parseInt(params.page  || '1',  10);
      const limit  = parseInt(params.limit || '10', 10);
      const offset = (page - 1) * limit;
      const enriched = filtered.slice(offset, offset + limit).map(t => {
        const u    = users.find(u => u.users_id === t.safe_transactions_user_id);
        const src  = safes.find(s => s.safes_id === t.affected_safe_id);
        const dst  = safes.find(s => s.safes_id === t.safe_transactions_counterpart_safe_id);
        return {
          ...t,
          user_name           : u?.users_name || t.user_name || '',
          affected_safe_name  : src?.safes_name || t.affected_safe_name || '',
          affected_safe_type  : src?.safes_type || t.affected_safe_type || 'company',
          counterpart_safe_name: dst?.safes_name || t.counterpart_safe_name || '',
          counterpart_safe_type: dst?.safes_type || t.counterpart_safe_type || 'company',
        };
      });
      return { status: 'success', data: enriched, pagination: { total, page, per_page: limit, total_pages: Math.max(1, Math.ceil(total / limit)) } };
    }

    // ── Product Reports (reports_comprehensive.php) ──────────────────────────
    if (url.includes('products/reports_comprehensive') || url.includes('products/interested_product_clients')) {

      if (url.includes('interested_product_clients')) {
        const productsRaw = (() => { try { const r = JSON.parse(localStorage.getItem('appProducts')||'null'); return Array.isArray(r)?r:(r?.data||[]); } catch{return[];} })();
        const productId = parseInt(params.products_id || '0', 10);
        const product = productsRaw.find(p => p.products_id === productId) || productsRaw[0] || {};
        const clients = readArr('appClients');
        const users   = readArr('appUsers');
        const picked  = clients.sort(() => 0.5-Math.random()).slice(0, Math.min(8, clients.length));
        return { status: 'success', data: {
          product: { products_name: product.products_name||'منتج', products_category: null, products_brand: null, products_description: product.products_description||'', products_image_url: null },
          clients: picked.map(c => { const rep = users.find(u=>u.users_id===c.clients_rep_user_id); return { clients_id: c.clients_id, client_display_name: c.clients_company_name||c.clients_contact_name, clients_contact_name: c.clients_contact_name, clients_contact_phone_1: c.clients_contact_phone_1, clients_city: c.clients_city, representative_name: rep?.users_name||'', clients_status: c.clients_status }; }),
        }};
      }

      const reportType = params.report_type || 'overview';
      const productsRaw   = (() => { try { const r = JSON.parse(localStorage.getItem('appProducts')||'null'); return Array.isArray(r)?r:(r?.data||[]); } catch{return[];} })();
      const variants      = readArr('appProductVariants');
      const inventory     = readArr('appInventory');
      const categories    = readArr('appCategories');
      const suppliers     = readArr('appSuppliers');
      const warehouses    = readArr('appWarehouses');
      const clients       = readArr('appClients');
      const totalP        = productsRaw.length;
      const activeP       = productsRaw.filter(p => p.products_status === 'active' || p.products_is_active === 1);
      const inactiveP     = productsRaw.filter(p => p.products_status === 'inactive' || p.products_is_active === 0);
      const now           = new Date();
      const thisMonth     = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
      const lastMonth     = (() => { const d = new Date(now); d.setMonth(d.getMonth()-1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; })();

      // inventory helpers
      const variantQty  = {};
      inventory.forEach(inv => { variantQty[inv.inventory_variant_id] = (variantQty[inv.inventory_variant_id]||0) + inv.inventory_quantity; });
      const inStock     = Object.values(variantQty).filter(q => q > 10).length;
      const lowStock    = Object.values(variantQty).filter(q => q > 0 && q <= 10).length;
      const outOfStock  = variants.length - Object.keys(variantQty).length + Object.values(variantQty).filter(q => q <= 0).length;
      const totalInvVal = inventory.reduce((s,inv) => { const v = variants.find(vr => vr.product_variants_id === inv.inventory_variant_id); return s + (v ? v.product_variants_purchase_price * inv.inventory_quantity : 0); }, 0);

      if (reportType === 'overview') {
        const newThis = productsRaw.filter(p => (p.products_created_at||'').toString().startsWith(thisMonth));
        const newLast = productsRaw.filter(p => (p.products_created_at||'').toString().startsWith(lastMonth));
        return { status: 'success', data: {
          total_products: totalP, growth_rate: newLast.length ? parseFloat((((newThis.length-newLast.length)/newLast.length)*100).toFixed(1)) : 0,
          active_products: activeP.length, active_percentage: totalP ? parseFloat(((activeP.length/totalP)*100).toFixed(1)) : 0,
          products_in_stock: inStock, stock_percentage: variants.length ? parseFloat(((inStock/variants.length)*100).toFixed(1)) : 0,
          new_this_month: newThis.length, new_last_month: newLast.length,
          total_categories: categories.length, total_brands: 0, out_of_stock: outOfStock, inactive_products: inactiveP.length,
          total_inventory_value: parseFloat(totalInvVal.toFixed(2)),
        }};
      }

      if (reportType === 'inventory') {
        const whMap = {};
        inventory.forEach(inv => {
          const wid = inv.inventory_warehouse_id;
          if (!whMap[wid]) whMap[wid] = { warehouse_id: wid, variantSet: new Set(), total_quantity: 0, in_stock: 0, low_stock: 0, out_of_stock: 0 };
          whMap[wid].variantSet.add(inv.inventory_variant_id);
          whMap[wid].total_quantity += inv.inventory_quantity || 0;
          if (inv.inventory_quantity > 10) whMap[wid].in_stock++;
          else if (inv.inventory_quantity > 0) whMap[wid].low_stock++;
          else whMap[wid].out_of_stock++;
        });
        const whArr = Object.values(whMap).map(w => {
          const wh = warehouses.find(wh => wh.warehouse_id === w.warehouse_id);
          return { warehouse_id: w.warehouse_id, warehouse_name: wh?.warehouse_name||`مخزن #${w.warehouse_id}`, unique_products: w.variantSet.size, unique_variants: w.variantSet.size, total_quantity: Math.round(w.total_quantity), in_stock_count: w.in_stock, low_stock_count: w.low_stock, out_of_stock_count: w.out_of_stock };
        });
        const topProducts = [];
        const variantWh = {};
        inventory.forEach(inv => { const k = inv.inventory_variant_id; if (!variantWh[k]) variantWh[k] = { qty: 0, whs: new Set() }; variantWh[k].qty += inv.inventory_quantity||0; variantWh[k].whs.add(inv.inventory_warehouse_id); });
        Object.entries(variantWh).sort((a,b)=>b[1].qty-a[1].qty).slice(0,10).forEach(([vid, info]) => {
          const v = variants.find(vr => vr.product_variants_id === parseInt(vid));
          const p = v ? productsRaw.find(pr => pr.products_id === v.product_variants_product_id) : null;
          topProducts.push({ products_name: p?.products_name||'منتج', variant_name: v?.product_variants_name||null, total_quantity: Math.round(info.qty), warehouse_count: info.whs.size });
        });
        return { status: 'success', data: {
          warehouses: whArr,
          status_summary: { 'In Stock': { count: inStock, quantity: Math.round(inventory.filter(i=>i.inventory_quantity>10).reduce((s,i)=>s+i.inventory_quantity,0)) }, 'Low Stock': { count: lowStock, quantity: Math.round(inventory.filter(i=>i.inventory_quantity>0&&i.inventory_quantity<=10).reduce((s,i)=>s+i.inventory_quantity,0)) }, 'Out of Stock': { count: outOfStock, quantity: 0 } },
          top_products: topProducts,
        }};
      }

      if (reportType === 'categories') {
        const catArr = categories.map(cat => {
          const prods = productsRaw.filter(p => p.products_category_id === cat.categories_id);
          const activeCat = prods.filter(p => p.products_status==='active' || p.products_is_active===1);
          const inactiveCat = prods.length - activeCat.length;
          const catInv = inventory.filter(inv => { const v = variants.find(vr => vr.product_variants_id === inv.inventory_variant_id); return v && prods.some(p => p.products_id === v.product_variants_product_id); });
          return { category_name: cat.categories_name, product_count: prods.length, active_count: activeCat.length, inactive_count: inactiveCat, total_inventory: Math.round(catInv.reduce((s,i)=>s+i.inventory_quantity,0)), percentage: totalP?parseFloat(((prods.length/totalP)*100).toFixed(1)):0 };
        }).sort((a,b) => b.product_count - a.product_count);
        return { status: 'success', data: { total_categories: categories.length, categories: catArr }};
      }

      if (reportType === 'suppliers') {
        const supMap = {};
        productsRaw.forEach(p => { const sid = p.products_supplier_id; if (sid) { if (!supMap[sid]) supMap[sid] = { count: 0, active: 0, invQty: 0 }; supMap[sid].count++; if (p.products_status==='active') supMap[sid].active++; } });
        // sum inventory per supplier
        inventory.forEach(inv => { const v = variants.find(vr=>vr.product_variants_id===inv.inventory_variant_id); if (v) { const p = productsRaw.find(pr=>pr.products_id===v.product_variants_product_id); if (p?.products_supplier_id && supMap[p.products_supplier_id]) supMap[p.products_supplier_id].invQty += inv.inventory_quantity||0; } });
        const supArr = Object.entries(supMap).map(([id, info]) => {
          const sup = suppliers.find(s => s.supplier_id === parseInt(id));
          return { supplier_id: parseInt(id), supplier_name: sup?.supplier_name||`مورد #${id}`, supplier_phone: sup?.supplier_phone||null, supplier_email: sup?.supplier_email||null, product_count: info.count, active_products: info.active, total_inventory: Math.round(info.invQty) };
        }).sort((a,b) => b.product_count - a.product_count);
        return { status: 'success', data: { total_suppliers: suppliers.length, suppliers: supArr }};
      }

      if (reportType === 'analytics') {
        const catCounts = {};
        productsRaw.forEach(p => { const cat = categories.find(c=>c.categories_id===p.products_category_id); const name = cat?.categories_name||'بدون تصنيف'; catCounts[name]=(catCounts[name]||0)+1; });
        const catAnalysis = Object.entries(catCounts).map(([name, count]) => ({ category_name: name, count, percentage: totalP?parseFloat(((count/totalP)*100).toFixed(1)):0 })).sort((a,b)=>b.count-a.count);
        const newThis = productsRaw.filter(p => (p.products_created_at||'').toString().startsWith(thisMonth)).length;
        const newLast = productsRaw.filter(p => (p.products_created_at||'').toString().startsWith(lastMonth)).length;
        return { status: 'success', data: {
          total_products: totalP,
          status_analysis: { active: activeP.length, inactive: inactiveP.length, active_percentage: totalP?parseFloat(((activeP.length/totalP)*100).toFixed(1)):0, inactive_percentage: totalP?parseFloat(((inactiveP.length/totalP)*100).toFixed(1)):0 },
          inventory_analysis: { in_stock: inStock, out_of_stock: outOfStock, stock_percentage: variants.length?parseFloat(((inStock/variants.length)*100).toFixed(1)):0, total_inventory_units: Math.round(inventory.reduce((s,i)=>s+i.inventory_quantity,0)) },
          category_analysis: catAnalysis,
          brand_analysis: [],
          growth_analysis: { this_month: newThis, last_month: newLast, growth_rate: newLast?parseFloat((((newThis-newLast)/newLast)*100).toFixed(1)):0 },
        }};
      }

      if (reportType === 'stock_levels') {
        const lowItems = [];
        inventory.filter(i => i.inventory_quantity <= 10).forEach(inv => {
          const v = variants.find(vr => vr.product_variants_id === inv.inventory_variant_id);
          const p = v ? productsRaw.find(pr => pr.products_id === v.product_variants_product_id) : null;
          const wh = warehouses.find(w => w.warehouse_id === inv.inventory_warehouse_id);
          lowItems.push({ products_name: p?.products_name||'منتج', variant_name: v?.product_variants_name||null, warehouse_name: wh?.warehouse_name||'مخزن', inventory_quantity: inv.inventory_quantity, inventory_status: inv.inventory_quantity <= 0 ? 'Out of Stock' : 'Low Stock', inventory_last_movement_at: inv.inventory_production_date||null });
        });
        return { status: 'success', data: {
          stock_summary: { 'In Stock': inStock, 'Low Stock': lowStock, 'Out of Stock': outOfStock },
          total_low_stock: lowItems.length,
          low_stock_items: lowItems.sort((a,b) => a.inventory_quantity - b.inventory_quantity),
        }};
      }

      if (reportType === 'interested_products') {
        const picked = productsRaw.sort(() => 0.5-Math.random()).slice(0, 20);
        const prods = picked.map(p => ({ products_id: p.products_id, products_name: p.products_name, products_brand: null, products_category: categories.find(c=>c.categories_id===p.products_category_id)?.categories_name||null, products_image_url: null, interested_clients_count: Math.floor(Math.random()*15)+1 }));
        const topProd = prods.sort((a,b) => b.interested_clients_count - a.interested_clients_count)[0];
        return { status: 'success', data: {
          summary: { unique_clients: Math.min(clients.length, 30+Math.floor(Math.random()*20)), total_interests: prods.reduce((s,p)=>s+p.interested_clients_count,0), total_products: prods.length, top_product: topProd ? { products_name: topProd.products_name, interested_clients_count: topProd.interested_clients_count } : null },
          products: prods,
          categories: categories.map(c=>c.categories_name),
        }};
      }

      return { status: 'success', data: {} };
    }

    // ── Representatives Reports (reports/representatives.php) ────────────────
    if (url.includes('reports/representatives')) {
      const users       = readArr('appUsers');
      const visits      = readArr('appVisits');
      const section     = params.section || 'overview';
      const now         = new Date();
      const todayStr    = now.toISOString().split('T')[0];

      if (section === 'overview') {
        const reps        = users.filter(u => u.users_role === 'sales_representative' || u.users_role === 'sales_rep' || u.users_role === 'representative');
        const totalReps   = reps.length || users.length;
        const todayVisits = visits.filter(v => (v.visits_visit_date||'').toString().split('T')[0] === todayStr);
        const activeToday = new Set(todayVisits.map(v => v.visits_representative_id)).size;
        const totalVisits = visits.length;
        const completedV  = visits.filter(v => v.visits_status === 'Completed');
        const avgDuration = completedV.length ? completedV.reduce((s,v) => s + (v.visit_duration_minutes||30), 0) / completedV.length : 0;
        const totalWorkHours = Math.round(avgDuration * completedV.length / 60);
        const workDays    = new Set(visits.map(v => (v.visits_visit_date||'').toString().split('T')[0])).size;
        return { status: 'success', data: {
          total_representatives: totalReps,
          active_today: activeToday || Math.min(totalReps, 5),
          total_work_hours: totalWorkHours || Math.round(totalReps * 6.5),
          avg_work_hours: workDays ? parseFloat((totalWorkHours / workDays).toFixed(1)) : 7.2,
          total_work_days: workDays || 22,
          total_visits: totalVisits,
          attendance_rate: totalReps ? parseFloat(((Math.min(activeToday||5, totalReps) / totalReps) * 100).toFixed(1)) : 80,
          avg_visits_per_rep: totalReps ? parseFloat((totalVisits / totalReps).toFixed(1)) : 0,
        }};
      }

      if (section === 'attendance') {
        const page  = parseInt(params.page  || '1',  10);
        const limit = parseInt(params.limit || '10', 10);
        // Build attendance records from visits data
        const visitsByDate = {};
        visits.forEach(v => {
          const date = (v.visits_visit_date||'').toString().split('T')[0] || todayStr;
          const uid  = v.visits_representative_id;
          const key  = `${uid}_${date}`;
          if (!visitsByDate[key]) {
            const user = users.find(u => u.users_id === uid);
            const checkin  = v.visits_check_in_time || '08:00:00';
            const checkout = v.visits_check_out_time || (v.visits_status === 'Completed' ? '17:00:00' : null);
            const [ih,im]  = checkin.split(':').map(Number);
            const [oh,om]  = (checkout||'17:00:00').split(':').map(Number);
            const durSec   = Math.max(0, ((oh*60+om)-(ih*60+im))*60);
            const status   = v.visits_status === 'Completed' ? 'ClockedOut' : (v.visits_status === 'Started' ? 'ClockedIn' : 'ClockedOut');
            visitsByDate[key] = {
              attendance_id: Object.keys(visitsByDate).length + 1,
              attendance_date: date,
              users_name: user?.users_name || `مندوب #${uid}`,
              shift_start_time: checkin,
              shift_end_time: checkout,
              total_work_duration_sec: durSec,
              attendance_status: status,
              start_latitude: v.visits_latitude || 30.05,
              start_longitude: v.visits_longitude || 31.25,
              end_latitude: checkout ? (v.visits_latitude||30.05) + 0.01 : null,
              end_longitude: checkout ? (v.visits_longitude||31.25) + 0.01 : null,
            };
          }
        });
        let items = Object.values(visitsByDate);
        if (params.user_id)    items = items.filter(a => { const ui = visits.find(v => { const d = (v.visits_visit_date||'').toString().split('T')[0]; return d===a.attendance_date && users.find(u=>u.users_id===v.visits_representative_id)?.users_name===a.users_name; }); return ui && String(ui.visits_representative_id) === params.user_id; });
        if (params.status)     items = items.filter(a => a.attendance_status === params.status);
        if (params.start_date) items = items.filter(a => a.attendance_date >= params.start_date);
        if (params.end_date)   items = items.filter(a => a.attendance_date <= params.end_date);
        items.sort((a,b) => b.attendance_date.localeCompare(a.attendance_date));
        const total  = items.length;
        const offset = (page - 1) * limit;
        return { status: 'success', data: { items: items.slice(offset, offset + limit), pagination: { total, total_pages: Math.max(1, Math.ceil(total / limit)), page, limit } } };
      }

      if (section === 'break_logs') {
        return { status: 'success', data: { break_logs: [
          { break_start_time: '10:30:00', break_end_time: '10:45:00', break_duration_sec: 900 },
          { break_start_time: '13:00:00', break_end_time: '13:30:00', break_duration_sec: 1800 },
        ] } };
      }

      if (section === 'location') {
        const repUsers = users.filter(u => u.users_role === 'sales_representative' || u.users_role === 'sales_rep' || u.users_role === 'representative');
        const pool = repUsers.length ? repUsers : users.slice(0, 10);
        const items = pool.map(u => ({
          user_id: u.users_id,
          users_name: u.users_name,
          users_email: u.users_email,
          users_role: u.users_role,
          tracking_time: new Date(Date.now() - Math.random()*3600000).toISOString(),
          battery_level: Math.floor(Math.random()*60)+40,
          phone_info: ['Samsung Galaxy S23', 'iPhone 15', 'Xiaomi 13', 'OPPO Reno', 'Huawei P60'][u.users_id%5],
          latitude: 30.0 + Math.random()*1.5,
          longitude: 31.0 + Math.random()*1.5,
        }));
        return { status: 'success', data: { items, total: items.length } };
      }

      if (section === 'location_history') {
        const _userId = params.user_id ? parseInt(params.user_id, 10) : 1;
        const page   = parseInt(params.page || '1', 10);
        const limit  = parseInt(params.limit || '100', 10);
        const items  = Array.from({length: 30}, (_, i) => ({
          id: i + 1,
          tracking_time: new Date(Date.now() - i * 1800000).toISOString(),
          battery_level: Math.floor(Math.random()*50)+50,
          latitude: 30.0 + Math.random()*0.05,
          longitude: 31.2 + Math.random()*0.05,
        }));
        return { status: 'success', data: { items: items.slice(0, limit), pagination: { total: items.length, page, limit } } };
      }

      // fallback for unknown sections
      return { status: 'success', data: {} };
    }

    // ── Visits & Visits Reports ─────────────────────────────────────────────
    if (
      url.includes('reports/visits') ||
      url.includes('visits/get_all') ||
      url.includes('visits/get_details') ||
      url.includes('visits/get_visit_summary')
    ) {
      const visits      = readArr('appVisits');
      const clients     = readArr('appClients');
      const users       = readArr('appUsers');
      const areaTags    = readArr('appClientAreaTags');
      const salesOrders = readArr('appSalesOrders');
      const clientPmts  = readArr('appClientPayments');
      const STATUS_POOL = ['Completed','Completed','Completed','Completed','Started','Started','Cancelled'];

      // Enrich each visit with joined + derived fields
      const enrichedVisits = visits.map(v => {
        const client  = clients.find(c => c.clients_id === v.visits_client_id);
        const user    = users.find(u => u.users_id === v.visits_representative_id);
        const areaTag = client ? areaTags.find(a => a.client_area_tag_id === client.clients_area_tag_id) : null;
        const status  = v.visits_status || STATUS_POOL[v.visits_id % STATUS_POOL.length];
        const checkin = v.visits_check_in_time
          || `${String(8 + (v.visits_id % 8)).padStart(2,'0')}:${String((v.visits_id * 7) % 60).padStart(2,'0')}:00`;
        const checkout = v.visits_check_out_time
          || `${String(9 + (v.visits_id % 8)).padStart(2,'0')}:${String((v.visits_id * 13) % 60).padStart(2,'0')}:00`;
        const visitDate = (v.visits_visit_date || v.visits_created_at || '').toString().split('T')[0] || '2024-01-01';
        const startDt   = v.visits_start_time || `${visitDate} ${checkin}`;
        const endDt     = v.visits_end_time   || (status === 'Completed' ? `${visitDate} ${checkout}` : null);
        const [ih, im]  = checkin.split(':').map(Number);
        const [oh, om]  = checkout.split(':').map(Number);
        const computedDuration = Math.max(10, (oh * 60 + om) - (ih * 60 + im));
        const duration  = v.visit_duration_minutes != null ? v.visit_duration_minutes
          : (status === 'Completed' ? computedDuration : null);
        const clientOrders   = salesOrders.filter(o => o.sales_orders_client_id === v.visits_client_id);
        const clientPaymentsArr = clientPmts.filter(p => p.client_payments_client_id === v.visits_client_id);
        return {
          ...v,
          visits_status         : status,
          visits_start_time     : startDt,
          visits_end_time       : endDt,
          visit_duration_minutes: duration,
          rep_name              : user?.users_name || `مندوب #${v.visits_representative_id}`,
          clients_company_name  : client?.clients_company_name || client?.clients_contact_name || `عميل #${v.visits_client_id}`,
          clients_city          : client?.clients_city || '',
          client_area_tag_id    : client?.clients_area_tag_id || null,
          client_area_tag_name  : areaTag?.client_area_tag_name || 'غير محدد',
          orders_count          : clientOrders.length % 5,
          payments_count        : clientPaymentsArr.length % 4,
          returns_count         : 0,
          activities_count      : (clientOrders.length + clientPaymentsArr.length) % 8,
        };
      });

      // ── visits/get_all.php (paginated list for DetailsTab) ──────────────
      if (url.includes('visits/get_all')) {
        let filtered = [...enrichedVisits];
        if (params.status)      filtered = filtered.filter(v => v.visits_status === params.status);
        if (params.rep_id)      filtered = filtered.filter(v => String(v.visits_representative_id) === params.rep_id);
        if (params.client_id)   filtered = filtered.filter(v => String(v.visits_client_id) === params.client_id);
        if (params.area_tag_id) filtered = filtered.filter(v => String(v.client_area_tag_id) === params.area_tag_id);
        if (params.date_from)   filtered = filtered.filter(v => (v.visits_visit_date||'').toString().split('T')[0] >= params.date_from);
        if (params.date_to)     filtered = filtered.filter(v => (v.visits_visit_date||'').toString().split('T')[0] <= params.date_to);
        if (params.search) {
          const t = params.search.toLowerCase();
          filtered = filtered.filter(v =>
            (v.clients_company_name||'').toLowerCase().includes(t) ||
            (v.rep_name||'').toLowerCase().includes(t) ||
            String(v.visits_id||'').includes(t)
          );
        }
        filtered.sort((a,b) => b.visits_id - a.visits_id);
        const total   = filtered.length;
        const page    = parseInt(params.page    || '1',  10);
        const perPage = parseInt(params.per_page || params.limit || '10', 10);
        const offset  = (page - 1) * perPage;
        return { status: 'success', data: {
          visits    : filtered.slice(offset, offset + perPage),
          pagination: { page, per_page: perPage, total_items: total, total, total_pages: Math.max(1, Math.ceil(total / perPage)) },
        }};
      }

      // ── visits/get_details.php or visits/get_visit_summary.php (single) ─
      if (url.includes('visits/get_details') || url.includes('visits/get_visit_summary')) {
        const visitId = urlId || parseInt(params.visit_id || params.id || '0', 10);
        const visit   = enrichedVisits.find(v => v.visits_id === visitId) || enrichedVisits[0] || {};
        return { status: 'success', data: {
          ...visit,
          summary_stats: {
            orders_count   : visit.orders_count    || 0,
            payments_count : visit.payments_count  || 0,
            returns_count  : visit.returns_count   || 0,
            activities_count: visit.activities_count || 0,
          },
        }};
      }

      // ── reports/visits.php — compute section aggregations ──────────────
      const section      = params.section || 'overview';
      const now          = new Date();
      const todayStr     = now.toISOString().split('T')[0];
      const weekStart    = new Date(now); weekStart.setDate(now.getDate() - 7);
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const monthStart   = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;

      const completed  = enrichedVisits.filter(v => v.visits_status === 'Completed');
      const started    = enrichedVisits.filter(v => v.visits_status === 'Started');
      const cancelled  = enrichedVisits.filter(v => v.visits_status === 'Cancelled');
      const todayV     = enrichedVisits.filter(v => (v.visits_visit_date||'').toString().split('T')[0] === todayStr);
      const weekV      = enrichedVisits.filter(v => (v.visits_visit_date||'').toString().split('T')[0] >= weekStartStr);
      const monthV     = enrichedVisits.filter(v => (v.visits_visit_date||'').toString().split('T')[0] >= monthStart);
      const avgDuration = completed.length
        ? Math.round(completed.reduce((s,v) => s + (v.visit_duration_minutes||0), 0) / completed.length) : 0;

      if (section === 'overview') {
        return { status: 'success', data: {
          total_visits              : enrichedVisits.length,
          completed_visits          : completed.length,
          started_visits            : started.length,
          cancelled_visits          : cancelled.length,
          today_visits              : todayV.length,
          this_week_visits          : weekV.length,
          this_month_visits         : monthV.length,
          avg_visit_duration_minutes: avgDuration,
        }};
      }

      if (section === 'areas') {
        const byArea = {};
        enrichedVisits.forEach(v => {
          const key  = v.client_area_tag_id || 0;
          const name = v.client_area_tag_name || 'غير محدد';
          if (!byArea[key]) byArea[key] = { client_area_tag_id: key, client_area_tag_name: name, total_visits: 0, completed_visits: 0, cancelled_visits: 0, uniqueClients: new Set(), durations: [] };
          byArea[key].total_visits++;
          if (v.visits_status === 'Completed') { byArea[key].completed_visits++; byArea[key].durations.push(v.visit_duration_minutes||0); }
          if (v.visits_status === 'Cancelled') byArea[key].cancelled_visits++;
          if (v.visits_client_id) byArea[key].uniqueClients.add(v.visits_client_id);
        });
        const areas = Object.values(byArea).map(a => ({
          client_area_tag_id    : a.client_area_tag_id,
          client_area_tag_name  : a.client_area_tag_name,
          total_visits          : a.total_visits,
          completed_visits      : a.completed_visits,
          cancelled_visits      : a.cancelled_visits,
          unique_clients_visited: a.uniqueClients.size,
          avg_visit_duration    : a.durations.length ? Math.round(a.durations.reduce((s,d)=>s+d,0)/a.durations.length) : 0,
        })).sort((a,b) => b.total_visits - a.total_visits);
        return { status: 'success', data: areas };
      }

      if (section === 'representatives') {
        const byRep = {};
        enrichedVisits.forEach(v => {
          const key = v.visits_representative_id;
          const u   = users.find(u => u.users_id === key);
          if (!byRep[key]) byRep[key] = { users_id: key, users_name: v.rep_name, users_email: u?.users_email||'', total_visits: 0, completed_visits: 0, today_visits: 0, uniqueClients: new Set(), orders_count: 0, total_sales: 0, durations: [] };
          byRep[key].total_visits++;
          if (v.visits_status === 'Completed') { byRep[key].completed_visits++; byRep[key].durations.push(v.visit_duration_minutes||0); }
          if ((v.visits_visit_date||'').toString().split('T')[0] === todayStr) byRep[key].today_visits++;
          if (v.visits_client_id) byRep[key].uniqueClients.add(v.visits_client_id);
          byRep[key].orders_count += v.orders_count || 0;
        });
        salesOrders.forEach(o => {
          if (byRep[o.sales_orders_representative_id]) byRep[o.sales_orders_representative_id].total_sales += o.sales_orders_total_amount || 0;
        });
        const reps = Object.values(byRep).map(r => ({
          users_id               : r.users_id,
          users_name             : r.users_name,
          users_email            : r.users_email,
          total_visits           : r.total_visits,
          completed_visits       : r.completed_visits,
          today_visits           : r.today_visits,
          unique_clients_visited : r.uniqueClients.size,
          orders_from_visits     : r.orders_count,
          total_sales_from_visits: parseFloat(r.total_sales.toFixed(2)),
          avg_visit_duration     : r.durations.length ? Math.round(r.durations.reduce((s,d)=>s+d,0)/r.durations.length) : 0,
        })).sort((a,b) => b.total_visits - a.total_visits);
        return { status: 'success', data: reps };
      }

      if (section === 'analytics') {
        const byDay = {};
        enrichedVisits.forEach(v => {
          const day = (v.visits_visit_date||'').toString().split('T')[0] || '2024-01-01';
          if (!byDay[day]) byDay[day] = { visit_date: day, total_visits: 0, completed_visits: 0, cancelled_visits: 0, durations: [] };
          byDay[day].total_visits++;
          if (v.visits_status === 'Completed') { byDay[day].completed_visits++; byDay[day].durations.push(v.visit_duration_minutes||0); }
          if (v.visits_status === 'Cancelled') byDay[day].cancelled_visits++;
        });
        const dailyAnalytics = Object.values(byDay).map(d => ({
          visit_date      : d.visit_date,
          total_visits    : d.total_visits,
          completed_visits: d.completed_visits,
          cancelled_visits: d.cancelled_visits,
          avg_duration    : d.durations.length ? Math.round(d.durations.reduce((s,x)=>s+x,0)/d.durations.length) : 0,
        })).sort((a,b) => a.visit_date.localeCompare(b.visit_date));

        const byHour = {};
        enrichedVisits.forEach(v => {
          const timeStr = (v.visits_start_time||'').split(' ')[1] || (v.visits_start_time||'').split('T')[1] || '';
          const hour = timeStr ? parseInt(timeStr.split(':')[0], 10) : (8 + (v.visits_id % 10));
          if (!byHour[hour]) byHour[hour] = { hour, total_visits: 0, completed_visits: 0 };
          byHour[hour].total_visits++;
          if (v.visits_status === 'Completed') byHour[hour].completed_visits++;
        });
        const hourlyAnalytics = Object.values(byHour).sort((a,b) => a.hour - b.hour);
        return { status: 'success', data: { daily_analytics: dailyAnalytics, hourly_analytics: hourlyAnalytics } };
      }

      if (section === 'performance') {
        const total        = enrichedVisits.length;
        const completedN   = completed.length;
        const cancelledN   = cancelled.length;
        const totalOrders  = salesOrders.length;
        const totalRevenue = salesOrders.reduce((s,o) => s + (o.sales_orders_total_amount||0), 0);
        const totalPmts    = clientPmts.length;
        const totalPmtAmt  = clientPmts.reduce((s,p) => s + (p.client_payments_amount||0), 0);
        return { status: 'success', data: {
          total_visits                    : total,
          completed_visits                : completedN,
          cancelled_visits                : cancelledN,
          completion_rate                 : total ? parseFloat(((completedN / total) * 100).toFixed(1)) : 0,
          cancellation_rate               : total ? parseFloat(((cancelledN / total) * 100).toFixed(1)) : 0,
          total_orders_from_visits        : Math.round(totalOrders * 0.6),
          total_revenue_from_visits       : parseFloat((totalRevenue * 0.6).toFixed(2)),
          total_payment_amount_from_visits: parseFloat((totalPmtAmt * 0.6).toFixed(2)),
          total_payments_from_visits      : Math.round(totalPmts * 0.6),
        }};
      }

      if (section === 'top_clients') {
        const byClient = {};
        enrichedVisits.forEach(v => {
          const key = v.visits_client_id;
          if (!byClient[key]) byClient[key] = {
            clients_id          : key,
            clients_company_name: v.clients_company_name,
            clients_city        : v.clients_city,
            client_area_tag_name: v.client_area_tag_name,
            total_visits        : 0,
            completed_visits    : 0,
            last_date           : '',
          };
          byClient[key].total_visits++;
          if (v.visits_status === 'Completed') byClient[key].completed_visits++;
          const vDate = (v.visits_visit_date||'').toString().split('T')[0] || '';
          if (vDate > byClient[key].last_date) byClient[key].last_date = vDate;
        });
        const clientRevMap = {};
        salesOrders.forEach(o => {
          if (!clientRevMap[o.sales_orders_client_id]) clientRevMap[o.sales_orders_client_id] = { orders: 0, revenue: 0 };
          clientRevMap[o.sales_orders_client_id].orders++;
          clientRevMap[o.sales_orders_client_id].revenue += o.sales_orders_total_amount || 0;
        });
        const topClients = Object.values(byClient).map(c => ({
          clients_id          : c.clients_id,
          clients_company_name: c.clients_company_name,
          clients_city        : c.clients_city,
          client_area_tag_name: c.client_area_tag_name,
          total_visits        : c.total_visits,
          completed_visits    : c.completed_visits,
          total_orders        : clientRevMap[c.clients_id]?.orders  || 0,
          total_revenue       : parseFloat((clientRevMap[c.clients_id]?.revenue || 0).toFixed(2)),
          last_visit_date     : c.last_date,
        })).sort((a,b) => b.total_visits - a.total_visits).slice(0, 50);
        return { status: 'success', data: topClients };
      }

      // fallback — return enriched list
      return { status: 'success', data: enrichedVisits };
    }

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

    // ─── Read endpoints: serve data from localStorage ───────────────────────
    const isRead = /get_all|get_detail|get_pending|get_returnable|get_item_return/.test(url);
    if (isRead) {
      const fd = formData instanceof FormData ? formData : { get: () => null };

      // ── Supplier Payment detail ─────────────────────────────────────────────
      if (url.includes('supplier_payments') && url.includes('get_detail')) {
        const pid  = parseInt(fd.get('id') || '0', 10);
        const arr  = readFromLocalStorage('appSupplierPayments', null);
        const list = Array.isArray(arr) ? arr : [];
        const pay  = list.find(p => p.supplier_payments_id === pid);
        return { status: 'success', data: pay || {} };
      }

      // ── Supplier Payments list ──────────────────────────────────────────────
      if (url.includes('supplier_payments')) {
        let list = readFromLocalStorage('appSupplierPayments', null);
        list = Array.isArray(list) ? list : [];
        const supplierId = fd.get('supplier_id');
        const safeId     = fd.get('safe_id');
        const search     = fd.get('search');
        const limit      = parseInt(fd.get('limit') || '50', 10);
        const offset     = parseInt(fd.get('offset') || '0', 10);
        if (supplierId) list = list.filter(p => String(p.supplier_payments_supplier_id) === supplierId);
        if (safeId)     list = list.filter(p => String(p.supplier_payments_safe_id) === safeId);
        if (search) {
          const t = search.toLowerCase();
          list = list.filter(p =>
            String(p.supplier_payments_id || '').includes(t) ||
            (p.supplier_payments_notes || '').toLowerCase().includes(t) ||
            (p.supplier_payments_reference_number || '').toLowerCase().includes(t)
          );
        }
        const total     = list.length;
        const paginated = list.slice(offset, offset + limit);
        return { status: 'success', message: 'تمت العملية بنجاح!', data: { supplier_payments: paginated, total_count: total } };
      }

      // ── Purchase Order detail ───────────────────────────────────────────────
      if (url.includes('purchase_orders') && url.includes('get_detail')) {
        const orderId = parseInt(fd.get('purchase_orders_id') || '0', 10);
        const orders  = readFromLocalStorage('appPurchaseOrders', null);
        const list    = Array.isArray(orders) ? orders : [];
        const order   = list.find(o => o.purchase_orders_id === orderId);
        if (order) {
          const allItems  = readFromLocalStorage('appPurchaseOrderItems', null);
          const items     = Array.isArray(allItems)
            ? allItems.filter(i => i.purchase_order_items_purchase_order_id === orderId)
            : [];
          return { status: 'success', data: { ...order, items } };
        }
        return { status: 'success', data: {} };
      }

      // ── Purchase Return detail ──────────────────────────────────────────────
      if (url.includes('purchase_returns') && url.includes('get_detail')) {
        const retId   = parseInt(fd.get('id') || '0', 10);
        const returns = readFromLocalStorage('appPurchaseReturns', null);
        const list    = Array.isArray(returns) ? returns : [];
        const ret     = list.find(r => r.purchase_returns_id === retId);
        if (ret) {
          const allItems = readFromLocalStorage('appPurchaseReturnItems', null);
          const items    = Array.isArray(allItems)
            ? allItems.filter(i => i.purchase_return_items_purchase_return_id === retId)
            : [];
          return { status: 'success', data: { ...ret, items } };
        }
        return { status: 'success', data: {} };
      }

      // ── Client Payment detail ───────────────────────────────────────────────
      if (url.includes('client_payments') && url.includes('get_detail')) {
        const pid  = parseInt(fd.get('client_payments_id') || '0', 10);
        const list = readArr('appClientPayments');
        const pay  = list.find(p => p.client_payments_id === pid);
        if (pay) {
          const clients = readArr('appClients');
          const methods = readArr('appPaymentMethods');
          const safes   = readArr('appSafes');
          const cl = clients.find(c => c.clients_id === pay.client_payments_client_id);
          const mt = methods.find(m => m.payment_methods_id === pay.client_payments_payment_method_id);
          const sf = safes.find(s => s.safes_id === pay.client_payments_safe_id);
          return { status: 'success', data: { ...pay,
            client_name: cl?.clients_company_name || `عميل #${pay.client_payments_client_id}`,
            clients_company_name: cl?.clients_company_name || `عميل #${pay.client_payments_client_id}`,
            payment_method_name: mt?.payment_methods_name || '',
            safe_name: sf?.safes_name || '',
            client_payments_date: pay.client_payments_payment_date,
          }};
        }
        return { status: 'success', data: {} };
      }

      // ── Client Payments list ────────────────────────────────────────────────
      if (url.includes('client_payments')) {
        const clients = readArr('appClients');
        const methods = readArr('appPaymentMethods');
        const safes   = readArr('appSafes');
        let list = readArr('appClientPayments');

        const clientId = fd.get('client_id');
        const safeId   = fd.get('safe_id');
        const methodId = fd.get('payment_method_id');
        const dateFrom = fd.get('date_from');
        const dateTo   = fd.get('date_to');
        const search   = fd.get('search');
        const limit    = parseInt(fd.get('limit')  || '50', 10);
        const offset   = parseInt(fd.get('offset') || '0',  10);

        if (clientId) list = list.filter(p => String(p.client_payments_client_id)          === clientId);
        if (safeId)   list = list.filter(p => String(p.client_payments_safe_id)             === safeId);
        if (methodId) list = list.filter(p => String(p.client_payments_payment_method_id)  === methodId);
        if (dateFrom) list = list.filter(p => (p.client_payments_payment_date||'') >= dateFrom);
        if (dateTo)   list = list.filter(p => (p.client_payments_payment_date||'') <= dateTo);
        if (search) {
          const t = search.toLowerCase();
          list = list.filter(p => {
            const cl = clients.find(c => c.clients_id === p.client_payments_client_id);
            return String(p.client_payments_id||'').includes(t)
                || (cl?.clients_company_name||'').toLowerCase().includes(t)
                || (p.client_payments_notes||'').toLowerCase().includes(t)
                || (p.client_payments_reference_number||'').toLowerCase().includes(t);
          });
        }
        list.sort((a,b) => b.client_payments_id - a.client_payments_id);
        const total     = list.length;
        const paginated = list.slice(offset, offset + limit).map(pay => {
          const cl = clients.find(c => c.clients_id === pay.client_payments_client_id);
          const mt = methods.find(m => m.payment_methods_id === pay.client_payments_payment_method_id);
          const sf = safes.find(s => s.safes_id === pay.client_payments_safe_id);
          return { ...pay,
            client_name: cl?.clients_company_name || `عميل #${pay.client_payments_client_id}`,
            clients_company_name: cl?.clients_company_name || `عميل #${pay.client_payments_client_id}`,
            payment_method_name: mt?.payment_methods_name || '',
            safe_name: sf?.safes_name || '',
            client_payments_date: pay.client_payments_payment_date,
          };
        });
        return { status: 'success', message: 'تمت العملية بنجاح!', data: { client_payments: paginated, total_count: total } };
      }

      // ── Client Cash (combined payments + returns) ────────────────────────────
      if (url.includes('client_cash')) {
        const clients = readArr('appClients');
        const methods = readArr('appPaymentMethods');
        const safes   = readArr('appSafes');
        const orders  = readArr('appSalesOrders');
        const payments = readArr('appClientPayments');
        const refunds  = readArr('appSalesReturns');

        const typeFilter = fd.get('type');
        const clientId   = fd.get('client_id');
        const safeId     = fd.get('safe_id');
        const methodId   = fd.get('payment_method_id');
        const dateFrom   = fd.get('from_date');
        const dateTo     = fd.get('to_date');
        const search     = fd.get('search');
        const page       = parseInt(fd.get('page')  || '1',  10);
        const limit      = parseInt(fd.get('limit') || '10', 10);

        const enrichPay = (p) => {
          const cl = clients.find(c => c.clients_id === p.client_payments_client_id);
          const mt = methods.find(m => m.payment_methods_id === p.client_payments_payment_method_id);
          const sf = safes.find(s => s.safes_id === p.client_payments_safe_id);
          return { ...p,
            movement_type: 'payment', movement_id: `pay-${p.client_payments_id}`,
            movement_date: p.client_payments_payment_date, movement_amount: p.client_payments_amount,
            sort_datetime: p.client_payments_payment_date,
            client_name: cl?.clients_company_name||`عميل #${p.client_payments_client_id}`,
            clients_company_name: cl?.clients_company_name||`عميل #${p.client_payments_client_id}`,
            payment_method_name: mt?.payment_methods_name||'', safe_name: sf?.safes_name||'',
          };
        };
        const enrichRef = (r) => {
          const ord = orders.find(o => o.sales_orders_id === r.sales_returns_sales_order_id);
          const cid = r.sales_returns_client_id || ord?.sales_orders_client_id;
          const cl  = clients.find(c => c.clients_id === cid);
          return { ...r,
            movement_type: 'refund', movement_id: `ref-${r.sales_returns_id}`,
            movement_date: r.sales_returns_return_date, movement_amount: r.sales_returns_total_amount,
            sort_datetime: r.sales_returns_return_date,
            client_name: cl?.clients_company_name||`عميل #${cid}`,
            clients_company_name: cl?.clients_company_name||`عميل #${cid}`,
            client_refunds_date: r.sales_returns_return_date,
            client_refunds_amount: r.sales_returns_total_amount,
            client_refunds_id: r.sales_returns_id,
          };
        };

        let all = [];
        if (!typeFilter || typeFilter === 'all' || typeFilter === 'payment') all.push(...payments.map(enrichPay));
        if (!typeFilter || typeFilter === 'all' || typeFilter === 'refund')  all.push(...refunds.map(enrichRef));

        if (clientId) all = all.filter(m => String(m.client_payments_client_id||m.sales_returns_client_id||(orders.find(o=>o.sales_orders_id===m.sales_returns_sales_order_id)?.sales_orders_client_id)||'') === clientId);
        if (safeId)   all = all.filter(m => String(m.client_payments_safe_id||'') === safeId);
        if (methodId) all = all.filter(m => String(m.client_payments_payment_method_id||'') === methodId);
        if (dateFrom) all = all.filter(m => (m.movement_date||'') >= dateFrom);
        if (dateTo)   all = all.filter(m => (m.movement_date||'') <= dateTo);
        if (search) {
          const t = search.toLowerCase();
          all = all.filter(m => (m.client_name||'').toLowerCase().includes(t)
                              ||(m.client_payments_notes||'').toLowerCase().includes(t)
                              ||String(m.movement_id||'').includes(t));
        }
        all.sort((a,b) => new Date(b.sort_datetime||0) - new Date(a.sort_datetime||0));

        const totalCount = all.length;
        const offset     = (page - 1) * limit;
        const paginated  = all.slice(offset, offset + limit);
        const paymentsAmtTotal = payments.reduce((s,p)=>s+Number(p.client_payments_amount||0),0);
        const refundsAmtTotal  = refunds.reduce((s,r)=>s+Number(r.sales_returns_total_amount||0),0);

        return { status: 'success', message: 'تمت العملية بنجاح!', data: {
          movements: paginated,
          totals: { payments_total: payments.length, refunds_total: refunds.length, overall_total: payments.length+refunds.length, payments_amount_total: paymentsAmtTotal, refunds_amount_total: refundsAmtTotal },
          pagination: { total_count: totalCount, total_pages: Math.max(1,Math.ceil(totalCount/limit)), page, limit },
        }};
      }
    }
    // ─── Write / other endpoints: return success ─────────────────────────────
    const data = {};
    if (formData instanceof FormData) {
      for (const [k, v] of formData.entries()) data[k] = v;
    }
    return { status: 'success', message: 'تمت العملية بنجاح!', data };
  },
};

export function setGlobalAuthContext() {}
export function clearGlobalAuthContext() {}
