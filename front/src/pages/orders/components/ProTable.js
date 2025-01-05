import React, {useEffect, useState} from "react";
import ProTable from "@ant-design/pro-table";
import {Tag, Tooltip, Badge, Space, Button} from "antd";
import {getOrders} from "../OrdersService"; // Импортируем вашу функцию
import dayjs from "dayjs"; // Импортируем библиотеку для работы с датами
import "dayjs/locale/ru"; // Добавляем русский язык для дат
import {ConfigProvider} from 'antd';
import ruRU from 'antd/lib/locale/ru_RU';


dayjs.locale("ru");

const statuses = {
    'Новый заказ': "Новый заказ",
    'В доставке': "В доставке",
    'Клиент получил': "Клиент получил",
    'Отказ': "Отказ",
    'Выполнен': "Выполнен",
};

const OrdersTable = ({onEditOrder}) => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getOrders();
                setOrders(data);
                console.log(data)
            } catch (error) {
                console.error("Ошибка при загрузке заказов:", error);
            }
        };
        fetchOrders();
    }, []);

    const columns = [
        {
            title: "Тег статуса",
            dataIndex: "order_status",
            key: "order_status",
            filters: Object.entries(statuses).map(([key, label]) => ({
                text: label,
                value: key,
            })),
            onFilter: (value, record) => record.order_status.includes(value),
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
            dataIndex: "order_date",
            key: "order_date",
            render: (dates) => dayjs(dates[1]).format("D MMM"), // Форматируем дату как "24 янв." или "31 дек."
            default: true, // Показывать по умолчанию
        },
        {
            title: "Доставка",
            dataIndex: "delivery_type",
            key: "delivery_type",
            default: true, // Показывать по умолчанию
        },
        {
            title: "Пункт выдачи",
            dataIndex: "pickup_point",
            key: "pickup_point",
            default: true, // Показывать по умолчанию
        },
        {
            title: "Номер отправления",
            dataIndex: "tracking_number",
            key: "tracking_number",
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
                                    src={`http://localhost:5001/static/uploads/${product.photo}`}
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
            dataIndex: "total_amount",
            key: "total_amount",
            render: (value) => `${value} ₽`,
            default: true, // Показывать по умолчанию
        },
        {
            title: "Ответственный",
            dataIndex: "order_responsible",
            key: "order_responsible",
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
            dataIndex: "order_source",
            key: "order_source",
            default: false, // Скрыть по умолчанию
        },
        {
            title: "Ссылка на заказ",
            dataIndex: "avito_link",
            key: "avito_link",
            default: false, // Скрыть по умолчанию
        },
        {
            title: "Ссылка на профиль Авито",
            dataIndex: "avito_profile_link",
            key: "avito_profile_link",
            render: (link) => (link ? <a href={link} target="_blank" rel="noopener noreferrer">{link}</a> : "—"),
            default: false,
        },
        {
            title: "Адрес доставки",
            dataIndex: "delivery_address",
            key: "delivery_address",
            default: false,
        },
        {
            title: "Предоплата",
            dataIndex: "prepayment",
            key: "prepayment",
            render: (value) => `${value} ₽`,
            default: false,
        },
        {
            title: "Скидка",
            dataIndex: "discount",
            key: "discount",
            render: (value) => `${value} ₽`,
            default: false,
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button onClick={() => onEditOrder(record)}>Редактировать</Button>
                </Space>
            ),
        }

    ];

    return (
        <ConfigProvider locale={ruRU}>
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
                        avito_profile_link: {show: false},
                        delivery_address: {show: false},
                        prepayment: {show: false},
                        discount: {show: false},
                    },
                    persistenceKey: "orders-table", // Ключ для сохранения состояния
                    persistenceType: "localStorage", // Сохраняем настройки в localStorage,
                }}
            />
        </ConfigProvider>
    );
};

export default OrdersTable;
