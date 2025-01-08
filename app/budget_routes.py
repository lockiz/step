from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from .models import db, Budget

# Создаём Blueprint для бюджета
budget_bp = Blueprint('budget', __name__)


@budget_bp.route('/budget', methods=['GET'])
@jwt_required()
def get_budget():
    """
    Получить актуальный бюджет (последняя запись).
    """
    try:
        budget = Budget.query.order_by(Budget.created_at.desc()).first()
        if not budget:
            return jsonify({"amount": 0, "created_at": None}), 200  # Возвращаем 0, если записи нет

        return jsonify({"amount": budget.amount, "created_at": budget.created_at.isoformat()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@budget_bp.route('/budget/add', methods=['POST'])
@jwt_required()
def add_budget():
    """
    Добавить новую запись в таблицу бюджета.
    """
    try:
        data = request.json
        amount = data.get('amount')

        if amount is None:
            return jsonify({"error": "Не указана сумма"}), 400

        new_budget = Budget(amount=amount)
        db.session.add(new_budget)
        db.session.commit()

        return jsonify({"message": "Новая запись бюджета добавлена", "amount": new_budget.amount}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@budget_bp.route('/budget/update_from_order', methods=['POST'])
@jwt_required()
def update_budget_from_order():
    """
    Добавить новую запись бюджета при выполненном заказе.
    """
    try:
        data = request.json
        order_total = data.get('order_total')

        if order_total is None:
            return jsonify({"error": "Не указана сумма заказа"}), 400

        new_budget = Budget(amount=order_total)
        db.session.add(new_budget)
        db.session.commit()

        return jsonify({"message": "Бюджет обновлён от заказа", "amount": new_budget.amount}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@budget_bp.route('/budget/update_from_expense', methods=['POST'])
@jwt_required()
def update_budget_from_expense():
    """
    Добавить новую запись бюджета при добавлении расхода.
    """
    try:
        data = request.json
        expense_amount = data.get('expense_amount')

        if expense_amount is None:
            return jsonify({"error": "Не указана сумма расхода"}), 400

        new_budget = Budget(amount=-expense_amount)
        db.session.add(new_budget)
        db.session.commit()

        return jsonify({"message": "Бюджет обновлён от расхода", "amount": new_budget.amount}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
