#!/usr/bin/env python3
import duckdb
import os

DB_PATH = "/data/store.duckdb"

def main():
    # Ensure data directory exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

    # Remove existing database to start fresh
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    # Connect and execute seed script
    conn = duckdb.connect(DB_PATH)

    with open("seed.sql", "r") as f:
        sql = f.read()

    conn.execute(sql)

    # Verify data was inserted
    result = conn.execute("SELECT COUNT(*) FROM orders").fetchone()
    print(f"Seeded {result[0]} orders")

    result = conn.execute("SELECT COUNT(*) FROM products").fetchone()
    print(f"Seeded {result[0]} products")

    result = conn.execute("SELECT COUNT(*) FROM customers").fetchone()
    print(f"Seeded {result[0]} customers")

    result = conn.execute("SELECT COUNT(*) FROM order_items").fetchone()
    print(f"Seeded {result[0]} order items")

    conn.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    main()
