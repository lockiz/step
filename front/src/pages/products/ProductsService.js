const BASE_URL = 'http://127.0.0.1:5001';

// Получение списка товаров
export async function getProducts() {
    const response = await fetch(`${BASE_URL}/products`);
    if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    return response.json();
}

// Добавление нового товара
export async function addProduct(productData) {
    const response = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(productData),
    });
    if (!response.ok) {
        throw new Error(`Failed to add product: ${response.statusText}`);
    }
    return response.json();
}

// Обновление товара
export async function updateProduct(productId, productData) {
    const response = await fetch(`${BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(productData),
    });
    if (!response.ok) {
        throw new Error(`Failed to update product: ${response.statusText}`);
    }
    return response.json();
}

// Удаление товара (архивирование)
export async function archiveProduct(productId) {
    const response = await fetch(`${BASE_URL}/products/${productId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`Failed to archive product: ${response.statusText}`);
    }
    return response.json();
}

// Загрузка изображения
export async function uploadProductImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/upload_image`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.statusText}`);
    }
    return response.json();
}

// Получение списка деталей
export async function getParts() {
    const response = await fetch(`${BASE_URL}/parts`);
    if (!response.ok) {
        throw new Error(`Failed to fetch parts: ${response.statusText}`);
    }
    return response.json();
}

// Добавление новой детали
export async function addPart(partData) {
    const response = await fetch(`${BASE_URL}/parts`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(partData),
    });
    if (!response.ok) {
        throw new Error(`Failed to add part: ${response.statusText}`);
    }
    return response.json();
}

// Получение BOM для товара
export async function getBOM(productId) {
    const response = await fetch(`${BASE_URL}/products/${productId}/bom`);
    if (!response.ok) {
        throw new Error(`Failed to fetch BOM: ${response.statusText}`);
    }
    return response.json();
}

// Добавление BOM для товара
export async function addBOM(bomData) {
    const response = await fetch(`${BASE_URL}/products/bom`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(bomData),
    });
    if (!response.ok) {
        throw new Error(`Failed to add BOM: ${response.statusText}`);
    }
    return response.json();
}
