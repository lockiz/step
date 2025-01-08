const API_BASE_URL = "http://localhost:5001"; // Базовый URL API

// Получение списка закупок
export async function getPurchases(filters = {}) {
    const response = await fetch(`${API_BASE_URL}/purchases`, {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
    });
    if (!response.ok) {
        throw new Error(`Ошибка при получении закупок: ${response.statusText}`);
    }
    return response.json();
}

// Добавление новой закупки
export async function createPurchase(data) {
    const response = await fetch(`${API_BASE_URL}/purchases`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error(`Ошибка при добавлении закупки: ${response.statusText}`);
    }
    return response.json();
}

// Обновление закупки
export async function updatePurchase(id, data) {
    const response = await fetch(`${API_BASE_URL}/purchases/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error(`Ошибка при обновлении закупки: ${response.statusText}`);
    }
    return response.json();
}

// Удаление закупки
export async function deletePurchase(id) {
    const response = await fetch(`${API_BASE_URL}/purchases/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
    });
    if (!response.ok) {
        throw new Error(`Ошибка при удалении закупки: ${response.statusText}`);
    }
    return response.json();
}


export async function currentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/user`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    if (!response.ok) {
        throw new Error("Ошибка получения данных пользователя");
    }
    return response.json();
}

