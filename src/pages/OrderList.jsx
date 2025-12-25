import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Row, Col, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTimes, FaFilter, FaTimesCircle } from 'react-icons/fa';
import api from '../utils/api';

import io from 'socket.io-client';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paidFilter, setPaidFilter] = useState('');
    const [deliveredFilter, setDeliveredFilter] = useState('');

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            setOrders(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchOrders();

        const socket = io('http://localhost:5000');

        socket.on('order_created', () => {
            fetchOrders();
        });

        socket.on('order_updated', () => {
            fetchOrders();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Apply all filters simultaneously
    const filteredOrders = orders.filter(order => {
        // Search filter (Order ID or User name)
        const matchesSearch = searchTerm === '' ||
            (order.orderId && order.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.user && order.user.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase()));

        // Status filter
        const matchesStatus = statusFilter === '' || order.orderStatus === statusFilter;

        // Paid filter
        const matchesPaid = paidFilter === '' ||
            (paidFilter === 'paid' && order.isPaid) ||
            (paidFilter === 'unpaid' && !order.isPaid);

        // Delivered filter
        const matchesDelivered = deliveredFilter === '' ||
            (deliveredFilter === 'delivered' && order.isDelivered) ||
            (deliveredFilter === 'pending' && !order.isDelivered);

        return matchesSearch && matchesStatus && matchesPaid && matchesDelivered;
    });

    const clearAllFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setPaidFilter('');
        setDeliveredFilter('');
    };

    const hasActiveFilters = searchTerm || statusFilter || paidFilter || deliveredFilter;

    return (
        <Container>
            <h2 className="mb-4">Orders</h2>

            {/* Filter Section */}
            <div className="bg-light p-3 rounded mb-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="mb-0"><FaFilter className="me-2" />Filters</h6>
                    {hasActiveFilters && (
                        <Button variant="outline-secondary" size="sm" onClick={clearAllFilters}>
                            <FaTimesCircle className="me-1" /> Clear All
                        </Button>
                    )}
                </div>
                <Row className="g-3">
                    <Col md={3}>
                        <Form.Control
                            type="text"
                            placeholder="Search Order ID / User..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Col>
                    <Col md={3}>
                        <Form.Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="Processing">Processing</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </Form.Select>
                    </Col>
                    <Col md={3}>
                        <Form.Select
                            value={paidFilter}
                            onChange={(e) => setPaidFilter(e.target.value)}
                        >
                            <option value="">All Payment Status</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                        </Form.Select>
                    </Col>
                    <Col md={3}>
                        <Form.Select
                            value={deliveredFilter}
                            onChange={(e) => setDeliveredFilter(e.target.value)}
                        >
                            <option value="">All Delivery Status</option>
                            <option value="delivered">Delivered</option>
                            <option value="pending">Pending</option>
                        </Form.Select>
                    </Col>
                </Row>
                {hasActiveFilters && (
                    <div className="mt-2 text-muted small">
                        Showing {filteredOrders.length} of {orders.length} orders
                    </div>
                )}
            </div>

            <Table striped bordered hover responsive className="table-sm">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>ORDER ID</th>
                        <th>USER</th>
                        <th>DATE</th>
                        <th>TOTAL</th>
                        <th>STATUS</th>
                        <th>PAID</th>
                        <th>DELIVERED</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <tr key={order._id}>
                                <td>{order._id.substring(0, 10)}...</td>
                                <td>{order.orderId}</td>
                                <td>{order.user && order.user.name}</td>
                                <td>{order.createdAt.substring(0, 10)}</td>
                                <td>${order.totalPrice}</td>
                                <td>
                                    <span className={`badge bg-${order.orderStatus === 'Delivered' ? 'success' :
                                            order.orderStatus === 'Shipped' ? 'info' :
                                                order.orderStatus === 'Accepted' ? 'primary' :
                                                    order.orderStatus === 'Cancelled' ? 'danger' : 'warning'
                                        }`}>
                                        {order.orderStatus}
                                    </span>
                                </td>
                                <td>
                                    {order.isPaid ? (
                                        order.paidAt.substring(0, 10)
                                    ) : (
                                        <FaTimes style={{ color: 'red' }} />
                                    )}
                                </td>
                                <td>
                                    {order.isDelivered ? (
                                        order.deliveredAt.substring(0, 10)
                                    ) : (
                                        <FaTimes style={{ color: 'red' }} />
                                    )}
                                </td>
                                <td>
                                    <Link to={`/orders/${order._id}`}>
                                        <Button variant="light" className="btn-sm">
                                            Details
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" className="text-center py-4 text-muted">
                                No orders found matching filters.
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
};

export default OrderList;
