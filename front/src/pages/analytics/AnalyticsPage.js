import React, {useState, useEffect} from "react";
import {Row, Col, notification} from "antd";
import BudgetComponent from "./components/BudgetComponent";
import {currentUser} from "../expense/PurchasesService";


const AnalyticsPage = () => {
    const [role, setRole] = useState(null);
    const fetchUserRole = async () => {
        try {
            const user = await currentUser();
            setRole(user.role);
        } catch (error) {
            console.error("Ошибка получения данных пользователя:", error);
            notification.error({message: "Ошибка загрузки данных пользователя"});
        }
    };

    useEffect(() => {
        fetchUserRole();
    }, []);

    return (
        <div style={{padding: "16px"}}>
            <Row gutter={[16, 16]}>
                <Col span={5}>
                    <BudgetComponent role={role}/>
                </Col>
            </Row>
        </div>
    );
};

export default AnalyticsPage;
