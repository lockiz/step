import os
import datetime
import uuid
from flask import request, jsonify, current_app
from werkzeug.utils import secure_filename
from . import db
from .models import db, Order, ProductPart, Part, Product


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

        return jsonify({
            'message': 'File uploaded successfully',
            'filename': unique_name
        }), 200
    else:
        return jsonify({'error': 'File not allowed'}), 400


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
            'sales_count': p.sales_count,
            'last_sold_date': p.last_sold_date.isoformat() if p.last_sold_date else None
        })
    return jsonify(result), 200


def add_product():
    try:
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
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


def get_parts():
    parts = Part.query.all()
    result = [{'id': p.id, 'name': p.name, 'quantity': p.quantity} for p in parts]
    return jsonify(result), 200


def add_part():
    data = request.get_json()
    new_part = Part(
        name=data['name'],
        quantity=int(data.get('quantity', 0))
    )
    db.session.add(new_part)
    db.session.commit()
    return jsonify({'message': 'Part added successfully'}), 201


def get_bom(product_id):
    bom_items = ProductPart.query.filter_by(product_id=product_id).all()
    result = [{'id': b.id, 'part_id': b.part_id, 'part_name': b.part.name, 'quantity_needed': b.quantity_needed} for b
              in bom_items]
    return jsonify(result), 200


def add_bom():
    data = request.get_json()
    new_bom = ProductPart(
        product_id=data['product_id'],
        part_id=data['part_id'],
        quantity_needed=int(data['quantity_needed'])
    )
    db.session.add(new_bom)
    db.session.commit()
    return jsonify({'message': 'BOM added successfully'}), 201


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

    # Части
    app.add_url_rule('/parts', view_func=get_parts, methods=['GET'])
    app.add_url_rule('/parts', view_func=add_part, methods=['POST'])

    # BOM
    app.add_url_rule('/products/<int:product_id>/bom', view_func=get_bom, methods=['GET'])
    app.add_url_rule('/products/bom', view_func=add_bom, methods=['POST'])
