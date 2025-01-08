import React, { useState } from "react";
import { Bar } from "@ant-design/plots";
import { DatePicker, Button, Space } from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const OrdersCard = ({ data }) => {
    const [selectedPeriod, setSelectedPeriod] = useState([dayjs().startOf("week"), dayjs().endOf("week")]);

    const handleDateChange = (dates) => {
        setSelectedPeriod(dates);
    };

    const filteredData = data.filter((item) =>
        dayjs(item.date).isBetween(selectedPeriod[0], selectedPeriod[1], "day", "[]")
    );

    const previousPeriodData = data.filter((item) =>
        dayjs(item.date).isBetween(
            selectedPeriod[0].subtract(7, "day"),
            selectedPeriod[1].subtract(7, "day"),
            "day",
            "[]"
        )
    );

    const chartData = [
        ...filteredData.map((item) => ({ ...item, type: "Текущий период" })),
        ...previousPeriodData.map((item) => ({ ...item, type: "Прошлый период" })),
    ];

    const config = {
        data: chartData,
        xField: "date",
        yField: "value",
        seriesField: "type",
        isGroup: true,
        color: ["#1979C9", "rgba(25, 121, 201, 0.5)"], // Цвета для текущего и прошлого периода
        tooltip: {
            shared: true,
            showMarkers: false,
        },
        legend: {
            position: "top",
        },
    };

    return (
        <div>
            <Space style={{ marginBottom: "16px" }}>
                <DatePicker.RangePicker
                    value={selectedPeriod}
                    onChange={handleDateChange}
                    format="YYYY-MM-DD"
                />
                <Button type="primary" onClick={() => setSelectedPeriod([dayjs().startOf("week"), dayjs().endOf("week")])}>
                    Сбросить
                </Button>
            </Space>
            <Bar {...config} />
        </div>
    );
};

export default OrdersCard;
