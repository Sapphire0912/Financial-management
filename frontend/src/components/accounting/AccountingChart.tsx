import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { TooltipItem } from "chart.js";

/* API */
import { getAccountingFigureData } from "../../services/accountingUser";

type PieChartProps = {
  labels: string[];
  values: number[];
};

const PieChart = ({ labels, values }: PieChartProps) => {
  /* 設定 Pie Styles*/
  const borderColor = Array(labels.length).fill("#fff");

  // 動態顏色 HSL 平均分佈
  const backgroundColor = labels.map(
    (_, i) => `hsl(${(i * 360) / labels.length}, 70%, 60%)`
  );

  const data = {
    labels: labels,
    datasets: [
      {
        label: "金額",
        data: values,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "left",
        labels: {
          font: {
            size: 18,
          },
          padding: 20,
        },
      },
      tooltip: {
        displayColors: false,
        callbacks: {
          label: (context: TooltipItem<"pie">) => {
            const total = context.dataset.data.reduce(
              (acc, curr) => acc + curr,
              0
            );

            const percentage = ((context.raw as number) / total) * 100;

            const formattedNumber = (context.raw as number).toLocaleString();

            return [
              `${context.label}: $ ${formattedNumber}`,
              `占比: ${percentage.toFixed(2)}%`,
            ];
          },
        },
        bodyFont: {
          size: 16,
        },
        titleFont: {
          size: 18,
        },
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export const AccountingChart = ({ filterStatus }: { filterStatus: string }) => {
  const [chartData, setChartData] = useState<PieChartProps>({
    labels: [],
    values: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await getAccountingFigureData(filterStatus);
      setChartData(data);
    };

    fetchData();
  }, [filterStatus]);

  return (
    <div className="w-[60%] h-[60%] flex flex-col justify-center items-center">
      <h2 className="text-2xl font-bold">
        本月份當前{filterStatus === "0" ? "支出" : "收入"}圖表
      </h2>
      <PieChart labels={chartData.labels} values={chartData.values} />
    </div>
  );
};

// export const AccountingTable = ({ filterStatus }: { filterStatus: string }) => {
//   return <div className="w-full h-full">{/* <PieChart /> */}</div>;
// };
