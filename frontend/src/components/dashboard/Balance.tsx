// My Balance Components
type BalanceInfoCardProps = {
  iconSrc: string;
  label: string;
  value: string;
  valueColor?: string; // Tailwind 顏色 class，如 text-emerald-500
};

const BalanceInfoCard: React.FC<BalanceInfoCardProps> = ({
  iconSrc,
  label,
  value,
  valueColor = "text-gray-800",
}) => {
  return (
    <div className="bg-slate-100 border border-slate-400 rounded-full py-1 pl-2 pr-4 my-2 shadow-sm w-fit">
      <div className="flex items-center text-sm space-x-2">
        <img src={iconSrc} className="w-4 h-4 opacity-70" alt={iconSrc} />
        <span>{label}</span>
        <span className={`ml-auto font-semibold ${valueColor}`}>{value}</span>
      </div>
    </div>
  );
};

const MyBalance = () => {
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="py-2">
        <h3 className="font-semibold text-xl">我的餘額</h3>
      </div>
      <div className="py-2">
        <h4 className="font-bold text-gray-600 py-0.5">全部餘額</h4>
        <h1 className="font-bold text-4xl">{"$74503.00"}</h1>
      </div>

      <div>
        <BalanceInfoCard
          iconSrc="/dashboard-income-dark.png"
          label="上個月總收入"
          value="+$14,503.00"
          valueColor="text-emerald-500"
        />
        <BalanceInfoCard
          iconSrc="/dashboard-bonus-dark.png"
          label="上個月總獎金"
          value="+$12,000.00"
          valueColor="text-sky-400"
        />
        <BalanceInfoCard
          iconSrc="/dashboard-expense-dark.png"
          label="上個月總支出"
          value="-$12,000.00"
          valueColor="text-red-500"
        />
      </div>
    </div>
  );
};

export default MyBalance;
