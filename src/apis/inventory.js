// src/apis/inventory.js
import { apiClient } from '../utils/apiClient.js';
import { getCompanyName } from '../apis/auth.js';

function buildApiUrl(endpoint) {
  const companyName = getCompanyName();
  if (!companyName) throw new Error('Company name not found in localStorage. Please log in.');
  const API_BASE_URL = import.meta.env.VITE_API_LOGIN_BASE_URL;
  if (!API_BASE_URL) throw new Error('VITE_API_LOGIN_BASE_URL is not defined.');
  return `${API_BASE_URL}${companyName}/${endpoint}`;}

export const getAllInventory = async (filters = {}) => {
  try {
    const raw = localStorage.getItem('appInventory');
    const all = raw ? JSON.parse(raw) : [];
    const items = Array.isArray(all) ? all : [];
    // Add normalized alias fields so UI components using warehouse_id / packaging_type_id work
    const variantsRaw = localStorage.getItem('appProductVariants');
    const variants = variantsRaw ? JSON.parse(variantsRaw) : [];
    const normalized = items.map(item => {
      const variantId = item.inventory_variant_id ?? item.variant_id;
      const variant = variants.find(v => v.product_variants_id === variantId);
      return {
        ...item,
        variant_id: variantId,
        warehouse_id: item.inventory_warehouse_id ?? item.warehouse_id,
        packaging_type_id: item.inventory_packaging_type_id ?? item.packaging_type_id,
        products_id: variant?.product_variants_product_id ?? item.products_id,
      };
    });
    return { data: normalized, success: true };
  } catch {
    return { data: [], success: true };
  }
};

export const addInventory = async (inventoryData) => {
  const url = buildApiUrl("inventory/add.php");
  const formData = new FormData();
  formData.append('warehouse_id', inventoryData.warehouse_id);
  formData.append('quantity', inventoryData.inventory_quantity);
  formData.append('inventory_status', inventoryData.inventory_status);
  formData.append('variant_id', inventoryData.variant_id);
  formData.append('packaging_type_id', inventoryData.packaging_type_id);

  const response = await apiClient.postFormData(url, formData);
  if (response.status === "success") {
    return response.message;
  } else {
    throw new Error(response.message || "Failed to add inventory item.");
  }
};

export const updateInventory = async (inventoryId, inventoryData) => {
  const url = buildApiUrl("inventory/update.php");
  const formData = new FormData();
  formData.append('inventory_id', inventoryId);
  formData.append('warehouse_id', inventoryData.warehouse_id);
  formData.append('quantity', inventoryData.inventory_quantity);
  formData.append('inventory_status', inventoryData.inventory_status);
  formData.append('variant_id', inventoryData.variant_id);
  formData.append('packaging_type_id', inventoryData.packaging_type_id);
  // Optional: allow updating production date if provided
  if (inventoryData.inventory_production_date !== undefined && inventoryData.inventory_production_date !== null) {
    formData.append('inventory_production_date', inventoryData.inventory_production_date);
  }

  const response = await apiClient.postFormData(url, formData);
  if (response.status === "success") {
    return response.message;
  } else {
    throw new Error(response.message || "Failed to update inventory item.");
  }
};

/**
 * Mark an inventory row as Removed and set its production date to a sentinel value.
 * This avoids hard deletes that can violate foreign key constraints.
 * Assumption: backend `inventory/update.php` accepts `inventory_id`, `inventory_status`, and `inventory_production_date`.
 */
export const markInventoryRemoved = async (inventoryId) => {
  const url = buildApiUrl("inventory/update.php");
  const formData = new FormData();
  formData.append('inventory_id', inventoryId);
  formData.append('inventory_status', 'Removed');
  // Use MySQL zero date string as requested by the user
  formData.append('inventory_production_date', '0000-00-00');

  const response = await apiClient.postFormData(url, formData);
  if (response.status === "success") {
    return response.message;
  } else {
    throw new Error(response.message || "Failed to mark inventory as removed.");
  }
};

export const deleteInventory = async (inventoryId) => {
  const url = buildApiUrl("inventory/delete.php");
  const formData = new FormData();
  formData.append('inventory_id', inventoryId);
  const response = await apiClient.postFormData(url, formData);
  if (response.status === "success") {
    return response.message;
  } else {
    throw new Error(response.message || "Failed to delete inventory item.");
  }
};


export const repackInventory = async (repackData) => {
  const url = buildApiUrl("inventory/repack.php");
  const formData = new FormData();
  formData.append('inventory_id', repackData.inventory_id);
  formData.append('to_packaging_type_id', repackData.to_packaging_type_id);
  formData.append('quantity_to_convert', repackData.quantity_to_convert); // Ensure this is a whole number

  const response = await apiClient.postFormData(url, formData);
  if (response.status === "success") {
    return response.message;
  } else {
    throw new Error(response.message || "Failed to repack inventory item.");
  }
};
