import { useState, useEffect, useCallback } from "react";
import { cubeApi } from "./cube";
import type { Query, ResultSet } from "@cubejs-client/core";

interface OrderStats {
  total: number;
  completed: number;
  processing: number;
  shipped: number;
  pending: number;
}

interface Order {
  id: string;
  status: string;
  customerName: string;
  customerCountry: string;
  createdAt: string;
}

interface Product {
  name: string;
  category: string;
  totalRevenue: number;
  totalQuantity: number;
}

type StatusFilter = "all" | "completed" | "processing" | "shipped" | "pending";
type CategoryFilter = "all" | "Electronics" | "Furniture" | "Office Supplies";

function App() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const query: Query = {
      measures: [
        "orders.count",
        "orders.completed_count",
        "orders.processing_count",
        "orders.shipped_count",
        "orders.pending_count",
      ],
    };

    const result: ResultSet = await cubeApi.load(query);
    const data = result.tablePivot()[0];

    setStats({
      total: Number(data["orders.count"]) || 0,
      completed: Number(data["orders.completed_count"]) || 0,
      processing: Number(data["orders.processing_count"]) || 0,
      shipped: Number(data["orders.shipped_count"]) || 0,
      pending: Number(data["orders.pending_count"]) || 0,
    });
  }, []);

  const fetchOrders = useCallback(async () => {
    const query: Query = {
      dimensions: [
        "orders.id",
        "orders.status",
        "customers.name",
        "customers.country",
        "orders.created_at",
      ],
      order: {
        "orders.created_at": "desc",
      },
      limit: 20,
    };

    if (statusFilter !== "all") {
      query.filters = [
        {
          member: "orders.status",
          operator: "equals",
          values: [statusFilter],
        },
      ];
    }

    const result: ResultSet = await cubeApi.load(query);
    const data = result.tablePivot();

    setOrders(
      data.map((row) => ({
        id: String(row["orders.id"]),
        status: String(row["orders.status"]),
        customerName: String(row["customers.name"]),
        customerCountry: String(row["customers.country"]),
        createdAt: String(row["orders.created_at"]),
      }))
    );
  }, [statusFilter]);

  const fetchProducts = useCallback(async () => {
    const query: Query = {
      dimensions: ["products.name", "products.category"],
      measures: ["order_items.total_revenue", "order_items.total_quantity"],
      order: {
        "order_items.total_revenue": "desc",
      },
    };

    if (categoryFilter !== "all") {
      query.filters = [
        {
          member: "products.category",
          operator: "equals",
          values: [categoryFilter],
        },
      ];
    }

    const result: ResultSet = await cubeApi.load(query);
    const data = result.tablePivot();

    setProducts(
      data.map((row) => ({
        name: String(row["products.name"]),
        category: String(row["products.category"]),
        totalRevenue: Number(row["order_items.total_revenue"]) || 0,
        totalQuantity: Number(row["order_items.total_quantity"]) || 0,
      }))
    );
  }, [categoryFilter]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([fetchStats(), fetchOrders(), fetchProducts()]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load data from Cube"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchStats, fetchOrders, fetchProducts]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  if (loading && !stats) {
    return (
      <div className="container">
        <div className="loading">Loading data from Cube...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Cube Explorer Integration Test</h1>

      {error && <div className="error">{error}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <div className="value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <div className="value">{stats.completed}</div>
          </div>
          <div className="stat-card">
            <h3>Processing</h3>
            <div className="value">{stats.processing}</div>
          </div>
          <div className="stat-card">
            <h3>Shipped</h3>
            <div className="value">{stats.shipped}</div>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <div className="value">{stats.pending}</div>
          </div>
        </div>
      )}

      <div className="filters">
        <div className="filter-group">
          <label>Order Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Product Category</label>
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as CategoryFilter)
            }
          >
            <option value="all">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Office Supplies">Office Supplies</option>
          </select>
        </div>
      </div>

      <div className="data-section">
        <h2>Recent Orders</h2>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Country</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customerName}</td>
                <td>{order.customerCountry}</td>
                <td>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="data-section">
        <h2>Product Performance</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Total Revenue</th>
              <th>Units Sold</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.name}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{formatCurrency(product.totalRevenue)}</td>
                <td>{product.totalQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
