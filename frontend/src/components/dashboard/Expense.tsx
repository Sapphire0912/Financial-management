// My Expense Components
type ExpenseInfoCardProps = {
  iconSrc: string;
  label: string;
  value: string;
  valueColor?: string;
};

const ExpenseInfo: React.FC<ExpenseInfoCardProps> = ({
  iconSrc,
  label,
  value,
  valueColor = "text-gray-800",
}) => {
  return (
    <div className="bg-slate-100 border border-slate-400 rounded-full py-1 pl-2 pr-4 my-1 mr-4 shadow-sm w-fit">
      <div className="flex items-center text-sm space-x-2">
        <img src={iconSrc} className="w-4 h-4 opacity-70" alt={iconSrc} />
        <span>{label}</span>
        <span className={`ml-auto font-semibold ${valueColor}`}>{value}</span>
      </div>
    </div>
  );
};

const MyExpense = () => {
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="py-2 flex items-center justify-between">
        <h3 className="font-semibold text-xl">我的支出</h3>
        <select
          className="bg-slate-100 border border-gray-300 text-sm rounded-lg px-3 py-1 shadow-sm transition-all duration-150 hover:cursor-pointer "
          aria-label="時間範圍"
        >
          <option value="all">全部</option>
          <option value="2025-07">{"2025-07"}</option>
        </select>
      </div>
      <div className="py-2">
        <h4 className="font-bold text-gray-600 py-0.5">全部支出</h4>
        <h1 className="font-bold text-4xl">{"$74503.00"}</h1>
      </div>

      <div className="flex">
        <ExpenseInfo
          iconSrc="/dashboard-arpu-dark.png"
          label="支出成長率"
          value="+2.41%"
          valueColor="text-emerald-500"
        />
        <ExpenseInfo
          iconSrc="/dashboard-bonus-dark.png"
          label="支出最高類別"
          value="食 ⇀ $12,111"
          valueColor="text-red-500"
        />
      </div>

      <div className="mt-4">
        <div className="flex justify-between">
          <span className="font-semibold">0</span>
          <span className="font-semibold">50</span>
          <span className="font-semibold">100</span>
        </div>
        <div className="flex items-center w-full h-16 gap-2">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className={`h-full flex-1 rounded-xl ${
                i < 10 ? "bg-green-700 opacity-80" : "bg-green-200 opacity-40"
              }`}
            ></div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-4 text-base">
          <span className="text-gray-800">本月預算上限 {"$20,000"}</span>
          <span className="text-gray-800">已使用預算 {"75.4%"}</span>
        </div>
      </div>
    </div>
  );
};

export default MyExpense;
