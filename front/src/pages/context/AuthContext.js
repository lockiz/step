import React, {createContext, useState, useEffect, useContext} from "react";
import axios from "axios";
import {notification} from "antd";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (username, password) => {
        try {
            const response = await axios.post("http://localhost:5001/auth/login", {username, password});
            const {access_token, refresh_token, role} = response.data;

            setUser({username, role});
            localStorage.setItem("token", access_token);
            localStorage.setItem("refresh_token", refresh_token);

            axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
            notification.success({message: "Вход выполнен успешно!"});
        } catch (error) {
            console.error("Ошибка входа:", error);
            notification.error({
                message: "Ошибка входа",
                description: error.response?.data?.error || "Ошибка сервера",
            });
            throw error.response?.data?.error || "Ошибка сервера";
        }
    };

    const logout = (manual = false) => {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        delete axios.defaults.headers.common["Authorization"];
        if (manual) {
            notification.info({message: "Вы вышли из системы."});
        }
    };

    const isTokenValid = (token) => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.exp * 1000 > Date.now(); // Проверяем истечение токена
        } catch (e) {
            console.error("Ошибка проверки токена:", e);
            return false;
        }
    };

    const refreshToken = async () => {
        try {
            const response = await axios.post("http://localhost:5001/auth/refresh", null, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
                },
            });
            const {access_token} = response.data;

            localStorage.setItem("token", access_token);
            axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
            console.log("Токен успешно обновлен");
        } catch (error) {
            console.error("Ошибка обновления токена:", error);
            logout(false);
        }
    };

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem("token");
            if (token && isTokenValid(token)) {
                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
                try {
                    const response = await axios.get("http://localhost:5001/auth/user");
                    if (response.status === 200) {
                        setUser({
                            id: response.data.id,
                            username: response.data.username,
                            email: response.data.email,
                            role: response.data.role,
                            firstName: response.data.first_name,
                            lastName: response.data.last_name,
                        });
                    } else {
                        throw new Error("Некорректный ответ от сервера.");
                    }
                } catch (error) {
                    console.error("Ошибка проверки токена:", error);
                    logout(false);
                }
            } else {
                logout(false);
            }
            setLoading(false);
        };

        verifyToken().catch((err) => {
            console.error("Ошибка в verifyToken:", err);
            setLoading(false);
        });

        const interval = setInterval(() => {
            const token = localStorage.getItem("token");
            if (token && isTokenValid(token)) {
                refreshToken();
            }
        }, 5 * 60 * 1000); // Обновление каждые 5 минут

        return () => clearInterval(interval);
    }, []);

    return (
        <AuthContext.Provider value={{user, login, logout, loading}}>
            {children}
        </AuthContext.Provider>
    );
};
