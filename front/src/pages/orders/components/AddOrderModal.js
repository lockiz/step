import React, {useEffect, useState} from 'react';
import {Button, DatePicker, Divider, Drawer, Form, InputNumber, Select, Space, notification, Input} from 'antd';
import ProductTableWithParts from './ProductTableWithParts';
import moment from 'moment';
import dayjs from 'dayjs';

const {Option} = Select;

const AddOrderModal = ({visible, onCancel, onSubmit, order}) => {
    const [form] = Form.useForm();
    const [orderSelectedProducts, setOrderSelectedProducts] = useState([]); // Список выбранных товаров
    const [originalTotalAmount, setOriginalTotalAmount] = useState(0); // Общая стоимость без скидки
    const [totalAmount, setTotalAmount] = useState(0);  // Итоговая сумма с учётом скидки
    const [discount, setDiscount] = useState(0);

    // Подсчёт общей стоимости
    const calculateTotalAmount = (products) =>
        products.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

    // Пересчитываем сумму при изменении списка товаров или скидки
    useEffect(() => {
        const newOriginalTotal = calculateTotalAmount(orderSelectedProducts);
        setOriginalTotalAmount(newOriginalTotal);
        setTotalAmount(newOriginalTotal - discount);
    }, [orderSelectedProducts, discount]);

    // При открытии модалки или смене `order` заполняем форму
    useEffect(() => {
        if (order) {
            // Редактирование
            form.setFieldsValue({
                ...order,
                prepayment: parseFloat(order.prepayment || 0),
                discount: parseFloat(order.discount || 0),
                orderDate: Array.isArray(order.order_date) && order.order_date.length === 2
                    ? [dayjs(order.order_date[0], 'YYYY-MM-DD'), dayjs(order.order_date[1], 'YYYY-MM-DD')]
                    : [],
                deliveryType: order.delivery_type,
                deliveryAddress: order.delivery_address,
                pickupPoint: order.pickup_point,
                trackingNumber: order.tracking_number,
                avitoLink: order.avito_link,
                avitoProfileLink: order.avito_profile_link,
                orderStatus: order.order_status,
                totalAmount: order.total_amount,
            });
            setOrderSelectedProducts(order.products || []);
            setTotalAmount(order.totalAmount || 0);
            setDiscount(parseFloat(order.discount || 0));
        } else {
            // Новый заказ
            form.resetFields();
            setOrderSelectedProducts([]);
            setTotalAmount(0);
            setDiscount(0);
        }
    }, [order, form]);

    // Сохранение заказа (и при создании, и при редактировании)
    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const formattedOrderDate =
                values.orderDate && values.orderDate.length === 2
                    ? [values.orderDate[0].format('YYYY-MM-DD'), values.orderDate[1].format('YYYY-MM-DD')]
                    : [];

            // ГАРАНТИРУЕМ, что поле products – это массив:
            const orderData = {
                ...values,
                products: Array.isArray(orderSelectedProducts) ? orderSelectedProducts : [],
                totalAmount,
                orderDate: formattedOrderDate,
                prepayment: parseFloat(values.prepayment || 0),
                discount: parseFloat(values.discount || 0),
            };

            console.log('Сохранение заказа:', orderData);
            onSubmit(orderData);  // передаём наружу
            onCancel();           // закрываем модалку
        } catch (error) {
            console.error('Ошибка валидации формы:', error);
            notification.error({
                message: 'Ошибка',
                description: 'Не удалось сохранить заказ.'
            });
        }
    };

    // Отмена
    const handleCancel = () => {
        form.resetFields();
        setOrderSelectedProducts([]);
        setDiscount(0);
        onCancel();
    };

    // Слежение за изменением полей (например, скидки)
    const handleFieldChange = (changedValues) => {
        const {discount: newDiscount} = changedValues;
        if (newDiscount !== undefined) {
            const parsed = parseFloat(newDiscount) || 0;
            setDiscount(parsed);
            setTotalAmount(originalTotalAmount - parsed);
        }
    };

    const formItemLayout = {
        labelCol: {span: 10},
        wrapperCol: {span: 14},
    };

    return (
        <Drawer
            title={order ? 'Редактировать заказ' : 'Новый заказ'}
            width={720}
            onClose={handleCancel}
            open={visible}
            bodyStyle={{paddingBottom: 80}}
            footer={`Общая стоимость заказа: ${totalAmount}р`}
            extra={
                <Space>
                    <Button onClick={handleCancel}>Отмена</Button>
                    <Button onClick={handleSave} type="primary">
                        {order ? 'Сохранить' : 'Добавить'}
                    </Button>
                </Space>
            }
        >
            <Form
                {...formItemLayout}
                form={form}
                initialValues={{
                    remember: true,
                    size: 'small',
                    orderResponsible: 'Евгений Г.',
                    priority: 'Обычный',
                    orderStatus: 'Новый заказ',
                    orderDate: [dayjs(), dayjs().add(3, 'day')],
                    orderSource: 'Avito',
                }}
                labelAlign="left"
                size="small"
                onValuesChange={handleFieldChange}
            >
                <Divider orientation="left" orientationMargin="0">
                    Детали заказа
                </Divider>
                <Form.Item
                    style={{marginBottom: '10px'}}
                    name="orderResponsible"
                    label="Ответственный"
                >
                    <Select placeholder="...">
                        <Option value="Евгений Г.">Евгений Г.</Option>
                        <Option value="Артём Б.">Артём Б.</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}}
                    name="priority"
                    label="Приоритет"
                >
                    <Select placeholder="...">
                        <Option value="Обычный">Обычный</Option>
                        <Option value="Сегодня">Сегодня</Option>
                        <Option value="Срочно">Срочно</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}}
                    name="orderStatus"
                    label="Статус заказа"
                >
                    <Select placeholder="...">
                        <Option value="Новый заказ">Новый заказ</Option>
                        <Option value="Ожидание">Ожидание</Option>
                        <Option value="Собран">Собран</Option>
                        <Option value="В доставке">В доставке</Option>
                        <Option value="Клиент получил">Клиент получил</Option>
                        <Option value="Выполнен">Выполнен</Option>
                        <Option value="Отменён">Отменён</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}}
                    name="orderDate"
                    label="Дата заказа / отправки"
                >
                    <DatePicker.RangePicker disabled={[order ? true : false, false]} style={{width: '100%'}}/>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}}
                    name="orderSource"
                    label="Источник заказа"
                >
                    <Select placeholder="...">
                        <Option value="Avito">Avito</Option>
                        <Option value="Звонок">Звонок</Option>
                        <Option value="Другое">Другое</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}}
                    name="deliveryType"
                    label="Доставка / самовывоз"
                >
                    <Select placeholder="...">
                        <Option value="Доставка Avito">Доставка Avito</Option>
                        <Option value="Самовывоз">Самовывоз</Option>
                        <Option value="Доставка нашими силами">Доставка нашими силами</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}}
                    name="deliveryAddress"
                    label="Адрес доставки"
                >
                    <Input placeholder="..."/>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}}
                    name="pickupPoint"
                    label="ПВЗ"
                >
                    <Select placeholder="...">
                        <Option value="Avito">Avito</Option>
                        <Option value="Яндекс Доставка">Яндекс Доставка</Option>
                        <Option value="DPD">DPD</Option>
                        <Option value="Почта России">Почта России</Option>
                        <Option value="SDEK">SDEK</Option>
                        <Option value="5post">5post</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}}
                    name="trackingNumber"
                    label="Номер отправления"
                >
                    <Input placeholder="..."/>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}}
                    name="avitoLink"
                    label="Ссылка на заказ в Авито"
                >
                    <Input placeholder="..."/>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}}
                    name="avitoProfileLink"
                    label="Ссылка на профиль Авито"
                >
                    <Input placeholder="..."/>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}}
                    name="prepayment"
                    label="Предоплата"
                    rules={[
                        {type: 'number', min: 0, message: 'Введите положительное число'},
                    ]}
                >
                    <Input type="number" placeholder="..."/>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}}
                    name="discount"
                    label="Скидка"
                >
                    <Input placeholder="0"/>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}}
                    name="totalAmount"
                    label="Общая стоимость заказа"
                >
                    <Input placeholder={totalAmount.toString()} disabled/>
                </Form.Item>

                <Divider orientation="left" orientationMargin="0">
                    Товары в заказе
                </Divider>

                <ProductTableWithParts
                    selectedProducts={orderSelectedProducts}
                    setSelectedProducts={setOrderSelectedProducts}
                    visible={visible}
                />
            </Form>
        </Drawer>
    );
};

export default AddOrderModal;
