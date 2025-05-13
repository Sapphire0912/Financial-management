/* 元件 Props */

type IconInputProps = {
  type: string;
  placeholder: string;
  iconSrc: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const IconInput = ({
  type,
  placeholder,
  iconSrc,
  onChange,
}: IconInputProps) => (
  /* Login Input Form Pattern */
  <div className="w-full flex items-center bg-gray-300 rounded-lg px-3 py-2">
    <img src={iconSrc} alt="icon" className="w-6 h-6 mr-2" />
    <input
      type={type}
      placeholder={placeholder}
      className="w-full bg-transparent text-black placeholder-gray-500 focus:outline-none pl-1"
      onChange={onChange}
    />
  </div>
);

export default IconInput;
