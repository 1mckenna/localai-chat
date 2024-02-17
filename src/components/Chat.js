import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Layout, Divider, Input, Button, Card, Flex, Spin } from 'antd';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import { ThemeContext } from './ThemeContext';
import './Chat.css';

const { Content } = Layout;
const { TextArea } = Input;

const ChatInterface = ({ selectedModel }) => {
  const { theme } = useContext(ThemeContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newPrompt, setNewPrompt] = useState(() => {
    // Retrieve prompt from localStorage on component mount
    return localStorage.getItem('prompt') || 'You are a helpful assistant that prefers to write code in python';
  });
  const [loading, setLoading] = useState(false);
  const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://api:8080';
  const [lastPrompt, setLastPrommpt] = useState('');

  useEffect(() => {
    // Save prompt to localStorage whenever it changes
    localStorage.setItem('prompt', newPrompt);
  }, [newPrompt]);

  const sendMessage = async () => {
    try {
      setLoading(true);
      setLastPrommpt(newMessage);
      await axios
        .post(
          `${serverUrl}/v1/chat/completions`,
          {
            model: selectedModel?.id || 'default-model-id',
            messages: [
              { role: 'system', content: newPrompt },
              { role: 'user', content: newMessage },
            ],
            stream: false,
          },
          {
            'Content-Type': 'application/json',
          }
        )
        .then(function (response) {
          setMessages(response.data.choices[0].message);
          setNewMessage('');
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(function () {
          setLoading(false);
        });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div style={{ color: 'var(--primary-color)' }}>
      <Layout>
        <Content style={{ padding: '20px' }}>
          <Flex align="center" gap="middle">
            <Spin spinning={loading} fullscreen size="large" />
          </Flex>
          <Card title="Current Model">
            {selectedModel ? (
              <div>
                <p>
                  <strong>ID: </strong>
                  <span>{selectedModel.id}</span>
                </p>
              </div>
            ) : (
              <p>No model selected</p>
            )}
          </Card>
          <Divider></Divider>
          <Card title="Prompt">
            <TextArea
              showCount
              maxLength={2048}
              className="prompt-input"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
            />
          </Card>
          <Divider></Divider>
          <Card title="Conversation">
            <div>
              <b>
                <UserOutlined style={{ fontSize: '24px', color: 'blue', paddingTop: '20px' }} /> Human:
              </b>
            </div>
            {lastPrompt}
            <div>
              <b>
                <RobotOutlined style={{ fontSize: '24px', color: 'red', paddingTop: '20px' }} /> Assistant:
              </b>
            </div>
            <div className={messages.content ? 'chatbot-response' : 'chatbot-empty-response'}>
              <Markdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter {...props} language={match[1]} style={dark} PreTag="div">
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {messages.content}
              </Markdown>
            </div>
          </Card>
          <Divider></Divider>
          <div style={{ marginTop: '20px' }}>
            <TextArea
              showCount
              maxLength={2048}
              className="msg-input"
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button className="send-btn" disabled={loading || !selectedModel} type="primary" style={{ marginTop: '10px' }} onClick={sendMessage}>
              {!selectedModel ? 'YOU MUST SELECT A MODEL FIRST' : 'Send'}
            </Button>
          </div>
        </Content>
      </Layout>
    </div>
  );
};

export default ChatInterface;
