import React, {useState} from "react";
import {Form, Input, Button, notification} from "antd";
import {UploadOutlined} from "@ant-design/icons";
import axios from "axios";

const RegisterPage = () => {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        setLoading(true);
        console.log("Отправляемые данные:", values); // Логируем отправляемые данные
        try {
            const response = await axios.post("http://localhost:5001/auth/register", values);
            if (response.status === 201) {
                notification.success({message: "Регистрация успешна!"});
            }
        } catch (error) {
            console.error("Ошибка при регистрации:", error.response?.data || error.message);
            notification.error({
                message: "Ошибка регистрации",
                description: error.response?.data?.error || "Что-то пошло не так",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{maxWidth: 400, margin: "auto", marginTop: "50px"}}>
            <h2>Регистрация</h2>
            <Form onFinish={handleSubmit} layout="vertical">
                <Form.Item
                    name="username"
                    label="Имя пользователя"
                    rules={[{required: true, message: "Введите имя пользователя"}]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        {required: true, message: "Введите email"},
                        {type: "email", message: "Введите корректный email"},
                    ]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    name="first_name"
                    label="Имя"
                    rules={[{required: true, message: "Введите имя"}]}
                >
                    <Input/>
                </Form.Item>
                <Form.Item
                    name="last_name"
                    label="Фамилия"
                    rules={[{required: true, message: "Введите фамилию"}]}
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
                <Form.Item name="avatar_url" label="Ссылка на аватар (необязательно)">
                    <Input placeholder="URL аватара"/>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Зарегистрироваться
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default RegisterPage;
