import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Table, Badge, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTrophy, FaArrowLeft, FaSearch, FaSortAmountDown, FaSortAmountUp, FaStar } from 'react-icons/fa';
import api from '../utils/api';

const ProductAnalytics = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('qty');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, ordersRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/orders')
                ]);

                const products = productsRes.data;
                const orders = ordersRes.data;

                // Analyze all products from orders
                const productSales = {};

                // Initialize all products with 0 sales
                products.forEach(product => {
                    productSales[product._id] = {
                        id: product._id,
                        name: product.name,
                        image: product.image,
                        category: Array.isArray(product.category) ? product.category.join(', ') : product.category,
                        price: product.price,
                        stock: product.countInStock,
                        rating: product.rating || 0,
                        numReviews: product.numReviews || 0,
                        qty: 0,
                        revenue: 0,
                        orders: 0
                    };
                });

                // Add sales data
                orders.forEach(order => {
                    order.orderItems?.forEach(item => {
                        const key = item.product;
                        if (productSales[key]) {
                            productSales[key].qty += item.qty;
                            productSales[key].revenue += item.price * item.qty;
                            productSales[key].orders += 1;
                        }
                    });
                });

                setAllProducts(Object.values(productSales));
            } catch (error) {
                console.error("Error fetching product analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter and sort products
    const filteredProducts = allProducts
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];
            if (sortOrder === 'asc') {
                return typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal;
            }
            return typeof bVal === 'string' ? bVal.localeCompare(aVal) : bVal - aVal;
        });

    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const SortIcon = ({ field }) => {
        if (sortBy !== field) return null;
        return sortOrder === 'desc' ? <FaSortAmountDown size={12} className="ms-1" /> : <FaSortAmountUp size={12} className="ms-1" />;
    };

    const getRankBadge = (index) => {
        if (index === 0) return <Badge bg="warning" className="me-2">🥇</Badge>;
        if (index === 1) return <Badge bg="secondary" className="me-2">🥈</Badge>;
        if (index === 2) return <Badge bg="dark" className="me-2">🥉</Badge>;
        return <Badge bg="light" text="dark" className="me-2">{index + 1}</Badge>;
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

    // Calculate totals
    const totalRevenue = allProducts.reduce((acc, p) => acc + p.revenue, 0);
    const totalQtySold = allProducts.reduce((acc, p) => acc + p.qty, 0);
    const productsWithSales = allProducts.filter(p => p.qty > 0).length;

    return (
        <div>
            <div className="d-flex align-items-center mb-4">
                <Link to="/" className="btn btn-outline-secondary me-3">
                    <FaArrowLeft />
                </Link>
                <h2 className="mb-0">Product Analytics</h2>
            </div>

            {/* Summary Cards */}
            <Row className="g-3 mb-4">
                <Col md={4}>
                    <Card className="border-0 shadow-sm bg-primary text-white">
                        <Card.Body className="text-center">
                            <div className="small opacity-75">Total Revenue</div>
                            <h3 className="mb-0 fw-bold">${totalRevenue.toLocaleString()}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm bg-success text-white">
                        <Card.Body className="text-center">
                            <div className="small opacity-75">Total Items Sold</div>
                            <h3 className="mb-0 fw-bold">{totalQtySold.toLocaleString()}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm bg-info text-white">
                        <Card.Body className="text-center">
                            <div className="small opacity-75">Products with Sales</div>
                            <h3 className="mb-0 fw-bold">{productsWithSales} / {allProducts.length}</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* All Products Table */}
            <Card className="shadow-sm">
                <Card.Header className="bg-white border-0 pt-4 pb-3">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <h5 className="mb-0 d-flex align-items-center">
                            <FaTrophy className="text-warning me-2" /> All Products Performance
                        </h5>
                        <div className="d-flex align-items-center gap-2">
                            <div className="input-group" style={{ maxWidth: 250 }}>
                                <span className="input-group-text bg-white"><FaSearch className="text-muted" /></span>
                                <Form.Control
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th style={{ width: 60 }}>Rank</th>
                                <th>Product</th>
                                <th>Category</th>
                                <th
                                    className="text-center cursor-pointer"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleSort('price')}
                                >
                                    Price <SortIcon field="price" />
                                </th>
                                <th
                                    className="text-center cursor-pointer"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleSort('stock')}
                                >
                                    Stock <SortIcon field="stock" />
                                </th>
                                <th
                                    className="text-center cursor-pointer"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleSort('qty')}
                                >
                                    Qty Sold <SortIcon field="qty" />
                                </th>
                                <th
                                    className="text-center cursor-pointer"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleSort('orders')}
                                >
                                    Orders <SortIcon field="orders" />
                                </th>
                                <th
                                    className="text-center cursor-pointer"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleSort('rating')}
                                >
                                    Rating <SortIcon field="rating" />
                                </th>
                                <th
                                    className="text-end cursor-pointer"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleSort('revenue')}
                                >
                                    Revenue <SortIcon field="revenue" />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product, index) => (
                                <tr key={product.id} className={product.qty === 0 ? 'table-light' : ''}>
                                    <td>{getRankBadge(index)}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                style={{ width: 45, height: 45, objectFit: 'cover', borderRadius: 8 }}
                                                className="me-2"
                                            />
                                            <div>
                                                <Link to={`/products/${product.id}/edit`} className="text-decoration-none fw-medium text-dark">
                                                    {product.name.length > 35 ? product.name.substring(0, 35) + '...' : product.name}
                                                </Link>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg="light" text="dark" className="fw-normal">
                                            {product.category || 'Uncategorized'}
                                        </Badge>
                                    </td>
                                    <td className="text-center">${product.price.toLocaleString()}</td>
                                    <td className="text-center">
                                        <Badge bg={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'danger'}>
                                            {product.stock}
                                        </Badge>
                                    </td>
                                    <td className="text-center fw-bold">{product.qty}</td>
                                    <td className="text-center">{product.orders}</td>
                                    <td className="text-center">
                                        <span className="text-warning"><FaStar size={12} /></span>
                                        <span className="fw-bold ms-1">{product.rating.toFixed(1)}</span>
                                        <span className="text-muted small ms-1">({product.numReviews})</span>
                                    </td>
                                    <td className="text-end fw-bold text-success">${product.revenue.toLocaleString()}</td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="text-center text-muted py-4">No products found</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ProductAnalytics;
