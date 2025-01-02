const API_BASE_URL = "http://127.0.0.1:5001"; // Базовый URL для API

// Получение списка заказов
export async function getOrders() {
    const response = await fetch(`${API_BASE_URL}/get_orders`);
    if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }
    return response.json();
}

// Создание нового заказа
export async function createOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/add_order`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
    });
    if (!response.ok) {
        throw new Error(`Failed to create order: ${response.statusText}`);
    }
    return response.json();
}

// Обновление заказа
export async function updateOrder(orderId, updatedData) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
    });
    if (!response.ok) {
        throw new Error(`Failed to update order: ${response.statusText}`);
    }
    return response.json();
}

// Проверка недостающих деталей
export async function checkShortages() {
    const response = await fetch(`${API_BASE_URL}/check_shortages`);
    if (!response.ok) {
        throw new Error(`Failed to fetch shortages: ${response.statusText}`);
    }
    return response.json();
}
