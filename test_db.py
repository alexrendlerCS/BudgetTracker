import psycopg2
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Fetch database credentials
DATABASE_URL = os.getenv("DATABASE_URL")

try:
    # Connect to the database
    connection = psycopg2.connect(DATABASE_URL)
    cursor = connection.cursor()

    # Check if tables exist
    cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
    tables = cursor.fetchall()

    print("✅ Tables in database:", tables)

    # Close connection
    cursor.close()
    connection.close()

except Exception as e:
    print(f"❌ Database connection failed: {e}")
