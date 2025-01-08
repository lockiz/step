import React, {useEffect, useState} from "react";
import {Card, Typography, Input, Space, message, Button} from "antd";
import {EditOutlined, CheckOutlined, CloseOutlined} from "@ant-design/icons";
import {getBudget, addBudget} from "../AnalyticsService";

const {Title, Text} = Typography;

const BudgetComponent = ({role}) => {
    const [budget, setBudget] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [newBudget, setNewBudget] = useState("");

    useEffect(() => {
        fetchBudget();
    }, []);

    const fetchBudget = async () => {
        try {
            const response = await getBudget();
            setBudget(response.amount);
        } catch (error) {
            message.error("Ошибка при загрузке бюджета");
            console.error("Ошибка при загрузке бюджета:", error);
        }
    };

    const handleAddBudget = async () => {
        if (!newBudget) {
            message.warning("Введите сумму для добавления");
            return;
        }

        try {
            const response = await addBudget(parseFloat(newBudget));
            setBudget(response.amount);
            setNewBudget("");
            setEditMode(false);
            message.success("Бюджет успешно обновлён!");
        } catch (error) {
            message.error("Не удалось обновить бюджет");
            console.error("Ошибка при обновлении бюджета:", error);
        }
    };

    return (
        <Card style={{maxWidth: 400, margin: "16px auto"}}>
            <Space direction="vertical" size="middle" style={{width: "100%"}}>
                <Title level={4}>Бюджет</Title>
                <div style={{display: "flex", alignItems: "center"}}>
                    {editMode ? (
                        <>
                            <Input
                                type="number"
                                placeholder="Введите сумму"
                                value={newBudget}
                                onChange={(e) => setNewBudget(e.target.value)}
                                style={{width: "70%", marginRight: "8px"}}
                            />
                            <Space>
                                <Button
                                    icon={<CheckOutlined/>}
                                    type="primary"
                                    onClick={handleAddBudget}
                                />
                                <Button
                                    icon={<CloseOutlined/>}
                                    onClick={() => {
                                        setNewBudget("");
                                        setEditMode(false);
                                    }}
                                />
                            </Space>
                        </>
                    ) : (
                        <>
                            <Text strong style={{fontSize: 24, marginRight: "8px"}}>
                                {budget !== null ? `${budget.toLocaleString()} ₽` : "Загрузка..."}
                            </Text>
                            {role === "Admin" && (
                                <EditOutlined
                                    style={{cursor: "pointer", color: "#1890ff"}}
                                    onClick={() => setEditMode(true)}
                                />
                            )}
                        </>
                    )}
                </div>
            </Space>
        </Card>
    );
};

export default BudgetComponent;
