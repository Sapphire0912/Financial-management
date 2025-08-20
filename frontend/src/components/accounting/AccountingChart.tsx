import { Pie } from "react-chartjs-2";

type PieChartProps = {
  labels: string[];
  values: number[];
};

const PieChart = ({ labels, values }: PieChartProps) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: "票數",
        data: values, // 每個區塊的數值
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"], // 區塊顏色
        borderColor: ["#fff", "#fff", "#fff"], // 邊框顏色
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top", // 圖例位置
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.raw} 票`,
        },
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export const AccountingChart = ({ filterStatus }: { filterStatus: string }) => {
  // filterStatus: 0 = 支出, 1 = 收入

  return (
    <div className="w-full h-full">
      <PieChart labels={["紅色", "藍色", "黃色"]} values={[300, 50, 100]} />
    </div>
  );
};

export const AccountingTable = ({ filterStatus }: { filterStatus: string }) => {
  return <div className="w-full h-full">{/* <PieChart /> */}</div>;
};
