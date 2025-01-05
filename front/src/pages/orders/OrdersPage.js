import React, {useEffect, useState} from 'react';
import {Layout, notification, Card, Statistic, Typography} from 'antd';
import {getOrders, createOrder, updateOrder, calculateShortages} from './OrdersService';
import OrdersHeader from './components/OrdersHeaders';
import AddOrderModal from './components/AddOrderModal';
import OrdersTable from './components/ProTable';

const {Title} = Typography;

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [showModalAddOrder, setShowModalAddOrder] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null); // Состояние для редактируемого заказа
    const [shortages, setShortages] = useState([]); // Недостающие детали
    const [totalOrders, setTotalOrders] = useState(0); // Общее количество заказов

    // Загрузка заказов
    const fetchOrders = async () => {
        try {
            const ordersData = await getOrders();
            setOrders(ordersData);
            setTotalOrders(ordersData.length); // Устанавливаем общее количество заказов
        } catch (error) {
            notification.error({message: 'Ошибка загрузки заказов', description: error.toString()});
        }
    };

    // Загрузка недостающих деталей
    const fetchShortages = async () => {
        try {
            const shortagesData = await calculateShortages();
            setShortages(shortagesData);
        } catch (error) {
            notification.error({
                message: 'Ошибка загрузки недостающих деталей',
                description: error.toString(),
            });
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchShortages();
    }, []);

    // Открытие модального окна для редактирования заказа
    const handleEditOrder = (order) => {
        setEditingOrder(order);
        setShowModalAddOrder(true);
    };

    // Функция для добавления или обновления заказа
    const handleSaveOrder = async (orderData) => {
        try {
            if (editingOrder) {
                await updateOrder(editingOrder.id, orderData); // Обновление заказа
                notification.success({message: 'Заказ успешно обновлён'});
            } else {
                await createOrder(orderData); // Создание нового заказа
                notification.success({message: 'Заказ успешно добавлен'});
            }

            setShowModalAddOrder(false);
            setEditingOrder(null);
            await fetchOrders(); // Обновляем заказы
            await fetchShortages(); // Обновляем недостающие детали
        } catch (error) {
            notification.error({message: 'Ошибка сохранения заказа', description: error.toString()});
        }
    };


    return (
        <Layout.Content style={{padding: '24px'}}>
            <OrdersHeader setShowModal={setShowModalAddOrder}/>
            <OrdersTable
                orders={orders}
                onEditOrder={handleEditOrder} // Передаём обработчик редактирования
                style={{marginTop: '20px'}}
            />
            <AddOrderModal
                visible={showModalAddOrder}
                onCancel={() => {
                    setShowModalAddOrder(false);
                    setEditingOrder(null); // Сбрасываем редактируемый заказ
                }}
                onSubmit={handleSaveOrder} // Обработчик сохранения
                order={editingOrder} // Передаем редактируемый заказ
            />

            {/* Раздел для статистики */}
            <div style={{marginTop: '20px'}}>
                <Title level={2}>Статистика заказов и недостающих деталей</Title>

                <div style={{display: 'flex', gap: '16px', marginTop: '16px'}}>
                    <Card style={{flex: 1}}>
                        <Statistic title="Всего заказов" value={totalOrders} suffix="шт."/>
                    </Card>
                    <Card title="Недостающие детали" style={{flex: 1}}>
                        {shortages.length === 0 ? (
                            <p>Все детали в наличии.</p>
                        ) : (
                            <ul>
                                {shortages.map((shortage) => (
                                    <li key={shortage.name}>
                                        {shortage.name}: нужно дополнительно {shortage.needed} шт.
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>
            </div>
        </Layout.Content>
    );
};

export default OrdersPage;
