import { useState, useEffect } from "react";

/* API */
import { getYearStatistics } from "../../services/dashboardUser";

/* chart.js */
import { Bar } from "react-chartjs-2";
import { TooltipItem } from "chart.js";

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
        label: (context: TooltipItem<"bar">) => {
          const value = context.raw as number;
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

// Component Props
type MyYearStatisticsProps = {
  menu: string[];
};

const MyYearStatistics = ({ menu }: MyYearStatisticsProps) => {
  /* 選單設定 */
  const [selectMenu, setSelectMenu] = useState<string>("");
  useEffect(() => {
    if (menu.length > 0 && !selectMenu) {
      setSelectMenu(menu[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu]);

  /* Chart 設定 */
  const [chartData, setChartData] = useState(null);
  useEffect(() => {
    if (selectMenu == "" || !selectMenu) return;
    const fetchYearStatisticsChart = async () => {
      const data = await getYearStatistics(selectMenu);
      setChartData(data);
    };
    fetchYearStatisticsChart();
  }, [selectMenu]);

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="py-2 flex items-center justify-between">
        <h3 className="font-semibold text-xl">年度統計</h3>
        <select
          className="bg-slate-100 border border-gray-300 text-sm rounded-lg px-3 py-1 shadow-sm transition-all duration-150 hover:cursor-pointer"
          aria-label="時間範圍"
          value={selectMenu}
          onChange={(e) => setSelectMenu(e.target.value)}
        >
          {menu.map((item, index) => (
            <option value={item} key={"year" + item + index}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full h-full">
        {chartData && <Bar options={options} data={chartData} />}
      </div>
    </div>
  );
};

export default MyYearStatistics;
