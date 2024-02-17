import React, { useState, useEffect } from 'react';
import { List, Input, Button, Popconfirm, Space } from 'antd';

const SettingsPage = ({ overrides, onSave }) => {
  const [data, setData] = useState(Object.entries(overrides).map(([key, value]) => ({ key, setting: key, value: value.toString() })));
  const [editingKey, setEditingKey] = useState('');

  // Update data state when overrides prop changes
  useEffect(() => {
    setData(Object.entries(overrides).map(([key, value]) => ({ key, setting: key, value: value.toString() })));
  }, [overrides]);

  const isEditing = (item) => item.key === editingKey;

  const edit = (item) => {
    setEditingKey(item.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = (key) => {
    const newData = [...data];
    const index = newData.findIndex((item) => key === item.key);

    if (index > -1) {
      onSave(newData.reduce((acc, curr) => ({ ...acc, [curr.setting]: curr.value }), {}));
      setEditingKey('');
    }
  };

  const addNewRow = () => {
    const newIndex = data.length.toString();
    const newRow = {
      key: newIndex,
      setting: '',
      value: '',
    };
    setData((prevData) => [...prevData, newRow]);
    setEditingKey(newIndex);
  };

  const deleteRow = (key) => {
    const newData = data.filter((item) => key !== item.key);
    onSave(newData.reduce((acc, curr) => ({ ...acc, [curr.setting]: curr.value }), {}));
    setData(newData);
    setEditingKey('');
  };

  const handleSave = (item) => {
    const newData = [...data];
    const index = newData.findIndex((dataItem) => item.key === dataItem.key);
    newData.splice(index, 1, { ...item });
    onSave(newData.reduce((acc, curr) => ({ ...acc, [curr.setting]: curr.value }), {}));
    setEditingKey('');
  };

  return (
    <div>
      <h3>Settings</h3>
      <Button type="link" onClick={addNewRow} style={{ margin: 0, padding: 0, height: 'auto' }}>
        Add New
      </Button>
      <List
        dataSource={data}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Space>
                <a onClick={() => edit(item)} disabled={editingKey !== ''}>
                  Edit
                </a>
                <Popconfirm title="Delete?" onConfirm={() => deleteRow(item.key)}>
                  <a>Delete</a>
                </Popconfirm>
              </Space>,
            ]}
          >
            <div className='value-row'>
              {isEditing(item) ? (
                <Input
                  addonBefore="Override Key"
                  placeholder="Key"
                  value={item.setting}
                  onChange={(e) => {
                    const newData = [...data];
                    const index = newData.findIndex((dataItem) => item.key === dataItem.key);
                    newData[index].setting = e.target.value;
                    setData(newData);
                  }}
                />
              ) : (
                <>
                  <div className='val-title'>Override Setting:</div>
                  <div className='item-value'>{item.setting}</div>
                </>
              )}

              {isEditing(item) ? (
                <Input
                  addonBefore="Override Value"
                  placeholder="Value"
                  value={item.value}
                  onChange={(e) => {
                    const newData = [...data];
                    const index = newData.findIndex((dataItem) => item.key === dataItem.key);
                    newData[index].value = e.target.value;
                    setData(newData);
                  }}
                />
              ) : (
                <>
                  <div className='val-title'>Override Value:</div>
                  <div className='item-value'>{item.value}</div>
                </>
              )}
            </div>
            {isEditing(item) && (
              <Button type="link" onClick={() => save(item.key)}>
                Save
              </Button>
            )}
          </List.Item>
        )}
        bordered
      />
    </div>
  );
};

export default SettingsPage;
