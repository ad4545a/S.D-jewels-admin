import React, { useEffect, useState } from 'react';
import { Table, Button, Container } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import api from '../utils/api';

const OrderList = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders');
                setOrders(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchOrders();
    }, []);

    return (
        <Container>
            <h2 className="mb-4">Orders</h2>
            <Table striped bordered hover responsive className="table-sm">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>USER</th>
                        <th>DATE</th>
                        <th>TOTAL</th>
                        <th>PAID</th>
                        <th>DELIVERED</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.user && order.user.name}</td>
                            <td>{order.createdAt.substring(0, 10)}</td>
                            <td>${order.totalPrice}</td>
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
                                <Button variant="light" className="btn-sm">
                                    Details
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default OrderList;
