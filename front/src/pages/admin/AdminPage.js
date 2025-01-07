import React, {useState, useEffect} from "react";
import {Table, Button, Select, notification} from "antd";
import {useAuth} from "../context/AuthContext";
import axios from "axios";

const {Option} = Select;

const AdminPage = () => {
    const {user} = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("http://localhost:5001/auth/users");
                setUsers(response.data);
            } catch (error) {
                console.error("Ошибка загрузки пользователей:", error);
                notification.error({message: "Не удалось загрузить список пользователей"});
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.post(`http://localhost:5001/auth/users/${userId}/role`, {role: newRole});
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? {...user, role: newRole} : user
                )
            );
            notification.success({message: "Роль успешно обновлена"});
        } catch (error) {
            console.error("Ошибка обновления роли:", error);
            notification.error({message: "Не удалось обновить роль"});
        }
    };

    const handleApproval = async (userId) => {
        try {
            await axios.post(`http://localhost:5001/auth/users/${userId}/approve`);
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? {...user, is_approved: true} : user
                )
            );
            notification.success({message: "Пользователь одобрен"});
        } catch (error) {
            console.error("Ошибка одобрения пользователя:", error);
            notification.error({message: "Не удалось одобрить пользователя"});
        }
    };

    const columns = [
        {
            title: "Имя пользователя",
            dataIndex: "username",
            key: "username",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Роль",
            dataIndex: "role",
            key: "role",
            render: (role, record) => (
                <Select
                    defaultValue={role}
                    onChange={(value) => handleRoleChange(record.id, value)}
                    disabled={record.role === "Admin"}
                >
                    <Option value="User">User</Option>
                    <Option value="Partner">Partner</Option>
                    <Option value="Admin">Admin</Option>
                </Select>
            ),
        },
        {
            title: "Одобрен",
            dataIndex: "is_approved",
            key: "is_approved",
            render: (isApproved) => (isApproved ? "Да" : "Нет"),
        },
        {
            title: "Действия",
            key: "actions",
            render: (_, record) =>
                !record.is_approved && (
                    <Button type="primary" onClick={() => handleApproval(record.id)}>
                        Одобрить
                    </Button>
                ),
        },
    ];

    return (
        <div style={{padding: 20}}>
            <h2>Управление пользователями</h2>
            <Table
                dataSource={users}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{pageSize: 10}}
            />
        </div>
    );
};

export default AdminPage;
