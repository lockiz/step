import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';

const OrderForm = ({ onSubmit, onCancel }) => {
  const [orderData, setOrderData] = useState({ name: '', product: '', status: 'in-progress' });

  const handleSubmit = () => {
    onSubmit(orderData);
  };

  return (
    <Form>
      <Form.Item label="Название заказа">
        <Input
          value={orderData.name}
          onChange={e => setOrderData({ ...orderData, name: e.target.value })}
        />
      </Form.Item>
      <Form.Item label="Товар">
        <Input
          value={orderData.product}
          onChange={e => setOrderData({ ...orderData, product: e.target.value })}
        />
      </Form.Item>
      <Form.Item label="Статус">
        <Input
          value={orderData.status}
          onChange={e => setOrderData({ ...orderData, status: e.target.value })}
        />
      </Form.Item>
      <Button onClick={handleSubmit} type="primary">Сохранить</Button>
      <Button onClick={onCancel} type="default">Отменить</Button>
    </Form>
  );
};

export default OrderForm;
