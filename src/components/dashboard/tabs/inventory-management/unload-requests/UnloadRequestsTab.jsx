// src/components/dashboard/tabs/inventory-management/unload-requests/UnloadRequestsTab.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  EyeIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import Loader from '../../../../common/Loader/Loader';
import Alert from '../../../../common/Alert/Alert';

const STATUS_COLORS = {
  Pending:  'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected:  'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  Pending:  'قيد الانتظار',
  Approved: 'تمت الموافقة',
  Rejected:  'مرفوض',
};

function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  const label = STATUS_LABELS[status] || status;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}

function DetailsModal({ request, warehouses, onClose }) {
  if (!request) return null;
  const srcWh = warehouses.find(w => w.warehouse_id === request.request_source_warehouse_id);
  const dstWh = warehouses.find(w => w.warehouse_id === request.request_destination_warehouse_id);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ArrowUpTrayIcon className="h-5 w-5 text-blue-500" />
            تفاصيل طلب التفريغ #{request.request_id}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div><span className="text-gray-500 block">المخزن المصدر</span><span className="font-medium text-gray-800">{srcWh?.warehouse_name || '–'}</span></div>
          <div><span className="text-gray-500 block">المخزن الوجهة</span><span className="font-medium text-gray-800">{dstWh?.warehouse_name || '–'}</span></div>
          <div><span className="text-gray-500 block">طلب بواسطة</span><span className="font-medium text-gray-800">{request.created_by_name || '–'}</span></div>
          <div><span className="text-gray-500 block">التاريخ</span><span className="font-medium text-gray-800">{request.created_at || '–'}</span></div>
          <div><span className="text-gray-500 block">الحالة</span><StatusBadge status={request.request_status} /></div>
          {request.request_notes && (
            <div className="col-span-2"><span className="text-gray-500 block">الملاحظات</span><span className="font-medium text-gray-800">{request.request_notes}</span></div>
          )}
        </div>
        {Array.isArray(request.items) && request.items.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 border-b pb-1">المنتجات</h4>
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-xs text-gray-600"><th className="text-right px-3 py-2">المنتج</th><th className="text-center px-3 py-2">الكمية</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {request.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-800">{item.variant_name || `صنف ${item.variant_id}`}</td>
                    <td className="px-3 py-2 text-center font-medium">{item.requested_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">إغلاق</button>
        </div>
      </div>
    </div>
  );
}

function UnloadRequestsTab() {
  useOutletContext();
  const [requests, setRequests] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const rawWarehouses = localStorage.getItem('appWarehouses');
      const warehousesData = rawWarehouses ? JSON.parse(rawWarehouses) : { data: [] };
      const allWarehouses = Array.isArray(warehousesData) ? warehousesData : (warehousesData?.data || []);
      setWarehouses(allWarehouses);

      const vanIds = new Set(
        allWarehouses
          .filter(w => w.warehouse_type === 'Van' || (w.warehouse_name && w.warehouse_name.includes('سيارة')))
          .map(w => w.warehouse_id)
      );

      const rawRequests = localStorage.getItem('appTransferRequests');
      const allRequests = rawRequests ? JSON.parse(rawRequests) : [];
      const unload = Array.isArray(allRequests)
        ? allRequests.filter(r => r.request_type === 'Unload' || vanIds.has(r.request_source_warehouse_id))
        : [];
      setRequests(unload);
    } catch (err) {
      console.error('UnloadRequestsTab error:', err);
      setError('فشل في تحميل طلبات التفريغ');
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    let result = requests;
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(r =>
        String(r.request_id).includes(term) ||
        (r.created_by_name || '').toLowerCase().includes(term) ||
        (r.request_notes || '').toLowerCase().includes(term) ||
        (warehouses.find(w => w.warehouse_id === r.request_source_warehouse_id)?.warehouse_name || '').toLowerCase().includes(term)
      );
    }
    if (statusFilter) result = result.filter(r => r.request_status === statusFilter);
    return result;
  }, [requests, searchTerm, statusFilter, warehouses]);

  if (loading) return <Loader />;

  return (
    <div className="p-4" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <ArrowUpTrayIcon className="h-7 w-7 text-blue-500" />
        <h3 className="text-2xl font-bold text-gray-800">طلبات التفريغ</h3>
        <span className="bg-blue-100 text-blue-700 text-sm font-medium px-2.5 py-0.5 rounded-full">{requests.length}</span>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="بحث بالرقم أو الاسم أو المخزن..."
            className="w-full pr-9 pl-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 -translate-y-1/2">
              <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="">جميع الحالات</option>
          <option value="Pending">قيد الانتظار</option>
          <option value="Approved">تمت الموافقة</option>
          <option value="Rejected">مرفوض</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4 text-gray-300">📦</div>
          <p className="text-gray-700 text-lg font-semibold">لا توجد طلبات تفريغ</p>
          <p className="text-gray-500 text-sm mt-1">لم يتم العثور على طلبات تطابق معايير البحث.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['#', 'المخزن المصدر', 'المخزن الوجهة', 'طلب بواسطة', 'التاريخ', 'الحالة', 'الأصناف', 'الإجراءات'].map(h => (
                    <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map(req => {
                  const srcWh = warehouses.find(w => w.warehouse_id === req.request_source_warehouse_id);
                  const dstWh = warehouses.find(w => w.warehouse_id === req.request_destination_warehouse_id);
                  return (
                    <tr key={req.request_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{req.request_id}</td>
                      <td className="px-4 py-3 text-gray-700">{srcWh?.warehouse_name || '–'}</td>
                      <td className="px-4 py-3 text-gray-700">{dstWh?.warehouse_name || '–'}</td>
                      <td className="px-4 py-3 text-gray-700">{req.created_by_name || '–'}</td>
                      <td className="px-4 py-3 text-gray-500">{req.created_at || '–'}</td>
                      <td className="px-4 py-3"><StatusBadge status={req.request_status} /></td>
                      <td className="px-4 py-3 text-center text-gray-700">{Array.isArray(req.items) ? req.items.length : 0}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          <EyeIcon className="h-4 w-4" /> عرض
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-500 text-right">
            إجمالي النتائج: {filtered.length} من {requests.length}
          </div>
        </div>
      )}

      {selectedRequest && (
        <DetailsModal request={selectedRequest} warehouses={warehouses} onClose={() => setSelectedRequest(null)} />
      )}
    </div>
  );
}

export default UnloadRequestsTab;