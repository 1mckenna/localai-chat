import React, { useState, useEffect, useContext } from 'react';
import { Layout, Typography } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SidebarMenu from './components/SidebarMenu';
import ChatInterface from './components/Chat';
import ModelsPage from './components/Models';
import WelcomePage from './components/Welcome';
import { ThemeProvider } from './components/ThemeProvider';
import { ThemeContext } from './components/ThemeContext';
import ToggleThemeButton from './components/ToggleThemeButton';
import './App.css';

const { Header, Content, Footer } = Layout;

const App = () => {
  const { theme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  // Ensure re-render when the theme changes
  useEffect(() => {
    // Empty dependency array to run the effect only once
  }, [theme]);

  const handleModelSelect = (model) => {
    setSelectedModel(model);
  };

  return (
    <ThemeProvider>
      <Layout style={{ minHeight: '100vh', background: theme }}>
          <Layout style={{ minHeight: '100vh' }}>
            <SidebarMenu selectedModel={selectedModel} />
            <Layout style={{ minHeight: '100vh' }}>
              <Header >
                <Typography.Title level={1} style={{ color: 'var(--text-color)' }}>
                  LocalAI Chat
                </Typography.Title>
              </Header>
              <Content style={{ padding: '20px' }}>
                <Routes>
                  <Route
                    path="/"
                    element={<WelcomePage />}
                  />
                  <Route
                    path="/chat"
                    element={<ChatInterface selectedModel={selectedModel} />}
                  />
                  <Route
                    path="/models"
                    element={<ModelsPage  selectedModel={selectedModel} setSelectedModel={setSelectedModel} />}
                  />
                </Routes>
              </Content>
            </Layout>
          </Layout>
      </Layout>
    </ThemeProvider>
  );
};

export default App;
