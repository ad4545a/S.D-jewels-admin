import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Image, Badge, Button, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

import io from 'socket.io-client';

const OrderDetails = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();

        // Derive socket URL
        const baseUrl = api.defaults.baseURL || 'http://localhost:5000/api';
        const socketUrl = baseUrl.replace('/api', '');

        const socket = io(socketUrl);

        socket.on('order_updated', (updatedOrder) => {
            if (updatedOrder._id === id) {
                setOrder(updatedOrder);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [id]);

    const statusHandler = async (status) => {
        if (window.confirm(`Are you sure you want to mark this order as ${status}?`)) {
            try {
                const { data } = await api.put(`/orders/${id}/status`, { orderStatus: status });
                setOrder(data);
            } catch (error) {
                console.error(error);
            }
        }
    };

    if (loading) return <Spinner animation="border" />;
    if (!order) return <p>Order not found</p>;

    return (
        <Container>
            <h2 className="mb-4">Order Invoice {order.orderId}</h2>
            <Row>
                <Col md={8}>
                    <ListGroup variant="flush">
                        <ListGroup.Item>
                            <h3>Shipping</h3>
                            <p>
                                <strong>Name: </strong> {order.user && order.user.name} <br />
                                <strong>Email: </strong> <a href={`mailto:${order.user && order.user.email}`}>{order.user && order.user.email}</a> <br />
                                <strong>Address: </strong>
                                {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                            </p>
                            {order.isDelivered ? (
                                <Badge bg="success">Delivered on {order.deliveredAt}</Badge>
                            ) : (
                                <Badge bg="warning" text="dark">Not Delivered</Badge>
                            )}
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <h3>Payment</h3>
                            <p>
                                <strong>Method: </strong> {order.paymentMethod}
                            </p>
                            {order.isPaid ? (
                                <Badge bg="success">Paid on {order.paidAt}</Badge>
                            ) : (
                                <Badge bg="warning" text="dark">Not Paid</Badge>
                            )}
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <h3>Order Items</h3>
                            {order.orderItems.length === 0 ? (
                                <p>Order is empty</p>
                            ) : (
                                <ListGroup variant="flush">
                                    {order.orderItems.map((item, index) => (
                                        <ListGroup.Item key={index}>
                                            <Row>
                                                <Col md={1}>
                                                    <Image src={item.image} alt={item.name} fluid rounded />
                                                </Col>
                                                <Col>
                                                    {item.name}
                                                </Col>
                                                <Col md={4}>
                                                    {item.qty} x ${item.price} = ${item.qty * item.price}
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </ListGroup.Item>
                    </ListGroup>
                </Col>
                <Col md={4}>
                    <Card>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <h2>Order Summary</h2>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Items</Col>
                                    <Col>${order.itemsPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Shipping</Col>
                                    <Col>${order.shippingPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Tax</Col>
                                    <Col>${order.taxPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Total</Col>
                                    <Col>${order.totalPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <div className="d-grid gap-2">
                                    <h5>Status: {order.orderStatus}</h5>
                                    {/* Status Management Buttons */}
                                    {order.orderStatus === 'Processing' && (
                                        <Button variant="primary" onClick={() => statusHandler('Accepted')}>
                                            Accept Order
                                        </Button>
                                    )}
                                    {order.orderStatus === 'Accepted' && (
                                        <Button variant="info" onClick={() => statusHandler('Shipped')}>
                                            Mark as Shipped
                                        </Button>
                                    )}
                                    {order.orderStatus === 'Shipped' && !order.isDelivered && (
                                        <Button variant="success" onClick={() => statusHandler('Delivered')}>
                                            Mark as Delivered
                                        </Button>
                                    )}
                                </div>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default OrderDetails;
