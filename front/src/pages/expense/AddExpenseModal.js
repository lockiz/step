import React, { useEffect, useState } from 'react';
import { Button, DatePicker, Drawer, Form, Input, InputNumber, Select, Space, Upload, notification } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const AddExpenseModal = ({ visible, onCancel, onSubmit, purchase }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        if (purchase) {
            form.setFieldsValue({
                ...purchase,
                date: purchase.date ? dayjs(purchase.date, 'YYYY-MM-DD') : null,
            });
            setFileList(
                purchase.photo
                    ? [
                        {
                            uid: '-1',
                            name: 'Загруженное изображение',
                            status: 'done',
                            url: purchase.photo,
                        },
                    ]
                    : []
            );
        } else {
            form.resetFields();
            setFileList([]);
        }
    }, [purchase, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const purchaseData = {
                ...values,
                date: values.date ? values.date.format('YYYY-MM-DD') : null,
                photo: fileList.length > 0 ? fileList[0].url || fileList[0].thumbUrl : null,
            };
            onSubmit(purchaseData);
            form.resetFields(); // Сбрасываем форму после сохранения
            setFileList([]);
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        }
    };

    const handleCancel = () => {
        form.resetFields(); // Сбрасываем форму при отмене
        setFileList([]);
        onCancel();
    };

    return (
        <Drawer
            title={purchase ? 'Редактировать закупку' : 'Новая закупка'}
            width={720}
            onClose={handleCancel}
            open={visible}
            footer={
                <Space>
                    <Button onClick={handleCancel}>Отмена</Button>
                    <Button type="primary" onClick={handleSave}>
                        {purchase ? 'Сохранить' : 'Добавить'}
                    </Button>
                </Space>
            }
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="name"
                    label="Название"
                    rules={[{ required: true, message: 'Введите название!' }]}
                >
                    <Input placeholder="Например, Закупка шланга" />
                </Form.Item>

                <Form.Item name="link" label="Ссылка на товар">
                    <Input placeholder="https://example.com" />
                </Form.Item>

                <Form.Item name="date" label="Дата">
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="cost" label="Стоимость">
                    <InputNumber style={{ width: '100%' }} placeholder="Введите сумму" />
                </Form.Item>

                <Form.Item
                    name="category"
                    label="Категория"
                    rules={[{ required: true, message: 'Выберите категорию!' }]}
                >
                    <Select placeholder="Выберите категорию">
                        <Option value="shlang">Закупка шланга</Option>
                        <Option value="filament">Закупка филамента</Option>
                        <Option value="ads">Оплата рекламы</Option>
                        <Option value="tools">Оплата инструмента</Option>
                        <Option value="credits">Оплата кредитов</Option>
                        <Option value="other">Другое</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="status" label="Статус закупки">
                    <Select placeholder="Выберите статус">
                        <Option value="completed">Завершено</Option>
                        <Option value="in_progress">В процессе</Option>
                        <Option value="planned">Запланировано</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="paymentStatus" label="Статус оплаты">
                    <Select placeholder="Выберите статус оплаты">
                        <Option value="paid">Оплачено</Option>
                        <Option value="partially_paid">Частично оплачено</Option>
                        <Option value="pending">Ожидает оплаты</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="priority" label="Приоритет">
                    <Select placeholder="Выберите приоритет">
                        <Option value="high">Высокий</Option>
                        <Option value="medium">Средний</Option>
                        <Option value="low">Низкий</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="notes" label="Примечания">
                    <Input.TextArea rows={4} placeholder="Дополнительная информация" />
                </Form.Item>

                <Form.Item name="photo" label="Фотография">
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                        beforeUpload={() => false}
                    >
                        {fileList.length < 1 && (
                            <div>
                                <UploadOutlined />
                                <div>Загрузить</div>
                            </div>
                        )}
                    </Upload>
                </Form.Item>
            </Form>
        </Drawer>
    );
};

export default AddExpenseModal;
