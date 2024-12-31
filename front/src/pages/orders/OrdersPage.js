import React, {useEffect, useState} from 'react';
import {Layout} from 'antd';
import {getOrders, createOrder} from './OrdersService';
import OrdersHeader from "./components/OrdersHeaders";
import AddOrderModal from "./components/AddOrderModal";
import OrdersTable from "./components/ProTable";


const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [showModalAddOrder, setShowModalAddOrder] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            const ordersData = await getOrders();
            setOrders(ordersData);
        };
        fetchOrders();
    }, []);

    // Функция для добавления нового заказа
    const handleAddOrder = async (orderData) => {
        await createOrder(orderData);
        setShowModalAddOrder(false);
        const updatedOrders = await getOrders();
        setOrders(updatedOrders);
    };

    return (

        <Layout.Content style={{padding: '24px'}}>

            <OrdersHeader setShowModal={setShowModalAddOrder}/>

            <OrdersTable style={{margin_top: '20px'}}/>

            <AddOrderModal
                visible={showModalAddOrder}
                onCancel={() => setShowModalAddOrder(false)}
                onSubmit={handleAddOrder}
            />
        </Layout.Content>
    );
};

export default OrdersPage;
