import React, {useEffect, useState} from "react";
import {Card, Table} from "antd";

const TopPickupPoints = ({filters}) => {
    const [data, setData] = useState([]);

    const fetchTopPickupPoints = async () => {
        // Заглушка: запрос на API
        const fakeData = [
            {key: 1, name: "ПВЗ 1", orders: 150},
            {key: 2, name: "ПВЗ 2", orders: 120},
        ];
        setData(fakeData);
    };

    useEffect(() => {
        fetchTopPickupPoints();
    }, [filters]);

    const columns = [
        {
            title: "ПВЗ",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Заказы",
            dataIndex: "orders",
            key: "orders",
        },
    ];

    return (
        <Card title="Топ ПВЗ">
            <Table columns={columns} dataSource={data} pagination={false}/>
        </Card>
    );
};

export default TopPickupPoints;
