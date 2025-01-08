import React, { useState, useEffect } from "react";
import { Button, List, Avatar, Popconfirm, notification, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import AddExpenseModal from "./AddExpenseModal";
import { getPurchases, deletePurchase, createPurchase, updatePurchase, currentUser } from "./PurchasesService";

const ExpensesPage = () => {
    const [expenses, setExpenses] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [role, setRole] = useState(null);

    const fetchExpenses = async () => {
        try {
            const data = await getPurchases();
            setExpenses(data);
        } catch (error) {
            console.error("Ошибка получения закупок:", error);
            notification.error({ message: "Ошибка загрузки списка закупок" });
        }
    };

    const fetchUserRole = async () => {
        try {
            const user = await currentUser();
            setRole(user.role);
        } catch (error) {
            console.error("Ошибка получения данных пользователя:", error);
            notification.error({ message: "Ошибка загрузки данных пользователя" });
        }
    };

    useEffect(() => {
        fetchExpenses();
        fetchUserRole();
    }, []);

    const handleDelete = async (id) => {
        try {
            await deletePurchase(id);
            // Перезагрузка данных после удаления
            await fetchExpenses();
            notification.success({ message: "Закупка успешно удалена!" });
        } catch (error) {
            console.error("Ошибка удаления закупки:", error);
            notification.error({ message: "Ошибка удаления закупки" });
        }
    };

    const handleEditExpense = (expense) => {
        setEditingExpense(expense);
        setModalVisible(true);
    };

    const handleSaveExpense = async (data) => {
        try {
            if (editingExpense) {
                // Обновление существующей закупки
                await updatePurchase(editingExpense.id, data);
                await fetchExpenses(); // Перезагрузка данных после редактирования
                notification.success({ message: "Закупка успешно обновлена!" });
            } else {
                // Добавление новой закупки
                await createPurchase(data);
                await fetchExpenses(); // Перезагрузка данных после добавления
                notification.success({ message: "Закупка успешно добавлена!" });
            }
            setModalVisible(false);
            setEditingExpense(null);
        } catch (error) {
            console.error("Ошибка сохранения закупки:", error);
            notification.error({ message: "Ошибка сохранения закупки" });
        }
    };

    return (
        <div style={{ padding: "16px" }}>
            <h2>Закупки</h2>
            <Button type="primary" onClick={() => setModalVisible(true)}>
                Добавить закупку
            </Button>
            <List
                itemLayout="horizontal"
                dataSource={expenses}
                renderItem={(item) => (
                    <List.Item
                        actions={[
                            <Tooltip title="Редактировать">
                                <EditOutlined
                                    onClick={() => handleEditExpense(item)}
                                    style={{ color: "blue" }}
                                />
                            </Tooltip>,
                            role === "Admin" && (
                                <Popconfirm
                                    placement="bottom"
                                    title="Вы уверены, что хотите удалить эту закупку?"
                                    onConfirm={() => handleDelete(item.id)}
                                    okText="Да"
                                    cancelText="Нет"
                                >
                                    <Tooltip title="Удалить">
                                        <DeleteOutlined style={{ color: "red" }} />
                                    </Tooltip>
                                </Popconfirm>
                            ),
                        ]}
                    >
                        <List.Item.Meta
                            avatar={
                                <Avatar
                                    src={item.photo || "https://via.placeholder.com/150"}
                                    shape="square"
                                />
                            }
                            title={item.name}
                            description={`Дата: ${item.date || "N/A"}, Стоимость: ${
                                item.cost || 0
                            }₽`}
                        />
                    </List.Item>
                )}
            />
            <AddExpenseModal
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingExpense(null);
                }}
                onSubmit={handleSaveExpense}
                purchase={editingExpense}
            />
        </div>
    );
};

export default ExpensesPage;
