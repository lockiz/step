import React, {useEffect, useState} from 'react';
import {Button, DatePicker, Divider, Drawer, Form, Input, Select, Space, notification, ConfigProvider} from 'antd';
import ProductTableWithParts from "./ProductTableWithParts";
import moment from 'moment'; // Для работы с датами


const {Option} = Select;

const AddOrderModal = ({visible, onCancel, onSubmit}) => {
    const [form] = Form.useForm();
    const [orderSelectedProducts, setOrderSelectedProducts] = useState([]); // Список выбранных товаров в заказе
    const [originalTotalAmount, setOriginalTotalAmount] = useState(0); // Общая стоимость товаров без учета скидки
    const [totalAmount, setTotalAmount] = useState(0); // Итоговая сумма заказа с учетом скидки
    const [discount, setDiscount] = useState(0); // Текущая скидка
    // Вычисляем дату через 3 дня
    const threeDaysLater = moment().add(3, 'days');

    // Функция для вычисления общей стоимости товаров на основе их цены и количества
    const calculateTotalAmount = (products) => {
        return products.reduce((total, product) => {
            return total + (product.price || 0) * (product.quantity || 1);
        }, 0);
    };

    // Используем useEffect для пересчета суммы при изменении списка товаров
    useEffect(() => {
        const newOriginalTotal = calculateTotalAmount(orderSelectedProducts); // Считаем сумму товаров
        setOriginalTotalAmount(newOriginalTotal); // Обновляем исходную сумму товаров
        setTotalAmount(newOriginalTotal - discount); // Пересчитываем итоговую сумму с учетом скидки
    }, [orderSelectedProducts]); // Срабатывает при изменении списка товаров

    // Обработчик кнопки "Добавить" для валидации формы и сброса полей после отправки данных
    const handleAdd = () => {
        // Проверяем, что в заказе есть выбранные товары
        if (orderSelectedProducts.length === 0) {
            // Если товаров нет, показываем ошибку
            notification.error({
                message: 'Ошибка',
                description: 'Пожалуйста, выберите хотя бы один товар для создания заказа.',
                showProgress: true,
                pauseOnHover: false,
                placement: 'bottomRight',
            });
            return;
        }

        // Валидируем другие поля формы
        form.validateFields()
            .then((values) => {
                const formattedOrderDate = values.orderDate.map(date => date.format('YYYY-MM-DD'));
                const orderData = {
                    ...values,
                    products: orderSelectedProducts,
                    totalAmount,
                    orderDate: formattedOrderDate,
                    prepayment: parseFloat(values.prepayment || 0),
                    discount: parseFloat(values.discount || 0),
                };
                console.log('Добавленный заказ:', orderData);
                onSubmit(orderData);
                form.resetFields();
                notification.success({
                    message: 'Успех',
                    description: 'Заказ был успешно добавлен!',
                    showProgress: true,
                    pauseOnHover: false,
                    placement: 'bottomRight',
                });
                setOrderSelectedProducts([]);
                setDiscount(0);
            })
            .catch((info) => console.log('Validation Failed:', info));
    };


    // Обработчик кнопки "Отмена" для сброса всех данных и закрытия формы
    const handleCancel = () => {
        form.resetFields();
        setOrderSelectedProducts([]);
        setDiscount(0);
        onCancel();
    };

    // Обработчик изменения полей формы
    const handleFieldChange = (changedValues) => {
        const {discount: newDiscount, totalAmount: newTotalAmount} = changedValues;

        // Если изменено поле "Скидка"
        if (newDiscount !== undefined) {
            const parsedDiscount = parseFloat(newDiscount) || 0; // Преобразуем скидку в число
            setDiscount(parsedDiscount); // Обновляем состояние скидки
            setTotalAmount(originalTotalAmount - parsedDiscount); // Пересчитываем итоговую сумму
        }
        // Если изменено поле "Общая стоимость заказа"
        else if (newTotalAmount !== undefined) {
            const parsedTotalAmount = parseFloat(newTotalAmount) || 0; // Преобразуем сумму в число
            const recalculatedDiscount = originalTotalAmount - parsedTotalAmount; // Пересчитываем скидку
            setDiscount(recalculatedDiscount >= 0 ? recalculatedDiscount : 0); // Обновляем скидку, если она не отрицательна
        }
    };

    const formItemLayout = {
        labelCol: {span: 10}, // Настройка ширины метки
        wrapperCol: {span: 14}, // Настройка ширины поля ввода
    };

    return (
        <Drawer
            title="Новый заказ"
            width={720}
            onClose={handleCancel}
            open={visible}
            bodyStyle={{paddingBottom: 80}}
            footer={`Общая стоимость заказа: ${totalAmount}р`} // Отображение итоговой суммы
            extra={
                <Space>
                    <Button onClick={handleCancel}>Отмена</Button>
                    <Button onClick={handleAdd} type="primary">
                        Добавить
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
                    style={{marginBottom: '10px'}} // Устанавливаем отступ
                    name="prepayment"
                    label="Предоплата"
                    rules={[
                        {required: false, message: 'Укажите сумму предоплаты'},
                        { type: 'integer', min: 0, message: 'Введите положительное число' }

                    ]}
                >
                    <Input placeholder="..."/>
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
