import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Text, Float
from sqlalchemy.orm import relationship
from .extensions import db
from sqlalchemy.schema import UniqueConstraint


class Role(db.Model):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)


class User(db.Model):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(150), nullable=False)  # Убираем `unique` из определения поля
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    avatar_url = Column(String(200), nullable=True)
    password_hash = Column(String(128), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    role = db.relationship("Role", backref="users")  # Установка связи с моделью Role
    is_approved = Column(Boolean, default=False)

    # Добавляем имя для уникального ограничения
    __table_args__ = (
        UniqueConstraint("email", name="uq_users_email"),
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Order(db.Model):
    """
    Таблица заказов
    """
    id = db.Column(db.Integer, primary_key=True)
    order_responsible = db.Column(db.String(50), nullable=True)
    priority = db.Column(db.String(50), nullable=True)
    order_status = db.Column(db.String(50), nullable=True)
    order_date = db.Column(db.JSON, nullable=True)
    order_source = db.Column(db.String(50), nullable=True)
    delivery_type = db.Column(db.String(50), nullable=True)
    delivery_address = db.Column(db.String(50), nullable=True)
    pickup_point = db.Column(db.String(50), nullable=True)
    tracking_number = db.Column(db.String(50), nullable=True)
    avito_link = db.Column(db.String(50), nullable=True)
    avito_profile_link = db.Column(db.String(50), nullable=True)
    prepayment = db.Column(db.String(50), nullable=True)
    discount = db.Column(db.String(50), nullable=True)
    total_amount = db.Column(db.String(50), nullable=True)
    products = db.Column(db.JSON, nullable=True)  # JSON-список товаров в заказе
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)  # Дата создания заказа

    def __repr__(self):
        return f"<Order {self.id}>"


class Product(db.Model):
    """
    Таблица товаров
    """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, default=0.0)
    quantity = db.Column(db.Integer, default=0)
    photo = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(50), default='Active')
    characteristics = db.Column(db.String(500), nullable=True)
    color = db.Column(db.String(50), nullable=True)
    printing_time = db.Column(db.String(50), nullable=True)  # Суммарное время печати
    cost_price = db.Column(db.Float, default=0.0)
    dimensions = db.Column(db.String(100), nullable=True)
    comment = db.Column(db.String(500), nullable=True)
    date_added = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    sales_count = db.Column(db.Integer, default=0)
    weight = db.Column(db.Float, default=0.0)  # Вес в граммах
    plastic = db.Column(db.String(50), nullable=True)

    def __repr__(self):
        return f"<Product {self.id} {self.name}>"


class Part(db.Model):
    """
    Таблица деталей (например, втулки, клипсы).
    """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, default=0)
    photo = db.Column(db.String(200), nullable=True)
    color = db.Column(db.String(50), nullable=True)
    printing_time = db.Column(db.String(50), nullable=True)  # Время печати детали
    weight = db.Column(db.Float, default=0.0)  # Вес детали в граммах

    def __repr__(self):
        return f"<Part {self.id} {self.name}>"


class ProductPart(db.Model):
    """
    Таблица BOM (Bill of Materials): сколько деталей нужно для одного товара.
    """
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    part_id = db.Column(db.Integer, db.ForeignKey('part.id'), nullable=False)
    quantity_needed = db.Column(db.Integer, default=1)

    product = db.relationship("Product", backref="bom_items")
    part = db.relationship("Part")

    def __repr__(self):
        return f"<ProductPart {self.product_id} -> {self.part_id}>"


class Purchase(db.Model):
    """
    Таблица для учета закупок.
    """
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)  # Название закупки
    link = Column(String(500), nullable=True)  # Ссылка на товар
    date = Column(db.DateTime, nullable=True)  # Дата закупки
    cost = Column(Float, nullable=False)  # Стоимость
    category = Column(String(50), nullable=False)  # Категория закупки
    status = Column(String(50), nullable=True)  # Статус закупки
    payment_status = Column(String(50), nullable=True)  # Статус оплаты
    priority = Column(String(50), nullable=True)  # Приоритет
    notes = Column(Text, nullable=True)  # Примечания
    photo = Column(String(500), nullable=True)  # URL фотографии
    created_at = Column(db.DateTime, default=datetime.datetime.utcnow)  # Используем datetime.utcnow
    added_by = Column(Integer, ForeignKey("users.id"), nullable=False)  # Кто добавил закупку

    added_by_user = relationship("User", backref="purchases")  # Связь с таблицей пользователей


class Budget(db.Model):
    __tablename__ = 'budget'
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return f"<Budget(amount={self.amount}, created_at={self.created_at})>"
