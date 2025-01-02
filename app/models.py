import datetime
from . import db


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
