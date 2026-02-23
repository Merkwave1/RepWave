import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";

const MonthlyComparisonBar = ({ data }) => {
  const chartData = [
    {
      month: "الشهر الحالي",
      orders: data.currentOrders,
      sales: data.currentSales,
    },
    {
      month: "الشهر السابق",
      orders: data.previousOrders,
      sales: data.previousSales,
    },
  ];

  return (
    <div className="w-full h-[480px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barGap={12} barCategoryGap="40%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <XAxis dataKey="month" />

          <YAxis
            yAxisId="orders"
            orientation="left"
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.toLocaleString("ar-EG")}
          />

          <YAxis
            yAxisId="sales"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.toLocaleString("ar-EG")}
          />

          <Tooltip formatter={(v) => v.toLocaleString("ar-EG")} />
          <Legend />

          <defs>
            <linearGradient id="ordersGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1F2937" />
              <stop offset="100%" stopColor="#005A7D" />
            </linearGradient>

            <linearGradient id="salesGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1F2937" />
              <stop offset="100%" stopColor="#005A7D" />
            </linearGradient>
          </defs>

          <Bar
            yAxisId="orders"
            dataKey="orders"
            name="عدد الطلبات"
            fill="url(#ordersGradient)"
            barSize={34}
            radius={[8, 8, 0, 0]}
          >
            <LabelList position="top" fill="#1e3a8a" fontSize={12} />
          </Bar>

          <Bar
            yAxisId="sales"
            dataKey="sales"
            name="قيمة المبيعات"
            fill="url(#salesGradient)"
            barSize={34}
            radius={[8, 8, 0, 0]}
          >
            <LabelList position="top" fill="#1e40af" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyComparisonBar;
