// MyIncome Components
type IncomeInfoCardProps = {
  iconSrc: string;
  label: string;
  value: string;
  valueColor?: string;
};

const IncomeInfoCard: React.FC<IncomeInfoCardProps> = ({
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

type MyIncomeProps = {
  menu: string[];
};

const MyIncome = ({ menu }: MyIncomeProps) => {
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="py-2 flex items-center justify-between">
        <h3 className="font-semibold text-xl">我的收入</h3>
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
      <div className="py-2">
        <h4 className="font-bold text-gray-600 py-0.5">全部收入</h4>
        <h1 className="font-bold text-4xl">{"$74503.00"}</h1>
      </div>

      <div className="flex">
        <IncomeInfoCard
          iconSrc="/dashboard-arpu-dark.png"
          label="成長率"
          value="+2.41%"
          valueColor="text-emerald-500"
        />
        <IncomeInfoCard
          iconSrc="/dashboard-bonus-dark.png"
          label="成長金額"
          value="+$2,000"
          valueColor="text-emerald-500"
        />
      </div>

      <div className="mt-4 py-1 grid grid-cols-3">
        <div className="col-span-1 border-l-4 border-blue-300 px-2 rounded-s-md">
          <p className="font-semibold text-gray-700 py-1">薪資</p>
          <span>{"$33,333"}</span>
        </div>
        <div className="col-span-1 border-l-4 border-green-200 px-2 rounded-s-md">
          <p className="font-semibold text-gray-700 py-1">獎金</p>
          <span>{"$33,333"}</span>
        </div>
        <div className="col-span-1 border-l-4 border-orange-200 px-2 rounded-s-md">
          <p className="font-semibold text-gray-700 py-1">其他</p>
          <span>{"$22,222"}</span>
        </div>
      </div>
    </div>
  );
};

export default MyIncome;
