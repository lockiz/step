import React from "react";
import {useAuth} from "../context/AuthContext";
import {useNavigate} from "react-router-dom";
import {Form, Input, Button} from "antd";

const LoginPage = () => {
    const {login} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        try {
            await login(values.username, values.password);
            navigate("/"); // Перенаправление в CRM
        } catch (error) {
            console.error("Ошибка входа:", error);
        }
    };


    return (
        <div style={{maxWidth: 400, margin: "auto", marginTop: "50px"}}>
            <h2>Вход</h2>
            <Form onFinish={handleSubmit} layout="vertical">
                <Form.Item
                    name="username"
                    label="Имя пользователя"
                    rules={[{required: true, message: "Введите имя пользователя"}]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    name="password"
                    label="Пароль"
                    rules={[{required: true, message: "Введите пароль"}]}
                >
                    <Input.Password/>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Войти
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default LoginPage;
