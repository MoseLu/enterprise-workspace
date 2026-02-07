/**
 * AppCrudSearchKey - Search Key Selector Component
 * React Admin - Access Control Module
 *
 * A search input component with key selector for filtering data.
 */

import React, { useCallback, useState } from 'react';
import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface SearchKeyOption {
  label: string;
  value: string;
}

interface AppCrudSearchKeyProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  options?: SearchKeyOption[];
  placeholder?: string;
  className?: string;
}

export const AppCrudSearchKey: React.FC<AppCrudSearchKeyProps> & {
  displayName: string;
} = ({
  value = 'keyword',
  onChange,
  onSearch,
  options = [
    { label: '名称', value: 'name' },
    { label: '编码', value: 'code' },
    { label: '关键词', value: 'keyword' },
  ],
  placeholder = '请输入搜索内容',
  className,
}) => {
  const [searchText, setSearchText] = useState('');

  const handleSearch = useCallback(() => {
    onSearch?.(searchText);
  }, [searchText, onSearch]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleSelectChange = useCallback((newValue: string) => {
    onChange?.(newValue);
  }, [onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  }, []);

  return (
    <Space.Compact className={className}>
      <Select
        value={value}
        onChange={handleSelectChange}
        options={options}
        style={{ width: 120 }}
      />
      <Input
        placeholder={placeholder}
        value={searchText}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        prefix={<SearchOutlined />}
        allowClear
        style={{ width: 240 }}
        onPressEnter={handleSearch}
      />
    </Space.Compact>
  );
};

AppCrudSearchKey.displayName = 'AppCrudSearchKey';

export default AppCrudSearchKey;
