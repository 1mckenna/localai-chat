import React, { useContext } from 'react';
import { Layout, Typography, Button } from 'antd';
import { Link } from 'react-router-dom';
import { ThemeContext } from './ThemeContext';
import './Welcome.css';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const WelcomePage = ( ) => {
  const { theme } = useContext(ThemeContext);

  return (
    <Layout>
      <Content>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <Title level={3} style={{ color: 'var(--text-color)' }} >Welcome to LocalAI Chat</Title>
        <Paragraph>
          Welcome to LocalAI Chat, your personal AI assistant! Before you start chatting,
          make sure to follow these steps:
        </Paragraph>
        <ol className='ol'>
          <li className='li'>
            <Paragraph>
              Go to the <Link to="/models" className='link'>Models page</Link>.
            </Paragraph>
          </li>
          <li className='li'>
            <Paragraph>
              Select a model you wish to use from the dropdown.
            </Paragraph>
          </li>
          <li className='li'>
            <Paragraph>
              Optionally, explore the Models page to install models from the gallery using the table.
            </Paragraph>
          </li>
        </ol>
        <Paragraph>
          Once you've selected a model, you can return to the <Link to="/chat" className='link'>Chat page</Link> and
          start interacting with your assistant.
        </Paragraph>
        <div className='goto-btn'>
          <Button  type="primary" theme={theme}>
            <Link to="/models" >Go to Models Page</Link>
          </Button>
        </div>
      </Content>
    </Layout>
  );
};

export default WelcomePage;
