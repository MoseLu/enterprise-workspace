import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

function Home() {
  return (
    <div className="page production-home">
      <Card>
        <Title level={3}>生产模块首页</Title>
        <Paragraph>
          欢迎使用生产管理模块。此页面已从 Vue3 + Element Plus 迁移到 React + Ant Design。
        </Paragraph>
      </Card>
    </div>
  );
}

export default Home;
