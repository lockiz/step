import React, {useState, useContext, useEffect} from "react";
import {Routes, Route, Navigate, useNavigate} from "react-router-dom";
import {AuthContext} from "./pages/context/AuthContext";
import LoginPage from "./pages/context/LoginPage";
import OrdersPage from "./pages/orders/OrdersPage";
import ProductsPage from "./pages/products/ProductsPage";
import RegisterPage from "./pages/context/RegisterPage";
import AdminPage from "./pages/admin/AdminPage";

import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UploadOutlined,
    UserOutlined,
    VideoCameraOutlined,
} from "@ant-design/icons";
import HeaderApp from "./components/header/HeaderApp";
import LogoMenuLeftSide from "./components/left_side_menu/components/logo";
import {Button, Layout, Menu, theme, ConfigProvider, Spin} from "antd";

const {Sider, Content} = Layout;

// Компонент для защиты маршрутов
const ProtectedRoute = ({children, roles}) => {
    const {user, loading} = useContext(AuthContext);

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <Spin size="large"/>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace/>;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace/>;
    }

    return children;
};

const App = () => {
    const {user, loading} = useContext(AuthContext);
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [selectedTab, setSelectedTab] = useState(null); // Устанавливаем `null` по умолчанию

    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    // Боковое меню
    const menuItems = user
        ? [
            {key: "1", icon: <UserOutlined/>, label: "Аналитика", path: "/"},
            {key: "2", icon: <VideoCameraOutlined/>, label: "Заказы", path: "/orders"},
            {key: "3", icon: <UploadOutlined/>, label: "Наличие", path: "/products"},
            ...(user.role === "Admin"
                ? [{key: "6", icon: <UserOutlined/>, label: "Администрирование", path: "/admin"}]
                : []),
        ]
        : [];

    // Устанавливаем `selectedTab` на основании текущего пути
    useEffect(() => {
        const currentPath = window.location.pathname;
        const activeItem = menuItems.find((item) => item.path === currentPath);
        if (activeItem) {
            setSelectedTab(activeItem.key);
        }
    }, [menuItems]);

    const handleMenuClick = (e) => {
        setSelectedTab(e.key);
        const item = menuItems.find((menu) => menu.key === e.key);
        if (item?.path) {
            navigate(item.path);
        }
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    siderBg: "#f7fafc",
                    headerBg: "#f7fafc",
                },
            }}
        >
            <Layout style={{minHeight: "100vh"}}>
                {user && !["/login", "/register"].includes(window.location.pathname) && (
                    <Sider
                        trigger={null}
                        collapsible
                        collapsed={collapsed}
                        style={{background: "var(--siderBg)"}}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: collapsed ? "column-reverse" : "row",
                                alignItems: "center",
                                justifyContent: collapsed ? "center" : "space-between",
                                padding: collapsed ? "8px 0" : "16px",
                                height: collapsed ? "auto" : "64px",
                            }}
                        >
                            <LogoMenuLeftSide collapsed={collapsed}/>
                            <div style={{marginLeft: collapsed ? 0 : "auto"}}>
                                <Button
                                    type="text"
                                    icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                                    onClick={() => setCollapsed(!collapsed)}
                                    style={{fontSize: "16px", width: 64, height: 64}}
                                />
                            </div>
                        </div>
                        <Menu
                            style={{background: "transparent", border: "none"}}
                            mode="inline"
                            selectedKeys={selectedTab ? [selectedTab] : []} // Показываем `selectedTab` только если он задан
                            onClick={handleMenuClick}
                            items={menuItems}
                        />
                    </Sider>
                )}

                <Layout>
                    {user && !["/login", "/register"].includes(window.location.pathname) && (
                        <HeaderApp
                            collapsed={collapsed}
                            setCollapsed={setCollapsed}
                            selectedTab={selectedTab}
                        />
                    )}
                    <Content
                        style={{
                            margin: "24px 16px",
                            minHeight: 280,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Routes>
                            <Route path="/login" element={<LoginPage/>}/>
                            <Route path="/register" element={<RegisterPage/>}/>
                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute roles={["Admin", "User"]}>
                                        <div>Добро пожаловать в Аналитику</div>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/orders"
                                element={
                                    <ProtectedRoute roles={["Admin", "User"]}>
                                        <OrdersPage/>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/products"
                                element={
                                    <ProtectedRoute roles={["Admin", "User"]}>
                                        <ProductsPage/>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/admin"
                                element={
                                    <ProtectedRoute roles={["Admin"]}>
                                        <AdminPage/>
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="*" element={<Navigate to="/login" replace/>}/>
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default App;
