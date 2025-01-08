import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api";

// Получить актуальный бюджет
export async function getBudget() {
    const response = await axios.get(`${API_BASE_URL}/budget`);
    return response.data;
}

// Добавить новую запись бюджета
export async function addBudget(amount) {
    const response = await axios.post(`${API_BASE_URL}/budget/add`, {amount});
    return response.data;
}
