// src/apis/dashboard.js
import { apiClient } from '../utils/apiClient.js';
import { getCompanyName, getUserUUID } from '../apis/auth.js';

const API_BASE_URL = import.meta.env.VITE_API_LOGIN_BASE_URL;

function buildApiUrl(endpoint) {
  const companyName = getCompanyName();
  if (!companyName) throw new Error('Company name not found in localStorage. Please log in.');
  if (!API_BASE_URL) throw new Error('VITE_API_LOGIN_BASE_URL is not defined.');
  return `${API_BASE_URL}${companyName}/${endpoint}`;
}

/**
 * Get comprehensive dashboard statistics and data (NEW)
 */
export const getComprehensiveDashboardData = async () => {
  return {
    meta: { generated_at: new Date().toISOString() },

    sales: {
      invoiced_30d_count: 45,
      invoiced_30d_value: 185000,
      invoiced_7d_count: 12,
      invoiced_7d_value: 52000,
      invoiced_today_count: 3,
      invoiced_today_value: 11000
    },

    purchases: {
      active_30d_count: 18,
      active_30d_value: 97000,
      active_7d_count: 6,
      active_7d_value: 24000,
      active_today_count: 2,
      active_today_value: 8000
    },

    financial: {
      income_30d: 185000,
      expenses_30d: 73000,
      income_7d: 52000,
      expenses_7d: 21000
    },

    returns: {
      returns_30d_count: 5,
      returns_30d_value: 9000,
      returns_7d_count: 2,
      returns_7d_value: 3500,
      returns_today_count: 1,
      returns_today_value: 1200
    },

    clients: {
      new_clients_30d: 14,
      new_clients_7d: 4,
      total_active_clients: 126,
      total_clients_balance: 340000
    },

    suppliers: {
      total_balance: 215000
    },

    top_selling_products: [
      {
        variant_name: "Acetone 1L",
        products_name: "Acetone",
        total_quantity: 520,
        total_revenue: 26000,
        order_count: 38
      },
      {
        variant_name: "Methanol 500ml",
        products_name: "Methanol",
        total_quantity: 340,
        total_revenue: 17000,
        order_count: 24
      }
    ],

    top_returned_products: [
      {
        variant_name: "Safety Gloves XL",
        products_name: "Safety Gloves",
        total_returned_quantity: 40,
        total_returned_value: 2000,
        return_count: 6
      }
    ],

    low_stock_products: [
      {
        variant_name: "Sulfuric Acid 2L",
        products_name: "Sulfuric Acid",
        total_stock: 8,
        warehouse_name: "Main Warehouse"
      }
    ],

    recent_visits: [
      {
        visits_id: 1,
        client_company_name: "Alpha Trading",
        visits_start_time: new Date().toISOString(),
        visits_status: "completed",
        visits_purpose: "تحصيل دفعة",
        representative_name: "Ahmed Ali"
      }
    ],

    monthly_comparison: {
      current_month_sales: 185000,
      current_month_orders: 45,
      previous_month_sales: 150000,
      previous_month_orders: 38
    },

    user_performance: [
      {
        users_id: 1,
        users_name: "Ahmed Ali",
        users_role: "Sales",
        orders_handled: 22,
        total_sales_value: 98000,
        visits_conducted: 15
      },
      {
        users_id: 2,
        users_name: "Mohamed Samy",
        users_role: "Sales",
        orders_handled: 18,
        total_sales_value: 72000,
        visits_conducted: 11
      }
    ]
  };
};


/**
 * Get dashboard statistics and data (LEGACY - for backward compatibility)
 */
export const getDashboardData = async () => {
  const users_uuid = getUserUUID();
  if (!users_uuid) throw new Error('User UUID is required. Please log in.');

  const url = buildApiUrl(`reports/dashboard.php?users_uuid=${users_uuid}`);

  try {
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};
