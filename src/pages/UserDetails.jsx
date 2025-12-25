import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Table, Button, Form, Badge } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FaUser, FaHistory, FaArrowLeft } from 'react-icons/fa';

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState({});
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false); // Local state for toggle

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Fetch User
                const { data: userData } = await api.get(`/users/${id}`);
                setUser(userData);
                setIsAdmin(userData.isAdmin || userData.role === 'admin');

                // Fetch Orders
                const { data: orderData } = await api.get(`/orders/user/${id}`);
                setOrders(orderData);
            } catch (error) {
                console.error(error);
                alert('Failed to load user details');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleUpdateUser = async () => {
        try {
            await api.put(`/users/${id}`, {
                name: user.name,
                email: user.email,
                isAdmin // Send updated admin status
            });
            alert('User updated successfully');
        } catch (error) {
            console.error(error);
            alert('Update failed');
        }
    };

    if (loading) return <Container className="py-5 text-center">Loading...</Container>;

    return (
        <Container fluid className="py-4">
            <Button variant="outline-dark" className="mb-4" onClick={() => navigate('/users')}>
                <FaArrowLeft className="me-2" /> Back to Customers
            </Button>

            <Row>
                {/* User Profile Card */}
                <Col md={4}>
                    <Card className="shadow-sm mb-4 border-0">
                        <Card.Body>
                            <div className="text-center mb-4">
                                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                    <FaUser size={30} className="text-secondary" />
                                </div>
                                <h4 className="mt-3 fw-bold">{user.name}</h4>
                                <p className="text-muted mb-1">{user.email}</p>

                                {orders.length > 0 && orders[0].shippingAddress && (
                                    <div className="mt-2 text-start bg-light p-3 rounded small">
                                        <p className="fw-bold mb-1 text-uppercase text-secondary" style={{ fontSize: '0.7rem' }}>Last Known Address</p>
                                        <p className="mb-0 text-dark">
                                            {orders[0].shippingAddress.address}, <br />
                                            {orders[0].shippingAddress.city}, {orders[0].shippingAddress.postalCode}, <br />
                                            {orders[0].shippingAddress.country}
                                        </p>
                                        {orders[0].shippingAddress.phone && (
                                            <p className="mt-2 mb-0 text-primary fw-bold">
                                                📞 {orders[0].shippingAddress.phone}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <hr />

                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small text-muted fw-bold">User Permission</Form.Label>
                                    <Form.Check
                                        type="switch"
                                        id="admin-switch"
                                        label="Is Admin?"
                                        checked={isAdmin}
                                        onChange={(e) => setIsAdmin(e.target.checked)}
                                    />
                                </Form.Group>
                                <Button variant="primary" className="w-100" onClick={handleUpdateUser}>
                                    Update User
                                </Button>
                            </Form>

                            <div className="mt-4 pt-3 border-top">
                                <small className="text-muted d-block mb-1">User ID</small>
                                <code className="text-dark bg-light px-2 py-1 rounded d-block">{user._id}</code>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Order History */}
                <Col md={8}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white py-3 border-0">
                            <h5 className="mb-0 fw-bold"><FaHistory className="me-2 text-primary" /> Order History ({orders.length})</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {orders.length === 0 ? (
                                <div className="p-5 text-center text-muted">No orders found for this user.</div>
                            ) : (
                                <Table responsive hover className="mb-0 align-middle">
                                    <thead className="bg-light text-secondary small">
                                        <tr>
                                            <th className="ps-4 border-0 py-3">ORDER ID</th>
                                            <th className="border-0 py-3">DATE</th>
                                            <th className="border-0 py-3">TOTAL</th>
                                            <th className="border-0 py-3">PAID</th>
                                            <th className="border-0 py-3">STATUS</th>
                                            <th className="border-0 py-3 text-end pe-4">ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order._id}>
                                                <td className="ps-4 text-muted small">{order.orderId || order._id.substring(0, 10)}</td>
                                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td className="fw-bold">₹{order.totalPrice}</td>
                                                <td>
                                                    {order.isPaid ? <Badge bg="success">Paid</Badge> : <Badge bg="warning" className="text-dark">Pending</Badge>}
                                                </td>
                                                <td>
                                                    <Badge bg={
                                                        order.orderStatus === 'Delivered' ? 'success' :
                                                            order.orderStatus === 'Cancelled' ? 'danger' :
                                                                order.orderStatus === 'Returned' ? 'secondary' : 'info'
                                                    }>{order.orderStatus}</Badge>
                                                </td>
                                                <td className="text-end pe-4">
                                                    <Link to={`/orders/${order._id}`}>
                                                        <Button variant="outline-primary" size="sm">View</Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UserDetails;
