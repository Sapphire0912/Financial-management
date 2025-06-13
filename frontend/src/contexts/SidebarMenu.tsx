import { ReactNode, useState } from "react";
import { MenuContext, defaultMenuItems, MenuItem } from "../hooks/sidebarMenu";

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [menuList, setMenuList] = useState<MenuItem[]>(defaultMenuItems);

  return (
    <MenuContext.Provider value={{ menuList, setMenuList }}>
      {children}
    </MenuContext.Provider>
  );
};
