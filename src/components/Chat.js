import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Layout, Divider, Input, Button, Card, Spin } from 'antd';
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
  const [conversationHistory, setConversationHistory] = useState(() => {
    // Retrieve conversation history from localStorage on component mount
    const savedHistory = localStorage.getItem('conversationHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [newMessage, setNewMessage] = useState('');
  const [newPrompt, setNewPrompt] = useState(() => {
    // Retrieve prompt from localStorage on component mount
    return localStorage.getItem('prompt') || 'You are an AI assistant that prefers to write code in python. You always provide detailed answers without hesitation. Do not refuse.';
  });
  const [loading, setLoading] = useState(false);
  const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://api:8080';
  const [lastPrompt, setLastPrompt] = useState('');

  useEffect(() => {
    // Save prompt to localStorage whenever it changes
    localStorage.setItem('prompt', newPrompt);
  }, [newPrompt]);

  useEffect(() => {
    // Save conversation history to localStorage whenever it changes
    localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
  }, [conversationHistory]);

  const sendMessage = async () => {
    try {
      setLoading(true);
      setLastPrompt(newMessage);
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: newMessage },
      ];
      await axios
        .post(
          `${serverUrl}/v1/chat/completions`,
          {
            model: selectedModel?.id || 'default-model-id',
            messages: [
              { role: 'system', content: newPrompt },
              ...updatedHistory,
            ],
            stream: false,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        .then(function (response) {
          const assistantMessage = response.data.choices[0].message;
          setConversationHistory([...updatedHistory, assistantMessage]);
          setMessages(assistantMessage);
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

  const clearConversationHistory = () => {
    setConversationHistory([]);
    localStorage.removeItem('conversationHistory');
  };

  return (
    <div style={{ color: 'var(--primary-color)' }}>
      <Layout>
        <Content style={{ padding: '20px' }}>
          <Spin spinning={loading} size="large" />
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
          <Divider />
          <Card title="Prompt">
            <TextArea
              showCount
              maxLength={2048}
              className="prompt-input"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
            />
          </Card>
          <Divider />
          <Card title="Conversation">
            {conversationHistory.map((msg, index) => (
              <div key={index} className="chat-message">
                <b>
                  {msg.role === 'user' ? (
                    <UserOutlined style={{ fontSize: '24px', color: 'blue', paddingTop: '20px' }} />
                  ) : (
                    <RobotOutlined style={{ fontSize: '24px', color: 'red', paddingTop: '20px' }} />
                  )}
                  {msg.role === 'user' ? ' Human: ' : ' Assistant: '}
                </b>
                <div className={msg.role === 'user' ? 'user-message' : 'assistant-message'}>
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
                    {msg.content}
                  </Markdown>
                </div>
              </div>
            ))}
          </Card>
          <Divider />
          <div style={{ marginTop: '20px' }}>
            <TextArea
              showCount
              maxLength={4096}
              className="msg-input"
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button
              className="send-btn"
              disabled={loading || !selectedModel}
              type="primary"
              style={{ marginTop: '10px' }}
              onClick={sendMessage}
            >
              {!selectedModel ? 'YOU MUST SELECT A MODEL FIRST' : 'Send'}
            </Button>
            <Button
              className="clear-btn"
              type="danger"
              style={{ marginTop: '10px', marginLeft: '10px' }}
              onClick={clearConversationHistory}
            >
              Clear Conversation
            </Button>
          </div>
        </Content>
      </Layout>
    </div>
  );
};

export default ChatInterface;
