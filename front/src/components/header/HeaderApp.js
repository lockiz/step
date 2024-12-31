// src/components/header/HeaderApp.js
import React from 'react';
import {Layout } from 'antd'; // Импортируем Layout, а не Header отдельно
import TabTitle from './components/TabTitle'; // Ваш компонент для отображения названия вкладки

const { Header } = Layout; // Деструктуризация Header из Layout

const AppHeader = ({ collapsed, setCollapsed, selectedTab, tabNames }) => {
  return (
    <Header
      style={{
        padding: 0,
        background: 'var(--headerBg)', // или используйте colorBgContainer из темы
      }}
    >

      {/* Отображаем название вкладки с помощью компонента TabTitle */}
      <TabTitle selectedTab={selectedTab} tabNames={tabNames} />
    </Header>
  );
};

export default AppHeader;
