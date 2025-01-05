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


def add_order():
    try:
        data = request.get_json()
        print(data)
        # Если поле равно None, заменяем на пустую строку
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


def update_order(order_id):
    try:
        data = request.json
        order = Order.query.get_or_404(order_id)

        # Обновляем поля заказа
        order.order_responsible = data.get('orderResponsible', order.order_responsible)
        order.priority = data.get('priority', order.priority)
        order.order_status = data.get('orderStatus', order.order_status)
        order.order_date = data.get('orderDate', order.order_date)
        order.order_source = data.get('orderSource', order.order_source)
        order.delivery_type = data.get('deliveryType', order.delivery_type)
        order.delivery_address = data.get('deliveryAddress', order.delivery_address)
        order.pickup_point = data.get('pickupPoint', order.pickup_point)
        order.tracking_number = data.get('trackingNumber', order.tracking_number)
        order.avito_link = data.get('avitoLink', order.avito_link)
        order.avito_profile_link = data.get('avitoProfileLink', order.avito_profile_link)
        order.prepayment = data.get('prepayment', order.prepayment)
        order.discount = data.get('discount', order.discount)
        order.total_amount = data.get('totalAmount', order.total_amount)
        order.products = data.get('products', order.products)

        db.session.commit()
        return jsonify({'message': 'Order updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# -------------------------------
# Новые функции для товаров и деталей
# -------------------------------

def get_products():
    products = Product.query.all()
    result = []
    for product in products:
        bom_parts = ProductPart.query.filter_by(product_id=product.id).all()
        bom = [
            {"id": part.part.id, "name": part.part.name, "quantity_needed": part.quantity_needed}
            for part in bom_parts
        ]
        result.append({
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "quantity": product.quantity,
            "photo": product.photo,
            "characteristics": product.characteristics,
            "color": product.color,
            "plastic": product.plastic,
            "printing_time": product.printing_time,
            "cost_price": product.cost_price,
            "dimensions": product.dimensions,
            "comment": product.comment,
            "status": product.status,
            "sales_count": product.sales_count,
            "bom": bom,  # Добавляем BOM
        })
    return jsonify(result)


def add_product():
    data = request.json
    product = Product(
        name=data['name'],
        price=data['price'],
        quantity=data['quantity'],
        photo=data.get('photo'),  # Обработка поля фото
        characteristics=data.get('characteristics', ''),
        color=data.get('color', ''),
        plastic=data.get('plastic', ''),
        printing_time=data.get('printing_time', ''),
        cost_price=data.get('cost_price', 0.0),
        dimensions=data.get('dimensions', ''),
        comment=data.get('comment', ''),
        status=data.get('status', 'Active'),
        sales_count=data.get('sales_count', 0),
    )
    db.session.add(product)
    db.session.commit()

    # Пересчет недостающих деталей
    calculate_shortages()

    # Обработка BOM (если передан)
    if 'bom' in data:
        for part_id in data['bom']:
            product_part = ProductPart(
                product_id=product.id,
                part_id=part_id,
                quantity_needed=1  # Укажите логику определения количества
            )
            db.session.add(product_part)
        db.session.commit()

    return jsonify({'message': 'Product added successfully', 'product_id': product.id})


def update_product(product_id):
    data = request.json
    product = Product.query.get_or_404(product_id)

    # Обновление данных товара
    product.name = data['name']
    product.price = data['price']
    product.quantity = data['quantity']
    product.photo = data.get('photo', product.photo)
    product.characteristics = data.get('characteristics', product.characteristics)
    product.color = data.get('color', product.color)
    product.plastic = data.get('plastic', product.plastic)
    product.printing_time = data.get('printing_time', product.printing_time)
    product.cost_price = data.get('cost_price', product.cost_price)
    product.dimensions = data.get('dimensions', product.dimensions)
    product.comment = data.get('comment', product.comment)
    product.status = data.get('status', product.status)
    product.sales_count = data.get('sales_count', product.sales_count)

    # Обновление связей BOM
    if 'bom' in data:
        ProductPart.query.filter_by(product_id=product_id).delete()
        for part_id in data['bom']:
            new_bom = ProductPart(
                product_id=product_id,
                part_id=part_id,
                quantity_needed=1  # Установите логику для количества
            )
            db.session.add(new_bom)

    db.session.commit()

    # Пересчет недостающих деталей
    calculate_shortages()
    return jsonify({'message': 'Product updated successfully'})


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

    # Пересчет недостающих деталей
    calculate_shortages()

    return jsonify({'message': 'Part added successfully', 'part_id': new_part.id}), 201


def update_part(part_id):
    """
    Обновление детали
    """
    data = request.json
    part = Part.query.get_or_404(part_id)

    # Обновление полей детали
    part.name = data.get('name', part.name)
    part.quantity = data.get('quantity', part.quantity)
    part.photo = data.get('photo', part.photo)
    part.color = data.get('color', part.color)
    part.printing_time = data.get('printing_time', part.printing_time)
    part.weight = data.get('weight', part.weight)

    db.session.commit()
    return jsonify({'message': 'Part updated successfully'})


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


def calculate_shortages():
    """
    Рассчитывает недостающие товары и детали для выполнения всех заказов со статусом "Новый заказ".
    """
    try:
        # Получаем заказы со статусом "Новый заказ"
        orders = Order.query.filter_by(order_status="Новый заказ").all()
        shortages = {}  # Словарь для недостающих деталей
        product_quantities = {}  # Словарь для учёта остатков товаров

        print(f"Всего заказов со статусом 'Новый заказ': {len(orders)}")

        # Заполняем начальные остатки товаров
        all_products = Product.query.all()
        for product in all_products:
            product_quantities[product.id] = product.quantity

        # Проходим по каждому заказу
        for order in orders:
            if not order.products:
                continue

            # Проходим по каждому товару в заказе
            for product_item in order.products:
                product = Product.query.get(product_item['id'])
                if not product:
                    print(f"Товар с ID {product_item['id']} не найден!")
                    continue

                quantity_needed = product_item['quantity']  # Сколько товара нужно в заказе
                available_quantity = product_quantities.get(product.id, 0)  # Сколько товара доступно

                # Рассчитываем нехватку товара
                shortage = max(quantity_needed - available_quantity, 0)

                print(
                    f"Товара '{product.name}': нужно {quantity_needed}, "
                    f"есть {available_quantity}, нехватка {shortage}"
                )

                # Обновляем остаток товара
                product_quantities[product.id] = max(available_quantity - quantity_needed, 0)

                # Если товара не хватает, рассчитываем детали из BOM
                if shortage > 0:
                    for bom_item in product.bom_items:
                        part = Part.query.get(bom_item.part_id)
                        if not part:
                            print(f"Деталь с ID {bom_item.part_id} не найдена!")
                            continue

                        # Рассчитываем количество деталей, которое требуется
                        total_needed = shortage * bom_item.quantity_needed
                        current_shortage = max(total_needed - part.quantity, 0)

                        if current_shortage > 0:
                            if part.id not in shortages:
                                shortages[part.id] = {
                                    'name': part.name,
                                    'needed': 0,
                                }
                            shortages[part.id]['needed'] += current_shortage

                            print(
                                f"Деталь '{part.name}': нужно {total_needed}, "
                                f"есть {part.quantity}, нехватка: {current_shortage}"
                            )

        # Преобразуем словарь в список
        final_shortages = [
            {'name': data['name'], 'needed': data['needed']}
            for data in shortages.values()
        ]

        print("Итоговые недостающие детали:", final_shortages)
        return jsonify(final_shortages), 200
    except Exception as e:
        print("Ошибка в calculate_shortages:", str(e))
        return jsonify({'error': str(e)}), 500


# -------------------------
# Регистрация маршрутов
# -------------------------
def register_routes(app):
    app.add_url_rule('/add_order', view_func=add_order, methods=['POST'])
    app.add_url_rule('/get_orders', view_func=get_orders, methods=['GET'])

    # Товары
    app.add_url_rule('/products', view_func=get_products, methods=['GET'])
    app.add_url_rule('/products', view_func=add_product, methods=['POST'])
    app.add_url_rule('/products/<int:product_id>', view_func=update_product, methods=['PUT'])

    # Детали
    app.add_url_rule('/parts', view_func=get_parts, methods=['GET'])
    app.add_url_rule('/parts', view_func=add_part, methods=['POST'])
    app.add_url_rule('/parts/<int:part_id>', view_func=update_part, methods=['PUT'])

    # BOM
    app.add_url_rule('/products/<int:product_id>/bom', view_func=get_bom, methods=['GET'])
    app.add_url_rule('/products/bom', view_func=add_bom, methods=['POST'])
    # Загрузка изображений
    app.add_url_rule('/upload_image', view_func=upload_image, methods=['POST'])
    app.add_url_rule('/calculate_shortages', view_func=calculate_shortages, methods=['GET'])
