import React, { useState } from 'react';
import { Table, Card, Space, Button, Input, Tag } from 'antd';

const FinanceInventoryResult: React.FC = () => {
  const [selectedCheck, setSelectedCheck] = useState<any>(null);

  const columns = [
    { title: '物料编码', dataIndex: 'materialCode', key: 'materialCode' },
    { title: '仓位', dataIndex: 'position', key: 'position' },
    { title: '单位成本 ($)', dataIndex: 'unitCost', key: 'unitCost', align: 'right' as const },
    { title: '账面数量', dataIndex: 'bookQty', key: 'bookQty', align: 'right' as const },
    { title: '实际数量', dataIndex: 'actualQty', key: 'actualQty', align: 'right' as const },
    { title: '差异数量', dataIndex: 'diffQty', key: 'diffQty', align: 'right' as const },
    { title: '差异金额 ($)', dataIndex: 'varianceCost', key: 'varianceCost', align: 'right' as const },
  ];

  const checkList = [
    { checkNo: 'CHK001', checkType: '月度盘点' },
    { checkNo: 'CHK002', checkType: '季度盘点' },
  ];

  return (
    <div className="finance-inventory-result">
      <Card title="盘点结果">
        <Space direction="horizontal" style={{ width: '100%', marginBottom: 16 }}>
          <div style={{ width: 200 }}>
            <h4>盘点列表</h4>
            <ul>
              {checkList.map((check) => (
                <li
                  key={check.checkNo}
                  onClick={() => setSelectedCheck(check)}
                  style={{
                    cursor: 'pointer',
                    padding: 8,
                    background: selectedCheck?.checkNo === check.checkNo ? '#e6f7ff' : 'transparent',
                  }}
                >
                  {check.checkType} - {check.checkNo}
                </li>
              ))}
            </ul>
          </div>
          <Table
            columns={columns}
            dataSource={[]}
            rowKey="key"
            pagination={{ pageSize: 10 }}
            style={{ flex: 1 }}
          />
        </Space>
      </Card>
    </div>
  );
};

export default FinanceInventoryResult;
