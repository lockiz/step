import os


class Config:
    # Допустим, база лежит в папке instance/orders.db
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(BASE_DIR, "instance", "orders.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Можно задать SECRET_KEY, если нужно
    SECRET_KEY = 'secret_string_for_sessions'
