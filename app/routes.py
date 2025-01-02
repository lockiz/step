import os
import datetime
import uuid
from flask import request, jsonify, current_app
from werkzeug.utils import secure_filename

from . import db
from .models import db, Order, Product, ProductPart, Part

# -------------------------------
# Существующие маршруты и функции
# -------------------------------

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        ext = filename.rsplit('.', 1)[1].lower()
        unique_name = f"{datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex}.{ext}"

        upload_folder = os.path.join(current_app.root_path, 'static', 'uploads')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        save_path = os.path.join(upload_folder, unique_name)
        file.save(save_path)

        return jsonify({'message': 'File uploaded successfully', 'filename': unique_name}), 200
    else:
        return jsonify({'error': 'File not allowed'}), 400


def get_orders():
    orders = Order.query.all()
    result = []
    for order in orders:
        result.append({
            'id': order.id,
            'order_responsible': order.order_responsible,
            'priority': order.priority,
            'order_status': order.order_status,
            'order_date': order.order_date,
            'order_source': order.order_source,
            'delivery_type': order.delivery_type,
            'delivery_address': order.delivery_address,
            'pickup_point': order.pickup_point,
            'tracking_number': order.tracking_number,
            'avito_link': order.avito_link,
            'avito_profile_link': order.avito_profile_link,
            'prepayment': order.prepayment,
            'discount': order.discount,
            'total_amount': order.total_amount,
            'products': order.products
        })
    return jsonify(result), 200


# -------------------------------
# Новые функции для товаров и деталей
# -------------------------------

def get_products():
    products = Product.query.order_by(Product.id.desc()).all()
    result = []
    for product in products:
        result.append({
            'id': product.id,
            'name': product.name,
            'price': product.price,
            'quantity': product.quantity,
            'photo': product.photo,
            'status': product.status,
            'characteristics': product.characteristics,
            'color': product.color,
            'plastic': product.plastic,
            'printing_time': product.printing_time,
            'cost_price': product.cost_price,
            'dimensions': product.dimensions,
            'comment': product.comment,
            'date_added': product.date_added.isoformat() if product.date_added else None,
            'sales_count': product.sales_count
        })
    return jsonify(result), 200


def add_product():
    data = request.get_json()
    new_product = Product(
        name=data['name'],
        price=data['price'],
        quantity=data['quantity'],
        photo=data.get('photo'),  # Получение имени файла
        status=data.get('status', 'Active'),
        characteristics=data.get('characteristics', ''),
        color=data.get('color', ''),
        printing_time=data.get('printing_time', ''),
        cost_price=data.get('cost_price', 0.0),
        dimensions=data.get('dimensions', ''),
        comment=data.get('comment', ''),
        weight=data.get('weight', 0.0)
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify({'message': 'Product added successfully', 'product_id': new_product.id}), 201


def update_product(product_id):
    data = request.get_json()
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    product.name = data['name']
    product.price = data['price']
    product.quantity = data['quantity']
    product.photo = data.get('photo')
    product.plastic = data.get('plastic')
    db.session.commit()

    return jsonify({'message': 'Product updated successfully'}), 200


def get_parts():
    parts = Part.query.all()
    result = []
    for part in parts:
        result.append({
            'id': part.id,
            'name': part.name,
            'quantity': part.quantity,
            'photo': part.photo,  # Убедитесь, что это поле возвращается
            'color': part.color,
            'printing_time': part.printing_time,
            'weight': part.weight
        })
    return jsonify(result), 200


def add_part():
    data = request.get_json()
    new_part = Part(
        name=data['name'],
        quantity=data['quantity'],
        photo=data.get('photo'),  # Добавьте это, если отсутствует
        color=data.get('color', ''),
        printing_time=data.get('printing_time', ''),
        weight=data.get('weight', 0.0)
    )
    db.session.add(new_part)
    db.session.commit()
    return jsonify({'message': 'Part added successfully', 'part_id': new_part.id}), 201


def get_bom(product_id):
    bom_items = ProductPart.query.filter_by(product_id=product_id).all()
    result = []
    for item in bom_items:
        result.append({
            'id': item.id,
            'part_id': item.part_id,
            'part_name': item.part.name,
            'quantity_needed': item.quantity_needed,
            'photo': item.part.photo
        })
    return jsonify(result), 200


def add_bom():
    data = request.get_json()
    new_bom = ProductPart(
        product_id=data['product_id'],
        part_id=data['part_id'],
        quantity_needed=data['quantity_needed']
    )
    db.session.add(new_bom)
    db.session.commit()
    return jsonify({'message': 'BOM added successfully'}), 201


def check_shortages():
    """
    Проверка нехватки товаров на складе.
    """
    shortages = []
    products = Product.query.all()
    for product in products:
        if product.quantity < 10:  # Пример условия нехватки: если количество товара меньше 10
            shortages.append({
                'product_id': product.id,
                'name': product.name,
                'shortage': 10 - product.quantity,  # Сколько не хватает до минимума
            })
    return jsonify(shortages), 200


# -------------------------
# Регистрация маршрутов
# -------------------------
def register_routes(app):
    app.add_url_rule('/get_orders', view_func=get_orders, methods=['GET'])

    # Товары
    app.add_url_rule('/products', view_func=get_products, methods=['GET'])
    app.add_url_rule('/products', view_func=add_product, methods=['POST'])

    # Детали
    app.add_url_rule('/parts', view_func=get_parts, methods=['GET'])
    app.add_url_rule('/parts', view_func=add_part, methods=['POST'])

    # BOM
    app.add_url_rule('/products/<int:product_id>/bom', view_func=get_bom, methods=['GET'])
    app.add_url_rule('/products/bom', view_func=add_bom, methods=['POST'])
    # Загрузка изображений
    app.add_url_rule('/upload_image', view_func=upload_image, methods=['POST'])
    app.add_url_rule('/check_shortages', view_func=check_shortages, methods=['GET'])
    app.add_url_rule('/products/<int:product_id>', view_func=update_product, methods=['PUT'])

