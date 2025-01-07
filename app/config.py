import os
from datetime import timedelta


class Config:
    # Допустим, база лежит в папке instance/orders.db
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(BASE_DIR, "instance", "orders.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Можно задать SECRET_KEY, если нужно
    SECRET_KEY = 'secret_string_for_sessions'

    # Настройки JWT
    JWT_SECRET_KEY = 'your_jwt_secret_key'  # Замените на свой секретный ключ
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)  # Продление жизни токена на неделю
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)  # Продление жизни Refresh Token на месяц
