// src/apis/auth.js
// FULL MOCK VERSION — NO BACKEND REQUIRED

// --------------------
// AUTH CORE
// --------------------

export function logout() {
  localStorage.clear();
  window.location.href = "/login";
}

export async function loginUser(loginUrl, email, password, companyName) {
  // fake delay
  await new Promise((res) => setTimeout(res, 500));

  const mockUser = {
    users_uuid: "mock-uuid-001",
    users_email: "admin@test.com",
    users_role: "admin",
    name: "Demo Admin",
  };

  if (email === "admin@test.com" && password === "123456") {
    localStorage.setItem("userData", JSON.stringify(mockUser));
    localStorage.setItem("companyName", companyName || "demo");

    // Mock data is already initialized in main.jsx

    return {
      status: "success",
      data: mockUser,
      message: "تم تسجيل الدخول بنجاح",
    };
  }

  return {
    status: "error",
    message: "بيانات الدخول غير صحيحة",
  };
}

export function isAuthenticated() {
  return !!localStorage.getItem("userData");
}

export function getCompanyName() {
  return localStorage.getItem("companyName");
}

export function getUserData() {
  return JSON.parse(localStorage.getItem("userData") || "null");
}

export function getUserRole() {
  return getUserData()?.users_role || null;
}

export function isAdmin() {
  return getUserRole() === "admin";
}

export function isAuthenticatedAdmin() {
  return isAuthenticated() && isAdmin();
}

export function getUserUUID() {
  return getUserData()?.users_uuid || null;
}

// --------------------
// --------------------
// GENERIC MOCK FETCHER
// --------------------

function getMock(key, fallback) {
  const cached = localStorage.getItem(key);
  return cached ? JSON.parse(cached) : fallback;
}

// --------------------
// MOCK APP LOADERS (same API as before)
// --------------------

export async function getAppUsers() {
  return getMock("appUsers", []);
}

export async function getAppCategories() {
  return getMock("appCategories", []);
}

export async function getAppClients() {
  return getMock("appClients", []);
}

export async function getAppProducts() {
  return getMock("appProducts", { data: [] });
}

export async function getAppWarehouses() {
  return getMock("appWarehouses", { data: [] });
}

export async function getAppInventory() {
  const raw = getMock('appInventory', []);
  const items = Array.isArray(raw) ? raw : [];
  // Normalize inventory_* prefixed fields to the short names InventoryTab enrichment expects
  try {
    const variantsRaw = localStorage.getItem('appProductVariants');
    const variants = variantsRaw ? JSON.parse(variantsRaw) : [];
    return items.map(item => {
      const variantId = item.inventory_variant_id ?? item.variant_id;
      const variant = variants.find(v => v.product_variants_id === variantId);
      return {
        ...item,
        // Alias fields expected by InventoryTab's enrichedInventory useMemo
        variant_id: variantId,
        warehouse_id: item.inventory_warehouse_id ?? item.warehouse_id,
        packaging_type_id: item.inventory_packaging_type_id ?? item.packaging_type_id,
        products_id: variant?.product_variants_product_id ?? item.products_id,
      };
    });
  } catch {
    return items;
  }
}

export async function getAppSalesOrders() {
  return getMock("appSalesOrders", []);
}

export async function getAppPurchaseOrders() {
  return getMock("appPurchaseOrders", []);
}

export async function getAppNotifications() {
  return getMock("appNotifications", []);
}

// --------------------
// MOCK DATA LOADERS (Extended)
// --------------------

export async function getAppSettings() { return getMock("appSettings", []); }
export async function getAppSettingsCategorized() { 
  const settings = getMock("appSettings", []);
  const categorized = {};
  settings.forEach(s => {
    if (!categorized[s.settings_category]) {
      categorized[s.settings_category] = [];
    }
    categorized[s.settings_category].push(s);
  });
  return categorized;
}
export async function getAppClientAreaTags() { return getMock("appClientAreaTags", []); }
export async function getAppClientIndustries() { return getMock("appClientIndustries", []); }
export async function getAppClientTypes() { return getMock("appClientTypes", []); }
export async function getAppCountriesWithGovernorates() { return getMock("appCountriesWithGovernorates", []); }
export async function getAppProductAttributes() { return getMock("appProductAttributes", []); }
export async function getAppBaseUnits() { return getMock("appBaseUnits", { data: [] }); }
export async function getAppPackagingTypes() { return getMock("appPackagingTypes", { data: [] }); }
export async function getAppSuppliers() { return getMock("appSuppliers", { data: [] }); }
export async function getAppPurchaseReturns() { return getMock("appPurchaseReturns", []); }
export async function getAppVisitPlans() { return getMock("appVisitPlans", []); }
export async function getAppSalesReturns() { return getMock("appSalesReturns", []); }
export async function getAppDeliverableSalesOrders() {
  const orders = getMock('appDeliverableSalesOrders', []);
  if (Array.isArray(orders) && orders.length > 0) return orders;
  // Fallback: filter confirmed salesOrders from appSalesOrders
  const allOrders = getMock('appSalesOrders', []);
  return Array.isArray(allOrders)
    ? allOrders.filter(o => o.sales_orders_status === 'مؤكد' && o.sales_orders_delivery_status !== 'تم التسليم')
    : [];
}
export async function getAppPaymentMethods() { return getMock("appPaymentMethods", []); }
export async function getAppSafes() { return getMock("appSafes", []); }
export async function getAppGoodsReceipts() { return getMock("appGoodsReceipts", { data: [] }); }

export function invalidateInventoryCache() {}
export function invalidateInventoryRelatedCaches() {}
export async function getAppPendingPurchaseOrdersForReceive() {
  const enriched = getMock('appPendingPurchaseOrdersForReceive', []);
  if (Array.isArray(enriched) && enriched.length > 0) return enriched;
  // Fallback: filter pending purchase orders
  const allOrders = getMock('appPurchaseOrders', []);
  return Array.isArray(allOrders)
    ? allOrders.filter(o => o.purchase_orders_status === 'مطلوب')
    : [];
}

