// src/components/TabTitle.js
import React from 'react';

// Объект с названиями вкладок
const tabNames = {
    '1': 'АНАЛИТИКА',
    '2': 'ЗАКАЗЫ',
    '3': 'НАЛИЧИЕ',
    '4': 'ЗАКУПКИ',
    '5': 'АДМИНИСТРИРОВАНИЕ',
};
const TabTitle = ({ selectedTab }) => {
  return (
    <span style={{ fontSize: '20px', marginLeft: '16px' }}>
      {tabNames[selectedTab]} {/* Отображаем название вкладки */}
    </span>
  );
};

export default TabTitle;
