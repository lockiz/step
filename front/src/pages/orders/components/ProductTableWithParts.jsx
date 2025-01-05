import React, {useEffect, useState} from 'react';
import {Table, InputNumber, Image, notification} from 'antd';

const ProductTableWithParts = ({selectedProducts, setSelectedProducts, visible}) => {
    const [products, setProducts] = useState([]);

    // Загрузка списка товаров с сервера
    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5001/products');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();

// Добавляем защиту, чтобы точно был массив:
            const safeData = Array.isArray(data) ? data : [];

// Теперь устанавливаем в state только массив
            setProducts(safeData);

        } catch (error) {
            console.error(error);
            notification.error({message: 'Ошибка загрузки товаров'});
        }
    };

    useEffect(() => {
        if (visible) {
            fetchProducts();
        }
    }, [visible]);

    // Обработчик изменения количества товара
    const handleQuantityChange = (productId, newQuantity) => {
        const updatedSelectedProducts = selectedProducts.map((product) =>
            product.id === productId ? {...product, quantity: newQuantity} : product
        );
        setSelectedProducts(updatedSelectedProducts);
    };

    // Обработчик выбора товара
    const rowSelection = {
        selectedRowKeys: selectedProducts.map((product) => product.id),
        onChange: (selectedRowKeys) => {
            const selected = products
                .filter((product) => selectedRowKeys.includes(product.id))
                .map((product) => ({
                    ...product,
                    quantity: selectedProducts.find((p) => p.id === product.id)?.quantity || 1,
                }));
            setSelectedProducts(selected);
        },
    };

    // Колонки таблицы
    const columns = [
        {
            title: 'Фото',
            dataIndex: 'photo',
            key: 'photo',
            render: (photo) => (
                <Image
                    src={`http://localhost:5001/static/uploads/${photo}`}
                    alt="Фото товара"
                    width={50}
                />
            ),
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Цена (₽)',
            dataIndex: 'price',
            key: 'price',
        },
        {
            title: 'Количество',
            key: 'quantity',
            render: (_, record) => {
                const selectedProduct = selectedProducts.find((product) => product.id === record.id);
                const quantity = selectedProduct?.quantity || 1;
                return (
                    <InputNumber
                        min={1}
                        value={quantity}
                        onChange={(value) => handleQuantityChange(record.id, value)}
                    />
                );
            },
        },
        {
            title: 'Сумма (₽)',
            key: 'total',
            render: (_, record) => {
                const selectedProduct = selectedProducts.find((product) => product.id === record.id);
                const quantity = selectedProduct?.quantity || 1;
                return record.price * quantity;
            },
        },
    ];

    return (
        <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={products}
            rowKey="id"
            pagination={false}
        />
    );
};

export default ProductTableWithParts;
