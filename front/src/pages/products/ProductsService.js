export async function getProducts() {
    const response = await fetch('http://localhost:5001/products');
    if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    return response.json();
}

export async function addProduct(productData) {
    const response = await fetch('http://localhost:5001/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
    });
    if (!response.ok) {
        throw new Error(`Failed to add product: ${response.statusText}`);
    }
    return response.json();
}

export async function updateProduct(productId, productData) {
    const response = await fetch(`http://localhost:5001/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
    });
    if (!response.ok) {
        throw new Error(`Failed to update product: ${response.statusText}`);
    }
    return response.json();
}

export async function getParts() {
    const response = await fetch('http://localhost:5001/parts');
    if (!response.ok) {
        throw new Error(`Failed to fetch parts: ${response.statusText}`);
    }
    return response.json();
}

export async function addPart(partData) {
    const response = await fetch('http://localhost:5001/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partData),
    });
    if (!response.ok) {
        throw new Error(`Failed to add part: ${response.statusText}`);
    }
    return response.json();
}

export async function getBOM(productId) {
    const response = await fetch(`http://localhost:5001/products/${productId}/bom`);
    if (!response.ok) {
        throw new Error(`Failed to fetch BOM: ${response.statusText}`);
    }
    return response.json();
}

export async function addBOM(bomData) {
    const response = await fetch('http://localhost:5001/products/bom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bomData),
    });
    if (!response.ok) {
        throw new Error(`Failed to add BOM: ${response.statusText}`);
    }
    return response.json();
}
