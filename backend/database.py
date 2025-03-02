from flask import Flask
from flask_sqlalchemy import SQLAlchemy  # ✅ Ensure this is imported
from flask_jwt_extended import JWTManager  # ✅ Ensure JWT is imported
from flask_cors import CORS  # ✅ Import CORS
from backend.config import Config

db = SQLAlchemy()  # ✅ Define SQLAlchemy instance
jwt = JWTManager()  # ✅ Define JWTManager instance

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)  # ✅ Initialize database
    jwt.init_app(app)  # ✅ Initialize JWT authentication
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # ✅ Enable CORS for frontend

    from backend import models  # ✅ Ensure models are imported

    return app
