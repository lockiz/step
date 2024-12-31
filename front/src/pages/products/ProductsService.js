// ProductsService.js
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
        headers: {'Content-Type': 'application/json'},
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
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(productData),
    });
    if (!response.ok) {
        throw new Error(`Failed to update product: ${response.statusText}`);
    }
    return response.json();
}

export async function archiveProduct(productId) {
    const response = await fetch(`http://localhost:5001/products/${productId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error(`Failed to archive product: ${response.statusText}`);
    }
    return response.json();
}

export async function uploadProductImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:5001/upload_image', {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.statusText}`);
    }
    return response.json();
}
