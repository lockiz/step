import React, {useEffect, useState} from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Upload,
    Select,
    Space,
    notification,
    ConfigProvider,
} from 'antd';
import {UploadOutlined} from '@ant-design/icons';

import {
    getProducts,
    addProduct,
    updateProduct,
    archiveProduct,
    uploadProductImage,
    getParts,
    addPart,
    getBOM,
    addBOM,
} from './ProductsService';

const {Option} = Select;

const ProductsPage = () => {
    const [products, setProducts] = useState([]); // Список товаров
    const [parts, setParts] = useState([]); // Список деталей
    const [isProductModalOpen, setIsProductModalOpen] = useState(false); // Модальное окно для товара
    const [isPartModalOpen, setIsPartModalOpen] = useState(false); // Модальное окно для детали
    const [editingProduct, setEditingProduct] = useState(null); // Редактируемый товар
    const [fileList, setFileList] = useState([]); // Список файлов для загрузки
    const [form] = Form.useForm(); // Форма для товаров
    const [partForm] = Form.useForm(); // Форма для деталей

    // Загрузка списка товаров и деталей при монтировании компонента
    useEffect(() => {
        loadProducts();
        loadParts();
    }, []);

    // Функция загрузки списка товаров
    const loadProducts = async () => {
        try {
            const productsData = await getProducts();
            setProducts(productsData);
        } catch (error) {
            notification.error({message: 'Ошибка загрузки товаров'});
        }
    };

    // Функция загрузки списка деталей
    const loadParts = async () => {
        try {
            const partsData = await getParts();
            setParts(partsData);
        } catch (error) {
            notification.error({message: 'Ошибка загрузки деталей'});
        }
    };

    // Открытие модального окна для добавления товара
    const handleAddProduct = () => {
        setEditingProduct(null);
        form.resetFields();
        setFileList([]);
        setIsProductModalOpen(true);
    };

    // Сохранение товара (добавление или обновление)
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
            setIsProductModalOpen(false);
            loadProducts();
        } catch (error) {
            notification.error({message: 'Ошибка при сохранении товара'});
        }
    };

    // Открытие модального окна для добавления детали
    const handleAddPart = () => {
        partForm.resetFields();
        setIsPartModalOpen(true);
    };

    // Сохранение детали
    const handleSavePart = async () => {
        try {
            const values = await partForm.validateFields();
            await addPart(values);
            notification.success({message: 'Деталь добавлена'});
            setIsPartModalOpen(false);
            loadParts();
        } catch (error) {
            notification.error({message: 'Ошибка при добавлении детали'});
        }
    };

    // Открытие модального окна для редактирования товара
    const handleEditProduct = (record) => {
        setEditingProduct(record);
        form.setFieldsValue({...record});
        setFileList([]);
        setIsProductModalOpen(true);
    };

    // Загрузка изображения товара или детали
    const handleUpload = async ({file}, formType = "part") => {
        try {
            const res = await uploadProductImage(file);
            if (res.filename) {
                notification.success({message: 'Изображение загружено'});

                // Установите имя файла в зависимости от типа формы
                if (formType === "product") {
                    form.setFieldsValue({photo: res.filename});
                } else if (formType === "part") {
                    partForm.setFieldsValue({photo: res.filename});
                }

                setFileList([
                    {
                        uid: file.uid,
                        name: res.filename,
                        status: 'done',
                        url: `http://127.0.0.1:5001/static/uploads/${res.filename}`,
                    },
                ]);
            }
        } catch (error) {
            notification.error({message: 'Ошибка при загрузке файла'});
        }
    };


    // Колонки для таблицы товаров
    const productColumns = [
        {title: 'ID', dataIndex: 'id', key: 'id'},
        {title: 'Название', dataIndex: 'name', key: 'name'},
        {title: 'Цена', dataIndex: 'price', key: 'price'},
        {title: 'Количество', dataIndex: 'quantity', key: 'quantity'},
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button onClick={() => handleEditProduct(record)}>
                        Редактировать
                    </Button>
                </Space>
            ),
        },
    ];

    // Колонки для таблицы деталей
    const partColumns = [
        {title: 'ID', dataIndex: 'id', key: 'id'},
        {title: 'Название', dataIndex: 'name', key: 'name'},
        {title: 'Количество', dataIndex: 'quantity', key: 'quantity'},
        {title: 'Цвет', dataIndex: 'color', key: 'color'},
        {title: 'Вес (г)', dataIndex: 'weight', key: 'weight'},
        {title: 'Время печати', dataIndex: 'printing_time', key: 'printing_time'},
        {
            title: 'Фото',
            dataIndex: 'photo',
            key: 'photo',
            render: (photo) => (
                photo ? <img src={`http://127.0.0.1:5001/static/uploads/${photo}`} alt="part"
                             style={{width: 50, height: 50, objectFit: 'cover'}}/> : '—'
            ),
        },
    ];

    return (
        <ConfigProvider>
            <div style={{padding: '20px'}}>
                <h1>Учет товаров</h1>
                <Button
                    type="primary"
                    onClick={handleAddProduct}
                    style={{marginBottom: 16}}
                >
                    Добавить товар
                </Button>

                <Table
                    columns={productColumns}
                    dataSource={products}
                    rowKey="id"
                    pagination={{pageSize: 10}}
                />

                <h2>Список деталей</h2>
                <Button
                    type="primary"
                    onClick={handleAddPart}
                    style={{marginBottom: 16}}
                >
                    Добавить деталь
                </Button>

                <Table
                    columns={partColumns}
                    dataSource={parts}
                    rowKey="id"
                    pagination={{pageSize: 10}}
                />

                {/* Модальное окно для товаров */}
                <Modal
                    title={editingProduct ? 'Редактировать товар' : 'Добавить товар'}
                    open={isProductModalOpen}
                    onOk={handleSaveProduct}
                    onCancel={() => setIsProductModalOpen(false)}
                    width={800}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item
                            label="Название"
                            name="name"
                            rules={[{required: true, message: 'Введите название товара'}]}
                        >
                            <Input/>
                        </Form.Item>

                        <Form.Item
                            label="Цена (₽)"
                            name="price"
                            rules={[{required: true, message: 'Введите цену товара'}]}
                        >
                            <InputNumber style={{width: '100%'}}/>
                        </Form.Item>

                        <Form.Item
                            label="Количество"
                            name="quantity"
                            rules={[{required: true, message: 'Введите количество товара'}]}
                        >
                            <InputNumber style={{width: '100%'}}/>
                        </Form.Item>

                        <Form.Item label="Фото (имя файла)" name="photo">
                            <Input disabled placeholder="После загрузки появится имя"/>
                        </Form.Item>
                        <Upload
                            beforeUpload={() => false}
                            onChange={({file}) => {
                                if (file.status === 'removed') {
                                    partForm.setFieldsValue({photo: ''});
                                    return;
                                }
                                if (file.status !== 'uploading') {
                                    handleUpload({file}, "part");
                                }
                            }}
                            fileList={fileList}
                            onRemove={() => {
                                setFileList([]);
                                partForm.setFieldsValue({photo: ''});
                            }}
                        >
                            <Button icon={<UploadOutlined/>}>Загрузить фото</Button>
                        </Upload>


                        <Form.Item label="Характеристики" name="characteristics">
                            <Input.TextArea rows={2}/>
                        </Form.Item>
                        <Form.Item label="Цвет" name="color">
                            <Input/>
                        </Form.Item>
                        <Form.Item label="Пластик" name="plastic">
                            <Input/>
                        </Form.Item>
                        <Form.Item label="Время печати" name="printing_time">
                            <Input/>
                        </Form.Item>
                        <Form.Item label="Себестоимость (₽)" name="cost_price">
                            <InputNumber style={{width: '100%'}}/>
                        </Form.Item>
                        <Form.Item label="Габариты" name="dimensions">
                            <Input/>
                        </Form.Item>
                        <Form.Item label="Комментарий" name="comment">
                            <Input.TextArea rows={2}/>
                        </Form.Item>
                        <Form.Item label="Статус" name="status">
                            <Select>
                                <Option value="Active">Active</Option>
                                <Option value="Archived">Archived</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="Продано" name="sales_count">
                            <InputNumber style={{width: '100%'}}/>
                        </Form.Item>
                        <Form.Item label="Добавить детали (BOM)" name="bom">
                            <Select mode="multiple" placeholder="Выберите детали">
                                {parts.map((part) => (
                                    <Option key={part.id} value={part.id}>
                                        {part.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Модальное окно для деталей */}
                <Modal
                    title="Добавить деталь"
                    open={isPartModalOpen}
                    onOk={handleSavePart}
                    onCancel={() => setIsPartModalOpen(false)}
                    width={800}
                >
                    <Form form={partForm} layout="vertical">
                        <Form.Item
                            label="Название"
                            name="name"
                            rules={[{required: true, message: 'Введите название детали'}]}
                        >
                            <Input/>
                        </Form.Item>
                        <Form.Item
                            label="Количество"
                            name="quantity"
                            rules={[{required: true, message: 'Введите количество деталей'}]}
                        >
                            <InputNumber style={{width: '100%'}}/>
                        </Form.Item>
                        <Form.Item
                            label="Цвет"
                            name="color"
                            rules={[{required: true, message: 'Введите цвет детали'}]}
                        >
                            <Input/>
                        </Form.Item>
                        <Form.Item
                            label="Вес (г)"
                            name="weight"
                            rules={[{required: true, message: 'Введите вес детали'}]}
                        >
                            <InputNumber style={{width: '100%'}}/>
                        </Form.Item>
                        <Form.Item
                            label="Время печати (мин)"
                            name="printing_time"
                            rules={[{required: true, message: 'Введите время печати детали'}]}
                        >
                            <Input/>
                        </Form.Item>
                        <Form.Item label="Фото (имя файла)" name="photo">
                            <Input disabled placeholder="После загрузки появится имя"/>
                        </Form.Item>
                        <Upload
                            beforeUpload={() => false}
                            onChange={({file}) => {
                                if (file.status === 'removed') {
                                    partForm.setFieldsValue({photo: ''});
                                    return;
                                }
                                if (file.status !== 'uploading') {
                                    handleUpload({file}, "part");
                                }
                            }}
                            fileList={fileList}
                            onRemove={() => {
                                setFileList([]);
                                partForm.setFieldsValue({photo: ''});
                            }}
                        >
                            <Button icon={<UploadOutlined/>}>Загрузить фото</Button>
                        </Upload>

                    </Form>
                </Modal>
            </div>
        </ConfigProvider>
    );
};

export default ProductsPage;

