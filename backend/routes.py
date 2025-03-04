from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from backend.database import db
from backend.models import User, Expense
from datetime import datetime
from flask_cors import CORS  # ✅ Import CORS first

api = Blueprint("api", __name__)  # ✅ Define api BEFORE using it
CORS(api)  # ✅ Apply CORS to all routes within the Blueprint

# -------------------- CORS Handling for Preflight Requests --------------------
@api.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# -------------------- USER PROFILE (Fetch Budget) --------------------
@api.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "budget": float(user.budget) if user.budget is not None else 2000  # ✅ Convert to float
    }), 200


# -------------------- UPDATE BUDGET --------------------

@api.route("/update-budget", methods=["PUT"])
@jwt_required()
def update_budget():
    user_id = get_jwt_identity()
    data = request.get_json()

    if "budget" not in data:
        return jsonify({"error": "Missing budget value"}), 400

    try:
        budget_value = float(data["budget"])  # Ensure it's a valid number
    except ValueError:
        return jsonify({"error": "Invalid budget value"}), 400

    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.budget = budget_value
    db.session.commit()

    return jsonify({"message": "Budget updated successfully", "budget": user.budget}), 200

# -------------------- USER REGISTRATION --------------------
@api.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"error": "Username already exists"}), 400

    new_user = User(username=username)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

# -------------------- USER LOGIN --------------------
@api.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": access_token}), 200

# -------------------- ADD & GET EXPENSES --------------------
@api.route("/expenses", methods=["POST", "GET"])
@jwt_required()
def handle_expenses():
    user_id = get_jwt_identity()

    if request.method == "POST":
        data = request.get_json()

        if not data or "amount" not in data or "category" not in data:
            return jsonify({"error": "Invalid input"}), 400

        # If no date is provided, use the current date
        expense_date = data.get("date")
        if not expense_date:
            expense_date = datetime.utcnow().date()  # Default to today's date

        new_expense = Expense(
            user_id=user_id,
            amount=data["amount"],
            category=data["category"],
            description=data.get("description", ""),
            date=expense_date
        )

        db.session.add(new_expense)
        db.session.commit()

        return jsonify({"message": "Expense added successfully"}), 201

    elif request.method == "GET":
        expenses = Expense.query.filter_by(user_id=user_id).all()
        expense_list = [
            {
                "id": e.id,
                "amount": e.amount,
                "category": e.category,
                "description": e.description,
                "date": e.date.isoformat() if e.date else None
            }
            for e in expenses
        ]
        return jsonify(expense_list), 200
