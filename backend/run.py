from backend.database import create_app, db
from backend.routes import api  # ✅ Ensure routes are imported
from flask_migrate import Migrate

# Initialize Flask app
app = create_app()
app.register_blueprint(api, url_prefix="/")  # ✅ Register API routes

# Setup Flask-Migrate
migrate = Migrate(app, db)

if __name__ == "__main__":
    app.run(debug=True)
