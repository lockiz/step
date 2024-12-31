import {Breadcrumb, Button, Input} from 'antd';
import React from 'react';

// Компонент для отображения заголовка страницы "Заказы" с поиском и кнопкой
const OrdersHeader = ({setShowModal}) => {
    return (
        <div
            style={{
                display: 'flex', // Flexbox для горизонтального расположения
                justifyContent: 'space-between', // Разделение элементов по краям
                alignItems: 'center', // Выравнивание элементов по вертикали
                marginBottom: '24px'
            }}
        >
            {/* Левая секция: Хлебные крошки (Breadcrumb) */}
            <Breadcrumb
                items={[
                    {
                        title: <a href="">Главная</a>, // Ссылка на главную страницу
                    },
                    {
                        title: 'Заказы', // Название текущей страницы
                    },
                ]}
            />

            {/* Правая секция: Поиск и кнопка добавления */}
            <div
                style={{
                    display: 'flex', // Flexbox для выравнивания элементов
                    alignItems: 'center', // Выравнивание по вертикали
                    gap: '16px', // Промежуток между поиском и кнопкой
                }}
            >
                {/* Поле для поиска заказов */}
                <Input.Search
                    placeholder="Поиск заказа" // Подсказка в поле поиска
                    style={{
                        width: 250, // Ширина поля поиска
                    }}
                />
                {/* Кнопка для добавления нового заказа */}
                <Button
                    type="primary"
                    onClick={() => setShowModal(true)}
                >
                    Добавить заказ
                </Button>
            </div>
        </div>
    );
};

export default OrdersHeader;
