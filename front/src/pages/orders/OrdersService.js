const API_BASE_URL = "http://localhost:5001"; // Базовый URL для API

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

    // Пересчёт недостающих деталей
    await calculateShortages();
    return response.json();
}


// Обновление заказа
export async function updateOrder(orderId, updatedData) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updatedData),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Ошибка обновления заказа: ${error.message}`);
    }
    return response.json();
}


// Получение недостающих деталей
export async function calculateShortages() {
    const response = await fetch(`${API_BASE_URL}/calculate_shortages`, {
        method: "GET",
    });
    if (!response.ok) {
        throw new Error(`Failed to calculate shortages: ${response.statusText}`);
    }
    return response.json();
}




