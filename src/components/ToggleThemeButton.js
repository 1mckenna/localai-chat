import React, { useContext } from 'react';
import { Switch } from 'antd';
import { ThemeContext } from './ThemeProvider';
import { MdOutlineLightMode } from "react-icons/md";
import { FaRegMoon } from "react-icons/fa";

const ToggleThemeButton = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
      <Switch
        checked={theme === 'dark'}
        onChange={toggleTheme}
        checkedChildren={<FaRegMoon />}
        unCheckedChildren={<MdOutlineLightMode />}
        className='theme-switch'
      />
  );
};

export default ToggleThemeButton;
