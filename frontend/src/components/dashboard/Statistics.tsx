/* chart.js */
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const data = {
  labels: [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ],
  datasets: [
    {
      label: "收入",
      data: [
        35000, 37000, 34000, 33000, 39560, 34800, 31000, 32000, 33000, 34000,
        34560, 33434,
      ],
      backgroundColor: "#235F45",
      borderRadius: 8,
      stack: "stack1",
    },
    {
      label: "支出",
      data: [
        -22100, -23000, -22500, -21500, -22000, -22200, -22000, -23000, -22500,
        -21500, -22000, -20000,
      ],
      backgroundColor: "#C3EB4D",
      borderRadius: 8,
      stack: "stack1",
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
      labels: {
        font: {
          size: 16, // ← 調整這裡，預設是 12
        },
      },
    },
    tooltip: {
      backgroundColor: "#111", // 可選：浮框背景色
      titleFont: {
        size: 14, // 標題字體大小
      },
      bodyFont: {
        size: 16, // 主體數字字體大小
      },
      padding: 12, // 整個 tooltip 的內距
      callbacks: {
        label: (context) => {
          const value = context.raw;
          return `$${
            value < 0 ? (value * -1).toLocaleString() : value.toLocaleString()
          }`;
        },
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false, // ← 移除 X 軸格線
      },
    },
    y: {
      stacked: true,
      beginAtZero: true,
    },
  },
  maintainAspectRatio: false,
};
function StackedBarChart() {
  return (
    <div className="w-full h-full">
      <Bar options={options} data={data} />
    </div>
  );
}

// Component Props
type MyYearStatisticsProps = {
  menu: string[];
};

const MyYearStatistics = ({ menu }: MyYearStatisticsProps) => {
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="py-2 flex items-center justify-between">
        <h3 className="font-semibold text-xl">年度統計</h3>
        <select
          className="bg-slate-100 border border-gray-300 text-sm rounded-lg px-3 py-1 shadow-sm transition-all duration-150 hover:cursor-pointer"
          aria-label="時間範圍"
        >
          {menu.map((item, index) => (
            <option value={item} key={index}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <StackedBarChart />
    </div>
  );
};

export default MyYearStatistics;
