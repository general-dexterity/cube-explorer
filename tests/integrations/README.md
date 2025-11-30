# Integration Testing Environment

Docker-based setup for testing Cube Explorer with a real Cube.js server and sample data.

## Architecture

- **Cube.js Server**: Runs on port 4000, connects to DuckDB
- **DuckDB**: In-process OLAP database with sample e-commerce data
- **React Frontend**: Vite app on port 5173, uses @cubejs-client/core

## Quick Start

```bash
cd integrations
docker compose up --build
```

Services:
- Frontend: http://localhost:52000
- Cube API: http://localhost:42000
- Cube Playground: http://localhost:42000/#/playground

## Sample Data

The seed service populates DuckDB with:
- 15 products across 3 categories (Electronics, Furniture, Office Supplies)
- 10 customers from various countries
- 25 orders with different statuses (completed, processing, shipped, pending)
- 50 order items linking products to orders

## Cube Schema

Four cubes are defined:

### orders
- Measures: count, completed_count, processing_count, shipped_count, pending_count
- Dimensions: id, status, created_at, completed_at
- Joins: customers (many_to_one)

### products
- Measures: count, avg_price, min_price, max_price
- Dimensions: id, name, category, price, created_at

### customers
- Measures: count
- Dimensions: id, name, email, city, country, created_at

### order_items
- Measures: count, total_quantity, total_revenue, avg_order_value, unique_products
- Dimensions: id, quantity, price
- Joins: orders, products (many_to_one)

## Development

### Rebuild after changes

```bash
docker compose down -v
docker compose up --build
```

### View Cube logs

```bash
docker compose logs -f cube
```

### Access DuckDB directly

```bash
docker compose exec cube duckdb /cube/data/store.duckdb
```

## Environment Variables

### Cube Server
- `CUBEJS_DB_TYPE`: duckdb
- `CUBEJS_DB_DUCKDB_DATABASE_PATH`: /cube/data/store.duckdb
- `CUBEJS_API_SECRET`: cube-explorer-dev-secret

### Frontend
- `VITE_CUBE_API_URL`: http://localhost:42000/cubejs-api/v1
- `VITE_CUBE_API_TOKEN`: cube-explorer-dev-secret
