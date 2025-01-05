import React, {useEffect, useState} from 'react';
import {
    Table,
    Avatar,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Upload,
    Select,
    Space,
    notification,
    ConfigProvider, Drawer, Divider, Breadcrumb, Tabs,
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
    addBOM, updatePart,
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
    const [editingPart, setEditingPart] = useState(null); // Редактируемая деталь
    const [activeTab, setActiveTab] = useState('1'); // Управление активным табом (1 - детали, 2 - товары)


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
            notification.error({message: '...'});
        }
    };

    // Функция загрузки списка деталей
    const loadParts = async () => {
        try {
            const partsData = await getParts();
            setParts(partsData);
        } catch (error) {
            notification.error({message: '...'});
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
            if (editingPart) {
                // Если редактируемая деталь уже существует, обновляем её
                await updatePart(editingPart.id, values);
                notification.success({message: 'Деталь обновлена'});
            } else {
                // Иначе добавляем новую деталь
                await addPart(values);
                notification.success({message: 'Деталь добавлена'});
            }
            setIsPartModalOpen(false);
            loadParts(); // Обновляем список деталей
        } catch (error) {
            notification.error({message: 'Ошибка при сохранении детали'});
        }
    };


    const handleEditPart = (record) => {
        setEditingPart(record);
        partForm.setFieldsValue({...record}); // Заполняем форму данными детали
        setIsPartModalOpen(true);
    };


    // Открытие модального окна для редактирования товара
    const handleEditProduct = (record) => {
        setEditingProduct(record);
        form.setFieldsValue({
            ...record,
            bom: record.bom?.map((item) => item.id), // Заполняем связи BOM
        });
        setFileList([]);
        setIsProductModalOpen(true);
    };


    // Установите значение поля photo при загрузке изображения
    // При загрузке фото обновляем поле "Фото (имя файла)"
    const handleUpload = async ({file}, type = "product") => {
        try {
            const res = await uploadProductImage(file);
            if (res.filename) {
                notification.success({message: 'Изображение загружено'});

                if (type === "product") {
                    form.setFieldsValue({photo: res.filename}); // Обновляем значение фото в форме товара
                } else if (type === "part") {
                    partForm.setFieldsValue({photo: res.filename}); // Обновляем значение фото в форме детали
                }

                setFileList([
                    {
                        uid: file.uid,
                        name: res.filename,
                        status: 'done',
                        url: `http://localhost:5001/static/uploads/${res.filename}`,
                    },
                ]);
            }
        } catch (error) {
            notification.error({message: 'Ошибка при загрузке файла'});
        }
    };


    // Колонки для таблицы товаров
    const productColumns = [
        {
            title: 'Фото',
            dataIndex: 'photo',
            key: 'photo',
            render: (photo) => (
                photo ? (
                    <img
                        src={`http://localhost:5001/static/uploads/${photo}`}
                        alt="Фото товара"
                        style={{width: 50, height: 50, objectFit: 'cover'}}
                    />
                ) : '—'
            ),
        },
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
            render: (photo) =>
                photo ? (
                    <img
                        src={`http://localhost:5001/static/uploads/${photo}`}
                        alt="Фото детали"
                        style={{width: 50, height: 50, objectFit: 'cover'}}
                    />
                ) : (
                    '—'
                ),
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button onClick={() => handleEditPart(record)}>Редактировать</Button>
                </Space>
            ),
        },
    ];

    const formItemLayout = {
        labelCol: {span: 10}, // Настройка ширины метки
        wrapperCol: {span: 14}, // Настройка ширины поля ввода
    };

    const itemsTabs = [
        {
            key: '1',
            label: 'Детали',
            children: <Table
                columns={partColumns}
                dataSource={parts}
                rowKey="id"
                pagination={{pageSize: 10}}
            />,
        },
        {
            key: '2',
            label: 'Товары',
            children: <Table
                columns={productColumns}
                dataSource={products}
                rowKey="id"
                pagination={{pageSize: 10}}
            />,
        },
    ];


    return (
        <ConfigProvider>
            <Breadcrumb
                style={{marginBottom: '24px'}}
                items={[
                    {
                        title: <a href="">Главная</a>, // Ссылка на главную страницу
                    },
                    {
                        title: 'Наличие', // Название текущей страницы
                    },
                ]}
            />
            <Tabs defaultActiveKey="1"
                  onChange={(key) => setActiveTab(key)}
                  tabBarExtraContent={{
                      right: <Button
                          type="primary"
                          onClick={() => {
                              if (activeTab === '1') {
                                  handleAddPart(); // Открыть Drawer для деталей
                              } else if (activeTab === '2') {
                                  handleAddProduct(); // Открыть Drawer для товаров
                              }
                          }}
                      >
                          Добавить позицию
                      </Button>,
                  }}
                  items={itemsTabs}
                  type="card"/>
            <div style={{padding: '20px'}}>
                {/* Модальное окно для товаров */}
                <Drawer
                    title={editingProduct ? 'Редактировать товар' : 'Добавить товар'}
                    width={720}
                    onClose={() => {
                        setIsProductModalOpen(false);
                        setEditingProduct(null);
                    }}
                    open={isProductModalOpen}
                    bodyStyle={{paddingBottom: 80}}
                    extra={
                        <Space>
                            <Button onClick={() => setIsProductModalOpen(false)}>Отмена</Button>
                            <Button type="primary" onClick={handleSaveProduct}>
                                Сохранить
                            </Button>
                        </Space>
                    }
                >
                    <Form
                        form={form}
                        {...formItemLayout}
                        layout="horizontal"
                        labelAlign="left"
                        size="small"
                        initialValues={editingProduct || {}}>
                        <Divider orientation="left" orientationMargin="0">Основные данные</Divider>

                        <Form.Item
                            label="Название"
                            name="name"
                            rules={[{required: true, message: 'Введите название товара'}]}
                        >
                            <Input placeholder="..."/>
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

                        <Divider orientation="left" orientationMargin="0">Дополнительные данные</Divider>
                        <Form.Item label="Фото (имя файла)" name="photo">
                            <Input disabled placeholder="..."/>
                        </Form.Item>
                        <Upload
                            beforeUpload={() => false}
                            onChange={({file}) => {
                                if (file.status === 'removed') {
                                    form.setFieldsValue({photo: ''});
                                    setFileList([]);
                                    return;
                                }
                                handleUpload({file});
                            }}
                            fileList={fileList}
                            onRemove={() => {
                                setFileList([]);
                                form.setFieldsValue({photo: ''});
                            }}
                        >
                            <Button icon={<UploadOutlined/>}>Загрузить фото</Button>
                        </Upload>

                        <Form.Item label="Цвет" name="color">
                            <Input placeholder="..."/>
                        </Form.Item>

                        <Form.Item label="Пластик" name="plastic">
                            <Input placeholder="..."/>
                        </Form.Item>

                        <Form.Item label="Время печати" name="printing_time">
                            <Input placeholder="..."/>
                        </Form.Item>

                        <Form.Item label="Себестоимость (₽)" name="cost_price">
                            <InputNumber style={{width: '100%'}}/>
                        </Form.Item>

                        <Form.Item label="Габариты" name="dimensions">
                            <Input placeholder="..."/>
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

                        <Form.Item label="Характеристики" name="characteristics">
                            <Input.TextArea rows={1} placeholder="..."/>
                        </Form.Item>

                        <Form.Item label="Комментарий" name="comment">
                            <Input.TextArea rows={1} placeholder="..."/>
                        </Form.Item>

                        <Divider orientation="left" orientationMargin="0">Состав (BOM)</Divider>
                        <Form.Item label="Добавить детали (BOM)" name="bom">
                            <Select mode="multiple" placeholder="...">
                                {parts.map((part) => (
                                    <Option key={`${part.id}-${part.name}`} value={part.id}>
                                        {part.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </Drawer>


                {/* Модальное окно для деталей */}
                <Drawer
                    title={editingPart ? 'Редактировать деталь' : 'Добавить деталь'}
                    width={720}
                    onClose={() => setIsPartModalOpen(false)}
                    open={isPartModalOpen}
                    bodyStyle={{paddingBottom: 80}}
                    extra={
                        <Space>
                            <Button onClick={() => setIsPartModalOpen(false)}>Отмена</Button>
                            <Button onClick={handleSavePart} type="primary">Сохранить</Button>
                        </Space>
                    }
                >
                    <Form form={partForm}
                          {...formItemLayout}
                          layout="horizontal"
                          labelAlign="left"
                          size="small"
                    >
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
                            <Input disabled placeholder="..."/>
                        </Form.Item>
                        <Upload
                            beforeUpload={() => false}
                            onChange={({file}) => {
                                if (file.status === 'removed') {
                                    partForm.setFieldsValue({photo: ''});
                                    setFileList([]);
                                    return;
                                }
                                handleUpload({file}, "part"); // Указываем, что это загрузка для детали
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
                </Drawer>
            </div>
        </ConfigProvider>
    )
        ;
};

export default ProductsPage;

