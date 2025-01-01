import React, {useEffect, useState} from 'react';
import {Table, Button, Modal, Form, Input, InputNumber, Select, Space, notification} from 'antd';
import {getProducts, addProduct, updateProduct, getParts, addPart, getBOM, addBOM} from './ProductsService';

const {Option} = Select;

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [parts, setParts] = useState([]);
    const [bom, setBOM] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPartsModalOpen, setIsPartsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();
    const [partsForm] = Form.useForm();

    // Загрузить товары
    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error(error);
            notification.error({message: 'Ошибка при загрузке товаров'});
        }
    };

    // Загрузить части
    const loadParts = async () => {
        try {
            const data = await getParts();
            setParts(data);
        } catch (error) {
            console.error(error);
            notification.error({message: 'Ошибка при загрузке частей'});
        }
    };

    // Загрузить BOM для выбранного товара
    const loadBOM = async (productId) => {
        try {
            const data = await getBOM(productId);
            setBOM(data);
        } catch (error) {
            console.error(error);
            notification.error({message: 'Ошибка при загрузке BOM'});
        }
    };

    useEffect(() => {
        loadProducts();
        loadParts();
    }, []);

    // Добавить товар
    const handleAddProduct = () => {
        setEditingProduct(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    // Редактировать товар
    const handleEditProduct = (record) => {
        setEditingProduct(record);
        form.setFieldsValue({...record});
        setIsModalOpen(true);
    };

    // Сохранить товар
    const handleSaveProduct = async () => {
        try {
            const values = await form.validateFields();
            if (editingProduct) {
                await updateProduct(editingProduct.id, values);
                notification.success({message: 'Товар обновлён'});
            } else {
                await addProduct(values);
                notification.success({message: 'Товар добавлен'});
            }
            setIsModalOpen(false);
            loadProducts();
        } catch (error) {
            console.error(error);
            notification.error({message: 'Ошибка при сохранении товара'});
        }
    };

    // Добавить часть
    const handleAddPart = async () => {
        try {
            const values = await partsForm.validateFields();
            await addPart(values);
            notification.success({message: 'Часть добавлена'});
            setIsPartsModalOpen(false);
            loadParts();
        } catch (error) {
            console.error(error);
            notification.error({message: 'Ошибка при добавлении части'});
        }
    };

    // Колонки для таблицы товаров
    const productColumns = [
        {title: 'Название', dataIndex: 'name', key: 'name'},
        {title: 'Цена', dataIndex: 'price', key: 'price'},
        {title: 'Количество', dataIndex: 'quantity', key: 'quantity'},
        {
            title: 'Действия',
            render: (_, record) => (
                <Space>
                    <Button onClick={() => handleEditProduct(record)}>Редактировать</Button>
                    <Button onClick={() => loadBOM(record.id)}>BOM</Button>
                </Space>
            ),
        },
    ];

    // Колонки для таблицы частей
    const partsColumns = [
        {title: 'Название', dataIndex: 'name', key: 'name'},
        {title: 'Количество', dataIndex: 'quantity', key: 'quantity'},
    ];

    return (
        <div>
            <h1>Товары</h1>
            <Button type="primary" onClick={handleAddProduct}>
                Добавить товар
            </Button>
            <Table columns={productColumns} dataSource={products} rowKey="id"/>

            <h1>Части</h1>
            <Button type="primary" onClick={() => setIsPartsModalOpen(true)}>
                Добавить часть
            </Button>
            <Table columns={partsColumns} dataSource={parts} rowKey="id"/>

            <Modal
                title={editingProduct ? 'Редактировать товар' : 'Добавить товар'}
                open={isModalOpen}
                onOk={handleSaveProduct}
                onCancel={() => setIsModalOpen(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Название" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="price" label="Цена" rules={[{required: true}]}>
                        <InputNumber min={0} style={{width: '100%'}}/>
                    </Form.Item>
                    <Form.Item name="quantity" label="Количество" rules={[{required: true}]}>
                        <InputNumber min={0} style={{width: '100%'}}/>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Добавить часть"
                open={isPartsModalOpen}
                onOk={handleAddPart}
                onCancel={() => setIsPartsModalOpen(false)}
            >
                <Form form={partsForm} layout="vertical">
                    <Form.Item name="name" label="Название" rules={[{required: true}]}>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="quantity" label="Количество" rules={[{required: true}]}>
                        <InputNumber min={0} style={{width: '100%'}}/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductsPage;
