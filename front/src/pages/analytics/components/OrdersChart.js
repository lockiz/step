import React, { useState } from "react";
import { Column } from "@ant-design/plots";
import { DatePicker, Button, Space } from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const OrdersChart = ({ data = [] }) => {
  // Состояние для выбранного периода
  const [selectedPeriod, setSelectedPeriod] = useState([
    dayjs().startOf("week"),
    dayjs().endOf("week"),
  ]);

  // Обработчик изменения периода
  const handleDateChange = (dates) => {
    setSelectedPeriod(dates || [dayjs().startOf("week"), dayjs().endOf("week")]);
  };

  // Фильтрация данных за текущий период
  const filteredData = data.filter((item) =>
    dayjs(item.date).isBetween(selectedPeriod[0], selectedPeriod[1], "day", "[]")
  );

  // Фильтрация данных за предыдущий период
  const previousPeriodData = data.filter((item) =>
    dayjs(item.date).isBetween(
      selectedPeriod[0].subtract(7, "day"),
      selectedPeriod[1].subtract(7, "day"),
      "day",
      "[]"
    )
  );

  // Подготовка данных для диаграммы
  const chartData = filteredData.map((currentItem) => {
    const previousItem = previousPeriodData.find(
      (prev) => dayjs(prev.date).isSame(dayjs(currentItem.date).subtract(7, "day"), "day")
    );
    return {
      date: dayjs(currentItem.date).format("YYYY-MM-DD"),
      current: currentItem.value,
      previous: previousItem ? previousItem.value : 0, // Если данных за прошлый период нет, ставим 0
    };
  });

  // Преобразуем данные для группировки
  const groupedData = [
    ...chartData.map((item) => ({ date: item.date, value: item.current, type: "Текущий период" })),
    ...chartData.map((item) => ({ date: item.date, value: item.previous, type: "Прошлый период" })),
  ];

  // Конфигурация диаграммы
  const config = {
    data: groupedData,
    isGroup: true, // Группируем данные
    xField: "date",
    yField: "value",
    seriesField: "type", // Разделяем на группы по типу периода
    columnStyle: {
      radius: [5, 5, 0, 0], // Закругление столбцов
    },
    color: ["#1979C9", "rgba(25, 121, 201, 0.5)"], // Цвета для текущего и прошлого периода
    tooltip: {
      shared: true,
      showMarkers: false,
    },
    legend: {
      position: "top",
    },
    xAxis: {
      label: {
        autoRotate: false,
      },
    },
    yAxis: {
      title: {
        text: "Значения",
      },
    },
  };

  return (
    <div>
      {/* Фильтры выбора периода */}
      <Space style={{ marginBottom: "16px" }}>
        <DatePicker.RangePicker
          value={selectedPeriod}
          onChange={handleDateChange}
          format="YYYY-MM-DD"
        />
        <Button
          type="primary"
          onClick={() =>
            setSelectedPeriod([dayjs().startOf("week"), dayjs().endOf("week")])
          }
        >
          Сбросить
        </Button>
      </Space>

      {/* Диаграмма */}
      <Column {...config} />
    </div>
  );
};

export default OrdersChart;
