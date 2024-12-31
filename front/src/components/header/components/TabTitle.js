// src/components/TabTitle.js
import React from 'react';

// Объект с названиями вкладок
const tabNames = {
    '1': 'Аналитика',
    '2': 'Заказы',
    '3': 'Контакты',
    '4': 'Товары',
    '5': 'Список задач',
};
const TabTitle = ({ selectedTab }) => {
  return (
    <span style={{ fontSize: '20px', marginLeft: '16px' }}>
      {tabNames[selectedTab]} {/* Отображаем название вкладки */}
    </span>
  );
};

export default TabTitle;
