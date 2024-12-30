import os
import datetime
import uuid
from flask import request, jsonify, current_app
from werkzeug.utils import secure_filename

from . import db
from .models import Order, Product


# -------------------------------
# Существующие функции для заказов
# -------------------------------
def add_order():
    try:
        data = request.get_json()
        print(data)
        new_order = Order(
            order_responsible=data.get('orderResponsible', ''),
            priority=data.get('priority', ''),
            order_status=data.get('orderStatus', ''),
            order_date=data.get('orderDate', []),
            order_source=data.get('orderSource', ''),
            delivery_type=data.get('deliveryType', ''),
            delivery_address=data.get('deliveryAddress', ''),
            pickup_point=data.get('pickupPoint', ''),
            tracking_number=data.get('trackingNumber', ''),
            avito_link=data.get('avitoLink', ''),
            avito_profile_link=data.get('avitoProfileLink', ''),
            prepayment=data.get('prepayment', 0),
            discount=data.get('discount', 0),
            total_amount=data.get('totalAmount', 0),
            products=data.get('products', [])
        )

        db.session.add(new_order)
        db.session.commit()

        return jsonify({'message': 'Order created successfully', 'order_id': new_order.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


def get_orders():
    orders = Order.query.all()
    orders_list = []
    for order in orders:
        orders_list.append({
            'id': order.id,
            'orderResponsible': order.order_responsible,
            'priority': order.priority,
            'orderStatus': order.order_status,
            'orderDate': order.order_date,
            'orderSource': order.order_source,
            'deliveryType': order.delivery_type,
            'deliveryAddress': order.delivery_address,
            'pickupPoint': order.pickup_point,
            'trackingNumber': order.tracking_number,
            'avitoLink': order.avito_link,
            'avitoProfileLink': order.avito_profile_link,
            'prepayment': order.prepayment,
            'discount': order.discount,
            'totalAmount': order.total_amount,
            'products': order.products
        })
    return jsonify(orders_list)


# -------------------------------
# Функции для товаров
# -------------------------------
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# 1) Загрузка файла (фото) в /app/static/uploads/
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

        # Папка для загрузки
        upload_folder = os.path.join(current_app.root_path, 'static', 'uploads')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        save_path = os.path.join(upload_folder, unique_name)
        file.save(save_path)

        return jsonify({
            'message': 'File uploaded successfully',
            'filename': unique_name
        }), 200
    else:
        return jsonify({'error': 'File not allowed'}), 400


# 2) Список товаров
def get_products():
    products = Product.query.order_by(Product.id.desc()).all()
    result = []
    for p in products:
        result.append({
            'id': p.id,
            'dateAdded': p.date_added.isoformat() if p.date_added else None,
            'name': p.name,
            'price': p.price,
            'quantity': p.quantity,
            'photo': p.photo,
            'characteristics': p.characteristics,
            'color': p.color,
            'plastic': p.plastic,
            'printing_time': p.printing_time,
            'cost_price': p.cost_price,
            'dimensions': p.dimensions,
            'comment': p.comment,
            'status': p.status,
            # Поля аналитики
            'sales_count': p.sales_count,
            'last_sold_date': p.last_sold_date.isoformat() if p.last_sold_date else None
        })
    return jsonify(result), 200


# 3) Добавление товара
def add_product():
    data = request.get_json()
    new_product = Product(
        name=data['name'],
        price=float(data.get('price', 0.0)),
        quantity=int(data.get('quantity', 0)),
        photo=data.get('photo', ''),

        characteristics=data.get('characteristics', ''),
        color=data.get('color', ''),
        plastic=data.get('plastic', ''),
        printing_time=data.get('printing_time', ''),
        cost_price=float(data.get('cost_price', 0.0)),
        dimensions=data.get('dimensions', ''),
        comment=data.get('comment', ''),
        status=data.get('status', 'Active'),

        sales_count=int(data.get('sales_count', 0)),
    )
    db.session.add(new_product)
    db.session.commit()
    return jsonify({'message': 'Product added successfully'}), 201


# 4) Обновление товара
def update_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    data = request.get_json()

    product.name = data['name']
    product.price = float(data['price'])
    product.quantity = int(data['quantity'])
    product.photo = data.get('photo', product.photo)

    product.characteristics = data.get('characteristics', product.characteristics)
    product.color = data.get('color', product.color)
    product.plastic = data.get('plastic', product.plastic)
    product.printing_time = data.get('printing_time', product.printing_time)
    product.cost_price = float(data.get('cost_price', product.cost_price))
    product.dimensions = data.get('dimensions', product.dimensions)
    product.comment = data.get('comment', product.comment)
    product.status = data.get('status', product.status)

    # Аналитика
    product.sales_count = int(data.get('sales_count', product.sales_count))
    # Если хотим обновлять дату последней продажи, можно:
    # product.last_sold_date = datetime.datetime.utcnow()

    db.session.commit()
    return jsonify({'message': 'Product updated successfully'}), 200


# 5) Архивирование (вместо удаления)
def archive_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    product.status = 'Archived'
    db.session.commit()
    return jsonify({'message': 'Product archived successfully'}), 200


# -------------------------
# Регистрация маршрутов
# -------------------------
def register_routes(app):
    # Заказы
    app.add_url_rule('/add_order', view_func=add_order, methods=['POST'])
    app.add_url_rule('/get_orders', view_func=get_orders, methods=['GET'])

    # Товары
    app.add_url_rule('/upload_image', view_func=upload_image, methods=['POST'])
    app.add_url_rule('/products', view_func=get_products, methods=['GET'])
    app.add_url_rule('/products', view_func=add_product, methods=['POST'])
    app.add_url_rule('/products/<int:product_id>', view_func=update_product, methods=['PUT'])
    app.add_url_rule('/products/<int:product_id>', view_func=archive_product, methods=['DELETE'])
