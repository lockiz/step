from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()


def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    # Включаем CORS, чтобы фронт (на localhost:3000) мог делать запросы.
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
        return response

    db.init_app(app)

    with app.app_context():
        from .routes import register_routes
        register_routes(app)  # Регистрация всех маршрутов
        db.create_all()  # Создаём таблицы (если их нет)

    return app
