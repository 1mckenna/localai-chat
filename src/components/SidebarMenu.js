import React, { useEffect, useState, useContext } from 'react';
import { Menu, Layout } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { ShopOutlined, MessageOutlined, MenuUnfoldOutlined, MenuFoldOutlined, HomeOutlined, BulbOutlined }  from '@ant-design/icons';
import { ThemeContext } from './ThemeContext';
import ToggleThemeButton from './ToggleThemeButton';
import './SidebarMenu.css';
const { Sider } = Layout;

const SidebarMenu = ({ selectedModel }) => {
  const { theme } = useContext(ThemeContext);

  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState('');
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    // Extract the pathname from the location object and set the selected key
    const pathname = location.pathname;
    setSelectedKey(pathname);
  }, [location]);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={toggleCollapse}
      theme={theme}
      width={200}
      collapsedWidth={55}
    >
      <div style={{ textAlign: 'center'}}>
        {collapsed ? (
          <MenuUnfoldOutlined onClick={toggleCollapse} style={{ textAlign: 'center', fontSize: '24px'}} />
        ) : (
          <MenuFoldOutlined onClick={toggleCollapse} style={{ textAlign: 'center', fontSize: '24px' }} />
        )}
      </div>
      <Menu
        mode="vertical"
        theme={theme}
        selectedKeys={[selectedKey]}
        style={{ marginTop: '20px' }}
      >
        <Menu.Item key="/" icon={<HomeOutlined />}>
          <Link to={{pathname: "/", state: { selectedModel } }} >Home</Link>
        </Menu.Item>
        <Menu.Item key="/models" icon={<ShopOutlined />}>
          <Link to={{pathname: "/models", state: { selectedModel } }} >Models</Link>
        </Menu.Item>
        <Menu.Item key="/chat" icon={<MessageOutlined />}>
          <Link to={{pathname: "/chat", state: { selectedModel } }}>Chat</Link>
        </Menu.Item>
        <Menu.Item key="separator" style={{ margin: '10px 0', height: '1px' }} disabled />
        <Menu.Item  key="theme">
          <ToggleThemeButton />
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default SidebarMenu;
// SidebarMenu.jsx
