from flask import Flask
from flask_cors import CORS

from .budget_routes import budget_bp
from .extensions import db, migrate, jwt


def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    # Включаем CORS
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

    @app.after_request
    def after_request(response):
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    with app.app_context():
        from .routes import register_routes, auth_bp
        app.register_blueprint(auth_bp, url_prefix="/auth")
        app.register_blueprint(budget_bp, url_prefix='/api')
        register_routes(app)
        db.create_all()

    return app
