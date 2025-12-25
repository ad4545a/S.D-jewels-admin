import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaDollarSign, FaShoppingCart, FaBox, FaUsers, FaTrophy, FaChartLine, FaStar } from 'react-icons/fa';
import api from '../utils/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0
    });
    const [topProducts, setTopProducts] = useState([]);
    const [topCategories, setTopCategories] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [topReviewed, setTopReviewed] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [productsRes, ordersRes, usersRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/orders'),
                    api.get('/users')
                ]);

                const products = productsRes.data;
                const orders = ordersRes.data;
                const users = usersRes.data;

                // Calculate total sales from paid orders
                const totalSales = orders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0);

                // Count customers (non-admin users)
                const customers = users.filter(u => u.role !== 'admin');

                setStats({
                    totalSales: totalSales,
                    totalOrders: orders.length,
                    totalProducts: products.length,
                    totalCustomers: customers.length
                });

                // Analyze best-selling products from orders
                const productSales = {};
                orders.forEach(order => {
                    order.orderItems?.forEach(item => {
                        const key = item.product || item.name;
                        if (!productSales[key]) {
                            productSales[key] = { name: item.name, image: item.image, qty: 0, revenue: 0 };
                        }
                        productSales[key].qty += item.qty;
                        productSales[key].revenue += item.price * item.qty;
                    });
                });

                // Sort by quantity sold and get top 5
                const sortedProducts = Object.values(productSales)
                    .sort((a, b) => b.qty - a.qty)
                    .slice(0, 5);
                setTopProducts(sortedProducts);

                // Analyze best-selling categories
                const categorySales = {};
                orders.forEach(order => {
                    order.orderItems?.forEach(item => {
                        // Find the product to get its category
                        const product = products.find(p => p._id === item.product);
                        const categories = product?.category || ['Uncategorized'];
                        const catArray = Array.isArray(categories) ? categories : [categories];

                        catArray.forEach(cat => {
                            if (!categorySales[cat]) {
                                categorySales[cat] = { name: cat, qty: 0, revenue: 0 };
                            }
                            categorySales[cat].qty += item.qty;
                            categorySales[cat].revenue += item.price * item.qty;
                        });
                    });
                });

                // Sort by revenue and get top 5
                const sortedCategories = Object.values(categorySales)
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5);

                // Calculate max for progress bar
                const maxRevenue = sortedCategories[0]?.revenue || 1;
                sortedCategories.forEach(cat => {
                    cat.percentage = Math.round((cat.revenue / maxRevenue) * 100);
                });
                setTopCategories(sortedCategories);

                // Get recent orders (last 5)
                const recent = [...orders]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5);
                setRecentOrders(recent);

                // Get best reviewed products (sorted by rating, min 1 review)
                const bestReviewed = products
                    .filter(p => p.numReviews > 0)
                    .sort((a, b) => b.rating - a.rating || b.numReviews - a.numReviews)
                    .slice(0, 5)
                    .map(p => ({
                        id: p._id,
                        name: p.name,
                        image: p.image,
                        rating: p.rating,
                        numReviews: p.numReviews,
                        category: Array.isArray(p.category) ? p.category[0] : p.category
                    }));
                setTopReviewed(bestReviewed);

            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color, prefix = '' }) => (
        <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
                <div className={`rounded-circle p-3 me-3`} style={{ backgroundColor: `${color}20` }}>
                    <Icon size={24} style={{ color: color }} />
                </div>
                <div>
                    <div className="text-muted small text-uppercase">{title}</div>
                    <h3 className="mb-0 fw-bold">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</h3>
                </div>
            </Card.Body>
        </Card>
    );

    const getStatusBadge = (status) => {
        const colors = {
            'Processing': 'warning',
            'Accepted': 'primary',
            'Shipped': 'info',
            'Delivered': 'success',
            'Cancelled': 'danger'
        };
        return <Badge bg={colors[status] || 'secondary'}>{status}</Badge>;
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="mb-4">Dashboard</h2>

            {/* Stats Cards */}
            <Row className="g-4 mb-4">
                <Col md={6} lg={3}>
                    <StatCard title="Total Sales" value={stats.totalSales.toFixed(0)} icon={FaDollarSign} color="#10b981" prefix="$" />
                </Col>
                <Col md={6} lg={3}>
                    <StatCard title="Total Orders" value={stats.totalOrders} icon={FaShoppingCart} color="#6366f1" />
                </Col>
                <Col md={6} lg={3}>
                    <StatCard title="Total Products" value={stats.totalProducts} icon={FaBox} color="#f59e0b" />
                </Col>
                <Col md={6} lg={3}>
                    <StatCard title="Customers" value={stats.totalCustomers} icon={FaUsers} color="#ec4899" />
                </Col>
            </Row>

            <Row className="g-4">
                {/* Top Selling Products */}
                <Col lg={7}>
                    <Card className="shadow-sm h-100">
                        <Card.Header className="bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 d-flex align-items-center">
                                <FaTrophy className="text-warning me-2" /> Top Selling Products
                            </h5>
                            <Link to="/product-analytics" className="btn btn-sm btn-outline-primary">See All</Link>
                        </Card.Header>
                        <Card.Body>
                            <Table hover responsive className="mb-0">
                                <thead>
                                    <tr>
                                        <th style={{ width: '50px' }}>#</th>
                                        <th>Product</th>
                                        <th className="text-center">Qty Sold</th>
                                        <th className="text-end">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topProducts.length > 0 ? topProducts.map((product, index) => (
                                        <tr key={index}>
                                            <td>
                                                <span className={`badge ${index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : 'bg-light text-dark'}`}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                                                        className="me-2"
                                                    />
                                                    <span className="text-truncate" style={{ maxWidth: 200 }}>{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="text-center fw-bold">{product.qty}</td>
                                            <td className="text-end text-success fw-bold">${product.revenue.toLocaleString()}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="text-center text-muted py-4">No sales data yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Top Categories */}
                <Col lg={5}>
                    <Card className="shadow-sm h-100">
                        <Card.Header className="bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 d-flex align-items-center">
                                <FaChartLine className="text-primary me-2" /> Top Categories
                            </h5>
                            <Link to="/categories" className="btn btn-sm btn-outline-secondary">Manage</Link>
                        </Card.Header>
                        <Card.Body className="p-3">
                            {topCategories.length > 0 ? (
                                <Row className="g-2">
                                    {topCategories.map((category, index) => {
                                        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
                                        const bgColors = ['#eef2ff', '#ecfdf5', '#fffbeb', '#fdf2f8', '#ecfeff'];
                                        return (
                                            <Col xs={6} key={index}>
                                                <div
                                                    className="p-3 rounded-3 h-100"
                                                    style={{ backgroundColor: bgColors[index] || '#f3f4f6' }}
                                                >
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <span
                                                            className="badge rounded-pill"
                                                            style={{ backgroundColor: colors[index] || '#6b7280' }}
                                                        >
                                                            #{index + 1}
                                                        </span>
                                                        <small className="text-muted">{category.qty} sold</small>
                                                    </div>
                                                    <h6 className="fw-bold mb-1" style={{ color: colors[index] }}>{category.name}</h6>
                                                    <div className="fw-bold fs-5">${category.revenue.toLocaleString()}</div>
                                                </div>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            ) : (
                                <div className="text-center text-muted py-4">No category data yet</div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Best Reviewed Products */}
            <Row className="mt-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 d-flex align-items-center">
                                <FaStar className="text-warning me-2" /> Best Reviewed Products
                            </h5>
                            <Link to="/product-analytics" className="btn btn-sm btn-outline-primary">See All</Link>
                        </Card.Header>
                        <Card.Body>
                            {topReviewed.length > 0 ? (
                                <Row className="g-3">
                                    {topReviewed.map((product, index) => (
                                        <Col md={4} lg key={product.id}>
                                            <div className="d-flex align-items-center p-3 rounded-3 h-100" style={{ backgroundColor: '#fffbeb' }}>
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
                                                    className="me-3"
                                                />
                                                <div className="flex-grow-1 min-width-0">
                                                    <Link to={`/products/${product.id}/edit`} className="text-decoration-none">
                                                        <div className="fw-medium text-dark text-truncate" style={{ maxWidth: 150 }}>
                                                            {product.name}
                                                        </div>
                                                    </Link>
                                                    <div className="d-flex align-items-center">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar
                                                                key={i}
                                                                size={12}
                                                                className={i < Math.round(product.rating) ? 'text-warning' : 'text-muted opacity-25'}
                                                            />
                                                        ))}
                                                        <span className="fw-bold ms-2">{product.rating.toFixed(1)}</span>
                                                        <span className="text-muted small ms-1">({product.numReviews})</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            ) : (
                                <div className="text-center text-muted py-4">No reviewed products yet</div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Recent Orders */}
            <Row className="mt-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Recent Orders</h5>
                            <Link to="/orders" className="btn btn-sm btn-outline-primary">View All</Link>
                        </Card.Header>
                        <Card.Body>
                            <Table hover responsive className="mb-0">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order._id}>
                                            <td>
                                                <Link to={`/orders/${order._id}`} className="text-decoration-none fw-medium">
                                                    {order.orderId}
                                                </Link>
                                            </td>
                                            <td>{order.user?.name || 'Guest'}</td>
                                            <td className="text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td className="fw-bold">${order.totalPrice.toLocaleString()}</td>
                                            <td>{getStatusBadge(order.orderStatus)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;

