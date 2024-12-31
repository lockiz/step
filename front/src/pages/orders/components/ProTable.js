import React, {useEffect, useState} from "react";
import ProTable from "@ant-design/pro-table";
import {Tag, Tooltip, Badge, Space} from "antd";
import {getOrders} from "../OrdersService"; // Импортируем вашу функцию
import dayjs from "dayjs"; // Импортируем библиотеку для работы с датами
import "dayjs/locale/ru"; // Добавляем русский язык для дат


dayjs.locale("ru");

const statuses = {
    'Новый заказ': "Новый заказ",
    'В доставке': "В доставке",
    'Клиент получил': "Клиент получил",
    'Отказ': "Отказ",
    'Выполнен': "Выполнен",
};

const OrdersTable = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getOrders();
                setOrders(data);
            } catch (error) {
                console.error("Ошибка при загрузке заказов:", error);
            }
        };
        fetchOrders();
    }, []);

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
            render: (status) => {
                const colorMap = {
                    'Новый заказ': "blue",
                    'Собран': "orange",
                    'В доставке': "purple",
                    'Клиент получил': "green",
                    'Отменён': "red",
                    'Выполнен': "grey",
                };
                return <Tag color={colorMap[status]}>{statuses[status]}</Tag>;
            },
            default: true, // Показывать по умолчанию
        },
        {
            title: "Отправить до",
            dataIndex: "orderDate",
            key: "orderDate",
            render: (dates) => dayjs(dates[1]).format("D MMM"), // Форматируем дату как "24 янв." или "31 дек."
            default: true, // Показывать по умолчанию
        },
        {
            title: "Доставка",
            dataIndex: "deliveryType",
            key: "deliveryType",
            default: true, // Показывать по умолчанию
        },
        {
            title: "Пункт выдачи",
            dataIndex: "pickupPoint",
            key: "pickupPoint",
            default: true, // Показывать по умолчанию
        },
        {
            title: "Номер отправления",
            dataIndex: "trackingNumber",
            key: "trackingNumber",
            default: true, // Показывать по умолчанию
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
                            style={{backgroundColor: "#108ee9", color: "#fff"}}
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
            default: true, // Показывать по умолчанию
        },
        {
            title: "Сумма",
            dataIndex: "totalAmount",
            key: "totalAmount",
            render: (value) => `${value} ₽`,
            default: true, // Показывать по умолчанию
        },
        {
            title: "Ответственный",
            dataIndex: "orderResponsible",
            key: "orderResponsible",
            default: false, // Скрыть по умолчанию
        },
        {
            title: "Приоритет",
            dataIndex: "priority",
            key: "priority",
            default: false, // Скрыть по умолчанию
        },
        {
            title: "Источник заказа",
            dataIndex: "orderSource",
            key: "orderSource",
            default: false, // Скрыть по умолчанию
        },
        {
            title: "Ссылка на заказ",
            dataIndex: "avitoLink",
            key: "avitoLink",
            default: false, // Скрыть по умолчанию
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
                setting: true, // Включаем настройки (шестеренку)
                search: false,
                fullScreen: true
            }}
            columnsState={{
                defaultValue: {
                    orderStatus: {show: true}, // Скрыть колонку по умолчанию
                    orderDate: {show: true}, // Отображать колонку
                    deliveryType: {show: true}, // Отображать колонку
                    pickupPoint: {show: true}, // Скрыть колонку по умолчанию
                    trackingNumber: {show: true}, // Скрыть колонку по умолчанию

                    products: {show: false}, // Скрыть колонку по умолчанию
                    totalAmount: {show: false}, // Скрыть колонку по умолчанию
                    orderResponsible: {show: false}, // Скрыть колонку по умолчанию
                    priority: {show: false}, // Скрыть колонку по умолчанию
                    orderSource: {show: false}, // Скрыть колонку по умолчанию
                    avitoLink: {show: false}, // Скрыть колонку по умолчанию
                },
                persistenceKey: "orders-table", // Ключ для сохранения состояния
                persistenceType: "localStorage", // Сохраняем настройки в localStorage,
            }}
        />
    );
};

export default OrdersTable;
