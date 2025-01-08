import React from "react";
import {Layout} from "antd";
import TabTitle from "./components/TabTitle"; // Компонент для названия вкладки
import UserPanel from "./components/UserPanel"; // Компонент UserPanel

const {Header} = Layout;

const HeaderApp = ({collapsed, setCollapsed, selectedTab, tabNames, onThemeChange}) => {
    return (
        <Header
            style={{
                padding: '0 40px',
                background: "var(--headerBg)", // Используем переменную темы
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            {/* Отображение текущей вкладки */}
            <TabTitle selectedTab={selectedTab} tabNames={tabNames}/>

            {/* Панель пользователя */}
            <UserPanel onThemeChange={onThemeChange}/>
        </Header>
    );
};

export default HeaderApp;
