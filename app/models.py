import datetime
from . import db
from sqlalchemy.dialects.postgresql import JSON

class Order(db.Model):
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
    products = db.Column(db.JSON, nullable=True)

    def __repr__(self):
        return f'<Order {self.id}>'

# Новая модель "Product" для управления товарами (склад)
class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date_added = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, default=0.0)
    quantity = db.Column(db.Integer, default=0)
    photo = db.Column(db.String(200), nullable=True)

    # Дополнительные поля
    characteristics = db.Column(db.String(500), nullable=True)
    color = db.Column(db.String(50), nullable=True)
    plastic = db.Column(db.String(50), nullable=True)
    printing_time = db.Column(db.String(50), nullable=True)
    cost_price = db.Column(db.Float, default=0.0)
    dimensions = db.Column(db.String(100), nullable=True)
    comment = db.Column(db.String(500), nullable=True)

    status = db.Column(db.String(50), default='Active')  # Active / Archived

    # Дополнительные поля для аналитики (необязательно, пример)
    sales_count = db.Column(db.Integer, default=0)
    last_sold_date = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f'<Product {self.id} {self.name}>'
