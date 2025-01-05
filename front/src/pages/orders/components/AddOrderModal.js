import React, {useEffect, useState} from 'react';
import {Button, DatePicker, Divider, Drawer, Form, InputNumber, Select, Space, notification, Input} from 'antd';
import ProductTableWithParts from './ProductTableWithParts';
import moment from 'moment';

const {Option} = Select;

const AddOrderModal = ({visible, onCancel, onSubmit, order}) => {
    const [form] = Form.useForm();
    const [orderSelectedProducts, setOrderSelectedProducts] = useState([]); // Список выбранных товаров в заказе
    const [originalTotalAmount, setOriginalTotalAmount] = useState(0); // Общая стоимость товаров без учета скидки
    const [totalAmount, setTotalAmount] = useState(0); // Итоговая сумма заказа с учетом скидки
    const [discount, setDiscount] = useState(0); // Текущая скидка

    // Вычисляем дату через 3 дня
    const threeDaysLater = moment().add(3, 'days');

    // Функция для вычисления общей стоимости товаров на основе их цены и количества
    const calculateTotalAmount = (products) =>
        products.reduce((total, product) => total + (product.price || 0) * (product.quantity || 1), 0);

    // Пересчет суммы при изменении списка товаров
    useEffect(() => {
        const newOriginalTotal = calculateTotalAmount(orderSelectedProducts);
        setOriginalTotalAmount(newOriginalTotal);
        setTotalAmount(newOriginalTotal - discount);
    }, [orderSelectedProducts, discount]);

    // Заполнение полей формы при редактировании
    useEffect(() => {
        if (order) {
            form.setFieldsValue({
                ...order,
                prepayment: order.prepayment ? parseFloat(order.prepayment) : 0,
                discount: order.discount ? parseFloat(order.discount) : 0,
                orderDate: order.orderDate && order.orderDate.length === 2
                    ? [moment(order.orderDate[0]), moment(order.orderDate[1])]
                    : [], // Если даты нет, устанавливаем пустой массив
            });
            setOrderSelectedProducts(order.products || []);
            setTotalAmount(order.totalAmount || 0);
            setDiscount(parseFloat(order.discount || 0));
        } else {
            form.resetFields();
            setOrderSelectedProducts([]);
            setTotalAmount(0);
            setDiscount(0);
        }
    }, [order, form]);


    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const formattedOrderDate = values.orderDate && values.orderDate.length === 2
                ? [values.orderDate[0].format('YYYY-MM-DD'), values.orderDate[1].format('YYYY-MM-DD')]
                : [];

            const orderData = {
                ...values,
                products: orderSelectedProducts,
                totalAmount,
                orderDate: formattedOrderDate,
                prepayment: parseFloat(values.prepayment || 0),
                discount: parseFloat(values.discount || 0),
            };

            console.log('Сохранение заказа:', orderData);
            onSubmit(orderData);
            onCancel();
        } catch (error) {
            console.error('Ошибка валидации формы:', error);
        }
    };


    const handleCancel = () => {
        form.resetFields();
        setOrderSelectedProducts([]);
        setDiscount(0);
        onCancel();
    };

    const handleFieldChange = (changedValues) => {
        const {discount: newDiscount} = changedValues;

        if (newDiscount !== undefined) {
            const parsedDiscount = parseFloat(newDiscount) || 0;
            setDiscount(parsedDiscount);
            setTotalAmount(originalTotalAmount - parsedDiscount);
        }
    };

    const formItemLayout = {
        labelCol: {span: 10},
        wrapperCol: {span: 14},
    };

    return (
        <Drawer
            title={order ? 'Редактировать заказ' : 'Новый заказ'} // Меняем заголовок
            width={720}
            onClose={handleCancel}
            open={visible}
            bodyStyle={{paddingBottom: 80}}
            footer={`Общая стоимость заказа: ${totalAmount}р`} // Отображение итоговой суммы
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
                    orderResponsible: 'Евгений Г.',  // Устанавливаем значение по умолчанию для "Ответственного"
                    priority: 'Обычный',  // Устанавливаем значение по умолчанию для "Приоритета"
                    orderStatus: 'Новый заказ',
                    orderDate: [moment(), threeDaysLater],  // Устанавливаем значения по умолчанию: сегодня и через 3 дня
                    orderSource: 'Avito',

                }}
                labelAlign="left"
                size="small"
                onValuesChange={handleFieldChange} // Обработчик изменения значений формы
            >
                <Divider orientation="left" orientationMargin="0">Детали заказа</Divider>
                <Form.Item
                    style={{marginBottom: '10px'}} // Устанавливаем отступ
                    name="orderResponsible"
                    label="Ответственный"
                    rules={[{required: false, message: 'Выберите ответственного'}]}
                >
                    <Select placeholder="...">
                        <Option value="Евгений Г.">Евгений Г.</Option>
                        <Option value="Артём Б.">Артём Б.</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}} // Устанавливаем отступ
                    name="priority"
                    label="Приоритет"
                    rules={[{required: false, message: 'Выберите приоритет'}]}
                >
                    <Select placeholder="...">
                        <Option value="Обычный">Обычный</Option>
                        <Option value="Сегодня">Сегодня</Option>
                        <Option value="Срочно">Срочно</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}} // Устанавливаем отступ
                    name="orderStatus"
                    label="Статус заказа"
                    rules={[{required: false, message: 'Выберите статус'}]}
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
                    style={{marginBottom: '10px'}} // Устанавливаем отступ
                    name="orderDate"
                    label="Дата заказа / отправки"
                    rules={[{required: false, message: 'Выберите дату'}]}
                >
                    <DatePicker.RangePicker style={{width: '100%'}}/>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}} // Устанавливаем отступ
                    name="orderSource"
                    label="Источник заказа"
                    rules={[{required: false, message: 'Укажите источник заказа'}]}
                >
                    <Select placeholder="...">
                        <Option value="Avito">Avito</Option>
                        <Option value="Звонок">Звонок</Option>
                        <Option value="Другое">Другое</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}} // Устанавливаем отступ
                    name="deliveryType"
                    label="Доставка / самовывоз"
                    rules={[{required: false, message: 'Укажите способ доставки'}]}
                >
                    <Select placeholder="...">
                        <Option value="Доставка Avito">Доставка Avito</Option>
                        <Option value="Самовывоз">Самовывоз</Option>
                        <Option value="Доставка нашими силами">Доставка нашими силами</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}} // Устанавливаем отступ
                    name="deliveryAddress"
                    label="Адрес доставки"
                    rules={[{required: false, message: 'Укажите адрес доставки'}]}
                >
                    <Input placeholder="..."/>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}} // Устанавливаем отступ
                    name="pickupPoint"
                    label="ПВЗ"
                    rules={[{required: false, message: 'Укажите ПВЗ'}]}
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
                    style={{marginBottom: '10px'}} // Устанавливаем отступ
                    name="trackingNumber"
                    label="Номер отправления"
                    rules={[{required: false, message: 'Укажите номер отправления'}]}
                >
                    <Input placeholder="..."/>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}} // Устанавливаем отступ
                    name="avitoLink"
                    label="Ссылка на заказ в Авито"
                    rules={[{required: false, message: 'Укажите ссылку'}]}
                >
                    <Input placeholder="..."/>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}} // Устанавливаем отступ
                    name="avitoProfileLink"
                    label="Ссылка на профиль Авито"
                    rules={[{required: false, message: 'Укажите ссылку на профиль'}]}
                >
                    <Input placeholder="..."/>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}}
                    name="prepayment"
                    label="Предоплата"
                    rules={[
                        {required: false, message: 'Укажите сумму предоплаты'},
                        {type: 'number', min: 0, message: 'Введите положительное число'}, // Тип данных должен быть числовым
                    ]}
                >
                    <Input type="number" placeholder="..."/>
                </Form.Item>


                <Form.Item
                    style={{marginBottom: '10px'}} // Устанавливаем отступ
                    name="discount"
                    label="Скидка"
                >
                    <Input placeholder="0"/>
                </Form.Item>

                <Form.Item
                    style={{marginBottom: '10px'}} // Устанавливаем отступ
                    name="totalAmount"
                    label="Общая стоимость заказа"
                >
                    <Input placeholder={totalAmount.toString()} disabled/>
                </Form.Item>

                <Divider orientation="left" orientationMargin="0">Товары в заказе</Divider>
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
