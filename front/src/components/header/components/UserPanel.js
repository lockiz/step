import React, { useState, useContext } from "react";
import { Switch, Avatar, Dropdown, Menu, Modal, Button } from "antd";
import { AuthContext } from "../../../pages/context/AuthContext";

const UserPanel = ({ onThemeChange }) => {
    const { user, logout } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Выпадающее меню
    const menu = (
        <Menu>
            <Menu.Item key="profile" onClick={() => setIsModalOpen(true)}>
                Изменить профиль
            </Menu.Item>
            <Menu.Item key="logout" onClick={() => logout(true)}>
                Выйти
            </Menu.Item>
        </Menu>
    );

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Переключатель темы */}
            <Switch
                onChange={onThemeChange}
                checkedChildren="🌙"
                unCheckedChildren="☀️"
                style={{ marginRight: "16px" }}
            />

            {/* Аватар пользователя с выпадающим меню */}
            <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
                <Avatar
                    src={user?.avatarUrl || "https://via.placeholder.com/150"}
                    style={{ cursor: "pointer" }}
                />
            </Dropdown>

            {/* Модальное окно для редактирования профиля */}
            <Modal
                title="Изменить профиль"
                visible={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <p>Форма для изменения профиля (например, смена аватара или данных)</p>
                <Button type="primary" onClick={() => setIsModalOpen(false)}>
                    Сохранить
                </Button>
            </Modal>
        </div>
    );
};

export default UserPanel;
