import requests

# Ваши данные API
CLIENT_ID = 'your_client_id'
CLIENT_SECRET = 'your_client_secret'
API_URL = 'https://api.avito.ru/orders'
OAUTH_TOKEN_URL = 'https://api.avito.ru/token'


# Функция для получения токена доступа
def get_access_token(client_id, client_secret):
    response = requests.post(
        OAUTH_TOKEN_URL,
        data={
            'grant_type': 'client_credentials',
            'client_id': client_id,
            'client_secret': client_secret,
        },
    )
    response.raise_for_status()
    return response.json().get('access_token')


# Получаем токен
access_token = get_access_token(CLIENT_ID, CLIENT_SECRET)

# Заголовки для авторизации
headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json',
}

# Делаем запрос к API для получения списка заказов
response = requests.get(API_URL, headers=headers)

# Проверяем и обрабатываем ответ
if response.status_code == 200:
    orders = response.json()
    print("Список заказов:", orders)
else:
    print("Ошибка:", response.status_code, response.text)
