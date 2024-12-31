import React from 'react';
import { List, Button } from 'antd';
import OrderCard from './OrderCard'; // Используем отдельную карточку для каждого заказа

const OrderList = ({ orders }) => {
  return (
    <List
      itemLayout="horizontal"
      dataSource={orders}
      renderItem={order => (
        <List.Item
          actions={[
            <Button>Edit</Button>,
            <Button type="danger">Delete</Button>,
          ]}
        >
          <OrderCard order={order} />
        </List.Item>
      )}
    />
  );
};

export default OrderList;
