import React, { useEffect, useState } from 'react';
import { Layout, notification } from 'antd';
import { getOrders, createOrder, updateOrder, checkShortages } from './OrdersService';
import OrdersHeader from "./components/OrdersHeaders";
import AddOrderModal from "./components/AddOrderModal";
import OrdersTable from "./components/ProTable";

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [showModalAddOrder, setShowModalAddOrder] = useState(false);
    const [shortages, setShortages] = useState([]); // Недостающие детали

    // Загрузка заказов
    const fetchOrders = async () => {
        try {
            const ordersData = await getOrders();
            setOrders(ordersData);
        } catch (error) {
            notification.error({ message: 'Ошибка загрузки заказов', description: error.toString() });
        }
    };

    // Загрузка недостающих деталей
    const fetchShortages = async () => {
        try {
            const shortagesData = await checkShortages();
            setShortages(shortagesData);
        } catch (error) {
            notification.error({ message: 'Ошибка загрузки недостающих деталей', description: error.toString() });
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchShortages();
    }, []);

    // Функция для добавления нового заказа
    const handleAddOrder = async (orderData) => {
        try {
            await createOrder(orderData);
            notification.success({ message: 'Заказ успешно добавлен' });
            setShowModalAddOrder(false);
            await fetchOrders(); // Обновляем заказы
            await fetchShortages(); // Обновляем недостающие детали
        } catch (error) {
            notification.error({ message: 'Ошибка добавления заказа', description: error.toString() });
        }
    };

    // Обновление статуса заказа
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await updateOrder(orderId, { orderStatus: newStatus });
            notification.success({ message: 'Статус заказа обновлён' });
            await fetchOrders(); // Обновляем заказы
            await fetchShortages(); // Обновляем недостающие детали
        } catch (error) {
            notification.error({ message: 'Ошибка обновления статуса', description: error.toString() });
        }
    };

    // Вывод недостающих деталей
    const renderShortages = () => {
        if (shortages.length === 0) return <p>Все детали в наличии</p>;
        return shortages.map((shortage) => (
            <p key={shortage.part}>
                <strong>{shortage.part}</strong>: требуется {shortage.needed}, доступно {shortage.available}, нехватка {shortage.shortage}.
            </p>
        ));
    };

    return (
        <Layout.Content style={{ padding: '24px' }}>
            <OrdersHeader setShowModal={setShowModalAddOrder} />
            <OrdersTable
                orders={orders}
                onUpdateStatus={handleUpdateOrderStatus} // Передаём обработчик изменения статуса
                style={{ marginTop: '20px' }}
            />
            <AddOrderModal
                visible={showModalAddOrder}
                onCancel={() => setShowModalAddOrder(false)}
                onSubmit={handleAddOrder}
            />
            <div style={{ marginTop: '20px' }}>
                <h2>Недостающие детали</h2>
                {renderShortages()}
            </div>
        </Layout.Content>
    );
};

export default OrdersPage;
