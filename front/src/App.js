import React, {useState} from 'react';
import OrdersPage from './pages/orders/OrdersPage';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UploadOutlined,
    UserOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import HeaderApp from "./components/header/HeaderApp";
import LogoMenuLeftSide from "./components/left_side_menu/components/logo";
import {Button, Layout, Menu, theme, ConfigProvider} from 'antd';
import ProductsPage from "./pages/products/ProductsPage";

const {Sider, Content} = Layout;

const App = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedTab, setSelectedTab] = useState('1');

    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    const renderContent = () => {
        switch (selectedTab) {
            case '1':
                return <Button type="primary">Добавить заказ</Button>;
            case '2':
                return <OrdersPage/>;
            case '3':
                return <ProductsPage/>;
            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    siderBg: '#f7fafc',
                    headerBg: '#f7fafc',
                },
            }}
        >
            <Layout
                style={{
                    minHeight: '100vh',
                }}
            >
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    style={{
                        background: 'var(--siderBg)',
                    }}
                >
                    {/* Контейнер для логотипа и кнопки */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: collapsed ? 'column-reverse' : 'row', // Меняем расположение
                            alignItems: 'center',
                            justifyContent: collapsed ? 'center' : 'space-between', // Пространство между элементами
                            padding: collapsed ? '8px 0' : '16px', // Отступы
                            height: collapsed ? 'auto' : '64px', // Высота контейнера
                        }}
                    >
                        <LogoMenuLeftSide collapsed={collapsed}/> {/* Передаём состояние */}
                        <div
                            style={{
                                marginLeft: collapsed ? 0 : 'auto', // Для развернутого состояния кнопка прилипает к правому краю
                            }}
                        >
                            <Button
                                type="text"
                                icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                                onClick={() => setCollapsed(!collapsed)}
                                style={{
                                    fontSize: '16px',
                                    width: 64,
                                    height: 64,
                                }}
                            />
                        </div>
                    </div>
                    <Menu
                        style={{
                            background: 'transparent',
                            border: 'none',
                        }}
                        mode="inline"
                        selectedKeys={[selectedTab]}
                        onClick={(e) => setSelectedTab(e.key)}
                        items={[
                            {
                                key: '1',
                                icon: <UserOutlined/>,
                                label: 'Аналитика',
                            },
                            {
                                key: '2',
                                icon: <VideoCameraOutlined/>,
                                label: 'Заказы',
                            },
                            {
                                key: '3',
                                icon: <UploadOutlined/>,
                                label: 'Наличие',
                            },
                            {
                                key: '4',
                                icon: <UploadOutlined/>,
                                label: 'Контакты',
                            },
                            {
                                key: '5',
                                icon: <UploadOutlined/>,
                                label: 'Список задач',
                            },
                        ]}
                    />
                </Sider>
                <Layout>
                    <HeaderApp collapsed={collapsed} setCollapsed={setCollapsed} selectedTab={selectedTab}/>
                    <Content
                        style={{
                            margin: '24px 16px',
                            // padding: 24,
                            minHeight: 280,
                            // background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {renderContent()}
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default App;
