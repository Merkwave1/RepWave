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

    // preload fake app data
    preloadMockData();

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
// MOCK DATA GENERATOR
// --------------------

function preloadMockData() {
  localStorage.setItem("appUsers", JSON.stringify([
    { id: 1, name: "Admin", role: "admin" },
    { id: 2, name: "Sales", role: "user" }
  ]));

  localStorage.setItem("appCategories", JSON.stringify([
    { id: 1, name: "Chemicals" },
    { id: 2, name: "Packaging" }
  ]));

  localStorage.setItem("appClients", JSON.stringify([
    { id: 1, name: "Client A" },
    { id: 2, name: "Client B" }
  ]));

  localStorage.setItem("appProducts", JSON.stringify({
    data: [
      { id: 1, name: "Product One", price: 50 },
      { id: 2, name: "Product Two", price: 80 }
    ]
  }));

  localStorage.setItem("appWarehouses", JSON.stringify({
    data: [
      { id: 1, name: "Main Warehouse" }
    ]
  }));

  localStorage.setItem("appInventory", JSON.stringify([
    { product: "Product One", qty: 100 },
    { product: "Product Two", qty: 200 }
  ]));

  localStorage.setItem("appSalesOrders", JSON.stringify([]));
  localStorage.setItem("appPurchaseOrders", JSON.stringify([]));
  localStorage.setItem("appNotifications", JSON.stringify([]));
}

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
  return getMock("appInventory", []);
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
// EMPTY SAFE FALLBACKS
// (so nothing crashes)
// --------------------

export async function getAppSettings() { return []; }
export async function getAppSettingsCategorized() { return {}; }
export async function getAppClientAreaTags() { return []; }
export async function getAppClientIndustries() { return []; }
export async function getAppClientTypes() { return []; }
export async function getAppCountriesWithGovernorates() { return []; }
export async function getAppProductAttributes() { return []; }
export async function getAppBaseUnits() { return { data: [] }; }
export async function getAppPackagingTypes() { return { data: [] }; }
export async function getAppSuppliers() { return { data: [] }; }
export async function getAppPurchaseReturns() { return []; }
export async function getAppVisitPlans() { return []; }
export async function getAppSalesReturns() { return []; }
export async function getAppDeliverableSalesOrders() { return []; }
export async function getAppPaymentMethods() { return []; }
export async function getAppSafes() { return []; }
export async function getAppGoodsReceipts() { return { data: [] }; }

export function invalidateInventoryCache() {}
export function invalidateInventoryRelatedCaches() {}
export async function getAppPendingPurchaseOrdersForReceive() {
  return [];
}

