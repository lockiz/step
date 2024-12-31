// Указываем базовый URL для API
const API_URL = 'http://127.0.0.1:5001'; // Измени на реальный адрес сервера

export const createOrder = async (orderData) => {
    const response = await fetch(API_URL+'/add_order', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
    });

    if (!response.ok) {
        throw new Error("Failed to create order");
    }
    return response.json();
};

export const getOrders = async () => {
    const response = await fetch(API_URL+'/get_orders');
    if (!response.ok) {
        throw new Error("Failed to fetch orders");
    }
    return response.json();
};
