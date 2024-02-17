// ModelsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Select, Divider, Input, Space, Flex, Progress, Spin } from 'antd';
import { CheckOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons';
import LZString from 'lz-string';
import axios from 'axios';
import { ThemeContext } from './ThemeContext';
import './Models.css';
import SettingsPage from './Settings'; 


const { Option } = Select;
const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://api:8080';

const ModelsPage = ({ selectedModel, setSelectedModel }) => {
  const { theme } = useContext(ThemeContext);
  const [models, setModels] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [loading, setLoading] = useState(false);
  const [installationProgress, setInstallationProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [overrides, setOverrides] = useState({});


  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get(`${serverUrl}/v1/models`);
        setModels(response.data.data || []);
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };

    fetchModels();
  }, []);

  // Set selected model when models change
  useEffect(() => {
    if (models.length > 0 && selectedModel === null) {
      // Set the default selected model if not already set
      setSelectedModel(models[0]);
    }
  }, [models, selectedModel, setSelectedModel]);

  const fetchTableData = async () => {
    try {
      // Check if compressed data is available in local storage
      const storedCompressedData = localStorage.getItem('compressedTableData');

      if (storedCompressedData) {
        // Decompress and use the locally stored data
        const inflatedData = LZString.decompress(storedCompressedData);
        setTableData(JSON.parse(inflatedData));
      } else {
        // Fetch data from the server
        const response = await axios.get(`${serverUrl}/models/available`);
        setTableData(response.data);

        // Compress and store the fetched data in localStorage
        const compressedData = LZString.compress(JSON.stringify(response.data));
        localStorage.setItem('compressedTableData', compressedData);
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
    }
  };

  useEffect(() => {
    fetchTableData();
  }, [selectedModel, searchText]);
  

  const handleDropdownChange = (value) => {
    const model = models.find((m) => m.id === value);
    setSelectedModel(model); // Update selectedModel using the provided callback
  };

  const handleInstallClick = async (modelName) => {
    try {
      // Make an Axios post request to initiate the installation
      const installResponse = await axios.post(`${serverUrl}/models/apply`, { "id": modelName.name, overrides }, {"Content-Type": "application/json"});
      const { status: statusUrl } = installResponse.data;
      const trackInstallation = async () => {
        try {
          const statusResponse = await axios.get(statusUrl);
          const { processed, progress, message, error } = statusResponse.data;
          setInstallationProgress(progress);
          if (processed) {
            setInstallationProgress(0);
            console.log('Installation completed successfully!');
          } else {
            trackInstallation();
          }
        } catch (error) {
          console.error('Error tracking installation status:', error);
        }
      };
      trackInstallation();
    } catch (error) {
      console.error('Error installing model:', error);
    }
  }; 

  const handleClearLocalStorage = async () => {
    try {
      setLoading(true);
      localStorage.removeItem('compressedTableData');
      await fetchTableData();
    } finally {
      setLoading(false); // Set loading back to false after data is fetched
    }

  };

  // Retrieve overrides from local storage on component mount
  useEffect(() => {
    console.log('Fetching overrides from local storage...');
    const storedOverrides = localStorage.getItem('overrides');
    if (storedOverrides) {
      console.log('Overrides found:', storedOverrides);
      setOverrides(JSON.parse(storedOverrides));
    } else {
      console.log('No overrides found in local storage.');
    }
  }, []);

  const handleSettingsSave = (values) => {
    // Save overrides to local storage
    localStorage.setItem('overrides', JSON.stringify(values));
    // Update state
    setOverrides(values);
    setShowSettings(false);
  };

  const columns = [
    {
      title: 'Installed',
      dataIndex: 'name',
      key: 'installed',
      render: (text) => {
        if(models.some(e => e.id === text))
          return <CheckOutlined />
        else
           return <CloseOutlined />;
      },
      filters: [
        { text: 'Installed', value: 'installed' },
        { text: 'Not Installed', value: 'notInstalled' },
      ],
      onFilter: (value, record) => {
        const isInstalled = models.some(e => e.id === record.name);
        return (value === 'installed' && isInstalled) || (value === 'notInstalled' && !isInstalled);
      },
    },
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        ...getColumnSearchProps('name'),
    },
    {
        title: 'URL',
        dataIndex: 'url',
        key: 'url',
        ...getColumnSearchProps('url'),
        render: (text) => <a href={text} target="_blank" rel="noopener noreferrer">{text}</a>,
    },
    {
        title: 'License',
        dataIndex: 'license',
        key: 'license',
    },
    {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
          <div>
            {installationProgress > 0 ? (
              <Flex align="center" gap="middle">
                <Progress type="dashboard" percent={Math.round(installationProgress)} size={32} />
              </Flex>
            ) : (
              <Button type="primary" onClick={() => handleInstallClick(record)}>
                Install
              </Button>
            )}
          </div>
        ),
    },
    ];

  return (
    <div>
      <Divider orientation="left">Installed Models</Divider>
      <Select
  key={theme}
  className='model-select'
  onChange={handleDropdownChange}
  placeholder={ !selectedModel ? "No Model Selected!" : selectedModel.id }
  optionRender={(node) => (
    <div>
      {node.label}
    </div>
  )}
>
  {models.map((model) => (
    <Option key={model.id} value={model.id} >
      {model.id}
    </Option>
  ))}
</Select>
      <Divider orientation="left">Models Gallery</Divider>
      <Divider orientation="right">
        <Button className='refresh-button' type="primary" onClick={handleClearLocalStorage} loading={loading} >Refresh Models</Button>
      </Divider>
      <Table
        dataSource={tableData}
        columns={columns}
        rowKey="name"
        onChange={(pagination, filters, sorter) => {
        }}
      />
      <Divider orientation="left">
       Model Setting Overrides
      </Divider>
      <SettingsPage overrides={overrides} onSave={handleSettingsSave} />
    </div>
  );
};

export default ModelsPage;

const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className='filter-dropdown'>
        <Input
          placeholder={`Search ${dataIndex}`}
          className='search-input'
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm)}
          // style={{ width: 188, marginBottom: 8, color:'var(--text-color) !important' }}
        />
        <Space>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            className='search-button'
            onClick={() => handleSearch(selectedKeys, confirm)}
          >
            Search
          </Button>
          <Button className='reset-button' onClick={() => handleReset(clearFilters)} >
            Reset
          </Button>
        </Space>
      </div>
    ),
    onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
  });
 
    // Helper functions for search and reset
const handleSearch = (selectedKeys, clearFilters) => {
  clearFilters();
};
  
  const handleReset = (clearFilters) => {
    clearFilters();
  };
  