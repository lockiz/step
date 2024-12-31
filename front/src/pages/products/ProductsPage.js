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
    notification
} from 'antd';
import {UploadOutlined} from '@ant-design/icons';

import {
    getProducts,
    addProduct,
    updateProduct,
    archiveProduct,
    uploadProductImage
} from './ProductsService';

const {Option} = Select;

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [form] = Form.useForm();

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

    useEffect(() => {
        loadProducts();
    }, []);

    // Добавить товар
    const handleAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        setFileList([]);
        setIsModalOpen(true);
    };

    // Редактировать товар
    const handleEdit = (record) => {
        setEditingProduct(record);
        form.setFieldsValue({...record});
        setFileList([]);
        setIsModalOpen(true);
    };

    // Загрузка изображения
    const handleUpload = async ({file}) => {
        try {
            const res = await uploadProductImage(file);
            if (res.filename) {
                notification.success({message: 'Изображение загружено'});
                form.setFieldValue('photo', res.filename);
            }
        } catch (error) {
            console.error(error);
            notification.error({message: 'Ошибка при загрузке файла'});
        }
    };

    // Сохранить (добавить / обновить)
    const handleSave = () => {
        form.validateFields()
            .then(values => {
                // Если есть editingProduct, значит обновляем
                if (editingProduct) {
                    updateProduct(editingProduct.id, values)
                        .then(() => {
                            notification.success({message: 'Товар обновлён'});
                            setIsModalOpen(false);
                            loadProducts();
                        })
                        .catch(err => {
                            console.error(err);
                            notification.error({message: 'Ошибка при обновлении товара'});
                        });
                } else {
                    // Добавляем новый
                    addProduct(values)
                        .then(() => {
                            notification.success({message: 'Товар добавлен'});
                            setIsModalOpen(false);
                            loadProducts();
                        })
                        .catch(err => {
                            console.error(err);
                            notification.error({message: 'Ошибка при добавлении товара'});
                        });
                }
            })
            .catch(err => {
                console.log('Validation Failed:', err);
            });
    };

    // Архивировать товар
    const handleArchive = (record) => {
        archiveProduct(record.id)
            .then(() => {
                notification.success({message: 'Товар переведён в архив'});
                loadProducts();
            })
            .catch(err => {
                console.error(err);
                notification.error({message: 'Ошибка при архивировании'});
            });
    };

    // Колонки для таблицы
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 50
        },
        {
            title: 'Дата добавления',
            dataIndex: 'dateAdded',
            render: (dateStr) => {
                if (!dateStr) return '';
                const d = new Date(dateStr);
                return d.toLocaleString();
            },
        },
        {
            title: 'Фото',
            dataIndex: 'photo',
            render: (photo) => {
                if (!photo) return '—';
                return (
                    <img
                        src={`http://localhost:5001/static/uploads/${photo}`}
                        alt="product"
                        style={{width: 50, height: 50, objectFit: 'cover'}}
                    />
                );
            }
        },
        {
            title: 'Название',
            dataIndex: 'name',
        },
        {
            title: 'Цена (₽)',
            dataIndex: 'price',
        },
        {
            title: 'Количество',
            dataIndex: 'quantity',
        },
        {
            title: 'Характеристики',
            dataIndex: 'characteristics',
            ellipsis: true,
        },
        {
            title: 'Цвет',
            dataIndex: 'color'
        },
        {
            title: 'Пластик',
            dataIndex: 'plastic'
        },
        {
            title: 'Время печати',
            dataIndex: 'printing_time'
        },
        {
            title: 'Себестоимость (₽)',
            dataIndex: 'cost_price'
        },
        {
            title: 'Габариты',
            dataIndex: 'dimensions',
            ellipsis: true
        },
        {
            title: 'Комментарий',
            dataIndex: 'comment',
            ellipsis: true
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            width: 80
        },
        {
            title: 'Действия',
            render: (_, record) => (
                <Space>
                    <Button onClick={() => handleEdit(record)}>Редактировать</Button>
                    {record.status !== 'Archived' && (
                        <Button danger onClick={() => handleArchive(record)}>Архив</Button>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div style={{padding: '20px'}}>
            <h1>Учет товаров</h1>
            <Button
                type="primary"
                onClick={handleAdd}
                style={{marginBottom: 16}}
            >
                Добавить товар
            </Button>

            <Table
                columns={columns}
                dataSource={products}
                rowKey="id"
                pagination={{pageSize: 10}}
                scroll={{x: 1300}}
            />

            <Modal
                title={editingProduct ? 'Редактировать товар' : 'Добавить товар'}
                open={isModalOpen}
                onOk={handleSave}
                onCancel={() => setIsModalOpen(false)}
                width={600}
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
                        rules={[{required: true, message: 'Введите цену'}]}
                    >
                        <InputNumber style={{width: '100%'}} min={0}/>
                    </Form.Item>

                    <Form.Item
                        label="Количество"
                        name="quantity"
                        rules={[{required: true, message: 'Введите количество на складе'}]}
                    >
                        <InputNumber style={{width: '100%'}} min={0}/>
                    </Form.Item>

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
                        <InputNumber style={{width: '100%'}} min={0}/>
                    </Form.Item>

                    <Form.Item label="Габариты" name="dimensions">
                        <Input/>
                    </Form.Item>

                    <Form.Item label="Комментарий" name="comment">
                        <Input.TextArea rows={2}/>
                    </Form.Item>

                    {/* Можно добавить поля для аналитики, если хотите вносить вручную */}
                    <Form.Item label="sales_count" name="sales_count">
                        <InputNumber style={{width: '100%'}} min={0}/>
                    </Form.Item>

                    {/* Статус */}
                    <Form.Item label="Статус" name="status" initialValue="Active">
                        <Select>
                            <Option value="Active">Active</Option>
                            <Option value="Archived">Archived</Option>
                        </Select>
                    </Form.Item>

                    {/* Поле photo (имя файла, disabled - заполняется после загрузки) */}
                    <Form.Item
                        label="Фото (имя файла)"
                        name="photo"
                    >
                        <Input disabled placeholder="После загрузки появится имя"/>
                    </Form.Item>

                    {/* Загрузка файла */}
                    <Upload
                        beforeUpload={() => false} // отключаем автозагрузку
                        onChange={({file}) => {
                            if (file.status === 'removed') {
                                form.setFieldValue('photo', '');
                                return;
                            }
                            if (file.status !== 'uploading') {
                                handleUpload({file});
                            }
                        }}
                        fileList={fileList}
                        onRemove={() => {
                            setFileList([]);
                            form.setFieldValue('photo', '');
                        }}
                    >
                        <Button icon={<UploadOutlined/>}>Загрузить фото</Button>
                    </Upload>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductsPage;
