import React, { useEffect, useState } from "react";
import ProTable from "@ant-design/pro-table";
import { Tag, Tooltip, Badge, Space, Select, notification } from "antd";
import { getOrders, updateOrder, checkShortages } from "../OrdersService";
import dayjs from "dayjs";
import "dayjs/locale/ru";

dayjs.locale("ru");

const statuses = {
    'Новый заказ': "Новый заказ",
    'Собран': "Собран",
    'В доставке': "В доставке",
    'Клиент получил': "Клиент получил",
    'Отказ': "Отказ",
    'Выполнен': "Выполнен",
};

const OrdersTable = () => {
    const [orders, setOrders] = useState([]);
    const [shortages, setShortages] = useState([]); // Для данных о недостающих деталях

    // Загрузка заказов и недостающих деталей
    const fetchOrdersAndShortages = async () => {
        try {
            const ordersData = await getOrders();
            const shortagesData = await checkShortages();
            setOrders(ordersData);
            setShortages(shortagesData);
        } catch (error) {
            console.error("Ошибка при загрузке данных:", error);
            notification.error({ message: "Ошибка загрузки данных", description: error.toString() });
        }
    };

    useEffect(() => {
        fetchOrdersAndShortages();
    }, []);

    // Проверка недостающих деталей для заказа
    const isShortage = (products) => {
        return products.some(product => {
            const shortage = shortages.find(s => s.part === product.name);
            return shortage && shortage.shortage > 0;
        });
    };

    // Обновление статуса заказа
    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrder(orderId, { orderStatus: newStatus });
            notification.success({ message: "Статус заказа обновлён" });
            fetchOrdersAndShortages(); // Обновляем заказы и недостающие детали
        } catch (error) {
            console.error("Ошибка обновления статуса заказа:", error);
            notification.error({ message: "Ошибка обновления статуса", description: error.toString() });
        }
    };

    const columns = [
        {
            title: "Тег статуса",
            dataIndex: "orderStatus",
            key: "orderStatus",
            filters: Object.entries(statuses).map(([key, label]) => ({
                text: label,
                value: key,
            })),
            onFilter: (value, record) => record.orderStatus.includes(value),
            render: (status, record) => (
                <Select
                    defaultValue={status}
                    style={{ width: 120 }}
                    onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
                >
                    {Object.entries(statuses).map(([key, label]) => (
                        <Select.Option key={key} value={key}>
                            {label}
                        </Select.Option>
                    ))}
                </Select>
            ),
        },
        {
            title: "Отправить до",
            dataIndex: "orderDate",
            key: "orderDate",
            render: (dates) => dayjs(dates[1]).format("D MMM"), // Форматируем дату
        },
        {
            title: "Доставка",
            dataIndex: "deliveryType",
            key: "deliveryType",
        },
        {
            title: "Пункт выдачи",
            dataIndex: "pickupPoint",
            key: "pickupPoint",
        },
        {
            title: "Номер отправления",
            dataIndex: "trackingNumber",
            key: "trackingNumber",
        },
        {
            title: "Товары",
            dataIndex: "products",
            key: "products",
            render: (products) => (
                <Space size={16} wrap>
                    {products.map((product) => (
                        <Badge
                            count={product.quantity}
                            offset={[-10, 10]}
                            style={{
                                backgroundColor: isShortage(products) ? "red" : "#108ee9",
                                color: "#fff",
                            }}
                            key={product.key}
                        >
                            <Tooltip
                                title={
                                    <>
                                        <div>Название: {product.name}</div>
                                        <div>Количество: {product.quantity} шт.</div>
                                        <div>Цена: {product.price} ₽</div>
                                    </>
                                }
                            >
                                <img
                                    src={product.photo}
                                    alt={product.name}
                                    style={{
                                        width: 50,
                                        height: 50,
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                    }}
                                />
                            </Tooltip>
                        </Badge>
                    ))}
                </Space>
            ),
        },
        {
            title: "Сумма",
            dataIndex: "totalAmount",
            key: "totalAmount",
            render: (value) => `${value} ₽`,
        },
        {
            title: "Ответственный",
            dataIndex: "orderResponsible",
            key: "orderResponsible",
        },
        {
            title: "Приоритет",
            dataIndex: "priority",
            key: "priority",
        },
        {
            title: "Источник заказа",
            dataIndex: "orderSource",
            key: "orderSource",
        },
        {
            title: "Ссылка на заказ",
            dataIndex: "avitoLink",
            key: "avitoLink",
        },
    ];

    return (
        <ProTable
            headerTitle="Список заказов"
            columns={columns}
            dataSource={orders}
            rowKey="id"
            search={false}
            options={{
                setting: true,
                fullScreen: true,
            }}
        />
    );
};

export default OrdersTable;
