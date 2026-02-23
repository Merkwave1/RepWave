import React from "react";
import Loader from "../Loader/Loader";
import Alert from "../Alert/Alert";
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

/* =========================================================
   Helpers
========================================================= */

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

const alignMap = {
  right: "text-right",
  left: "text-left",
  center: "text-center",
};

const defaultEmptyState = {
  icon: "📂",
  title: "لا توجد بيانات لعرضها",
  description: "جرب تغيير الفلاتر أو أعد المحاولة لاحقًا",
};

/* =========================================================
   Sort Indicator
========================================================= */

function SortIndicator({ active, direction }) {
  if (!active) {
    return (
      <div className="flex flex-col items-center text-[#1F2937]">
        <ChevronUpIcon className="h-4 w-4" />
        <ChevronDownIcon className="h-4 w-4 -mt-1" />
      </div>
    );
  }

  return direction === "asc" ? (
    <ChevronUpIcon className="h-5 w-5 text-[#8DD8F5]" />
  ) : (
    <ChevronDownIcon className="h-5 w-5 text-[#8DD8F5]" />
  );
}

/* =========================================================
   Component
========================================================= */

export default function GlobalTable({
  data = [],
  loading = false,
  error = null,
  columns = [],
  rowKey = "id",
  renderRow,
  totalCount = null,
  searchTerm = "",
  onSort = null,
  emptyState,
  initialSort = null,
  showSummary = false,
  showColumnTotals = false,
  columnTotalsLabel = "الإجمالي",
  totalsColumns = null,
}) {
  const resolvedEmptyState = { ...defaultEmptyState, ...emptyState };

  /* =========================================================
     Sorting
  ========================================================= */

  const [sortConfig, setSortConfig] = React.useState(() => {
    if (initialSort?.key)
      return {
        key: initialSort.key,
        direction: initialSort.direction ?? "asc",
      };

    return { key: null, direction: "asc" };
  });

  const normalizedColumns = React.useMemo(
    () => (Array.isArray(columns) ? columns : []),
    [columns]
  );

  const displayedData = React.useMemo(() => {
    if (!sortConfig.key || typeof onSort === "function") return data;

    const sorted = [...data].sort((a, b) => {
      const aVal = a?.[sortConfig.key];
      const bVal = b?.[sortConfig.key];

      const aNum = Number(aVal);
      const bNum = Number(bVal);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === "asc"
          ? aNum - bNum
          : bNum - aNum;
      }

      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal), "ar")
        : String(bVal).localeCompare(String(aVal), "ar");
    });

    return sorted;
  }, [data, sortConfig, onSort]);

  /* =========================================================
     Column Totals
  ========================================================= */

  const columnTotals = React.useMemo(() => {
    if (!showColumnTotals) return {};

    const totals = {};

    normalizedColumns.forEach((col) => {
      if (!col.key) return;
      if (totalsColumns && !totalsColumns.includes(col.key)) return;

      let sum = 0;
      let hasNumbers = false;

      displayedData.forEach((item) => {
        const v = parseFloat(item?.[col.key]);
        if (!isNaN(v)) {
          sum += v;
          hasNumbers = true;
        }
      });

      if (hasNumbers) totals[col.key] = sum;
    });

    return totals;
  }, [displayedData, normalizedColumns, totalsColumns, showColumnTotals]);

  /* =========================================================
     Sort Click
  ========================================================= */

  const handleHeaderClick = (col) => {
    if (!col.sortable) return;

    setSortConfig((prev) => {
      const next =
        prev.key === col.key && prev.direction === "asc"
          ? "desc"
          : "asc";

      onSort?.(col.key, next);

      return { key: col.key, direction: next };
    });
  };

  /* =========================================================
     Header
  ========================================================= */

  const renderHeader = () => (
    <thead className="bg-white sticky top-0 z-10 border-b border-gray-200">
      <tr className="relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#8DD8F5]/40">
        {normalizedColumns.map((col, i) => {
          const isActive = sortConfig.key === col.key;

          return (
            <th
              key={i}
              onClick={() => handleHeaderClick(col)}
              className={joinClasses(
                "px-6 py-4 text-xs font-semibold text-[#1F2937] whitespace-nowrap",
                alignMap[col.align],
                col.sortable && "cursor-pointer"
              )}
            >
              {col.sortable ? (
                <div className="flex items-center justify-between gap-2">
                  {col.title}
                  <SortIndicator
                    active={isActive}
                    direction={sortConfig.direction}
                  />
                </div>
              ) : (
                col.title
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );

  /* =========================================================
     Body
  ========================================================= */

  const renderBody = () => (
    <tbody>
      {displayedData.map((item, index) => {
        const key = item?.[rowKey] ?? index;

        const rowClasses = joinClasses(
          "group transition-all duration-150",
          index % 2 === 0 ? "bg-white" : "bg-gray-50/30",
          "hover:bg-[#8DD8F5]/10 hover:shadow-[inset_4px_0_0_#8DD8F5]"
        );

        const cells =
          typeof renderRow === "function"
            ? renderRow(item, index)
            : normalizedColumns.map((col, ci) => (
                <td
                  key={ci}
                  className={joinClasses(
                    "px-6 py-4 text-sm text-gray-700 border-b border-gray-100 whitespace-nowrap",
                    alignMap[col.align]
                  )}
                >
                  {col.render
                    ? col.render(item, index)
                    : item?.[col.key] ?? "—"}
                </td>
              ));

        return <tr key={key} className={rowClasses}>{cells}</tr>;
      })}
    </tbody>
  );

  /* =========================================================
     Footer
  ========================================================= */

  const renderFooter = () => {
    if (!showColumnTotals || !Object.keys(columnTotals).length)
      return null;

    return (
      <tfoot className="bg-gray-50/70 border-t border-gray-200">
        <tr>
          {normalizedColumns.map((col, i) => (
            <td
              key={i}
              className="px-6 py-3 text-sm font-bold text-[#1F2937]"
            >
              {columnTotals[col.key]
                ? columnTotals[col.key].toLocaleString("ar-SA")
                : i === 0
                ? `Σ ${columnTotalsLabel}`
                : "—"}
            </td>
          ))}
        </tr>
      </tfoot>
    );
  };

  /* =========================================================
     Render
  ========================================================= */

  const summaryVisible =
    showSummary && (totalCount !== null || searchTerm);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
      {summaryVisible && (
        <div className="px-5 py-3 border-b border-gray-100 text-sm text-gray-700 flex justify-between">
          <div>
            إجمالي العناصر:
            <span className="font-bold text-[#1F2937] mr-2">
              {totalCount ?? data.length}
            </span>
          </div>

          {searchTerm && (
            <div className="text-gray-500">
              نتائج البحث:{" "}
              <span className="font-medium text-[#1F2937]">
                {searchTerm}
              </span>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="py-14 flex justify-center">
          <Loader />
        </div>
      ) : error ? (
        <div className="p-6">
          <Alert message={error} type="error" />
        </div>
      ) : displayedData.length === 0 ? (
        <div className="py-14 text-center">
          <div className="text-4xl mb-4 text-blue-300">
            {resolvedEmptyState.icon}
          </div>
          <p className="font-semibold text-gray-700">
            {resolvedEmptyState.title}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {resolvedEmptyState.description}
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
          <div className="min-w-[900px]">
            <table className="w-full border-separate border-spacing-0 text-sm">
              {renderHeader()}
              {renderBody()}
              {renderFooter()}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}