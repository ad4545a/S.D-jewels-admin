import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import api from '../utils/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch all data locally for calculation
                // In a production app, you'd want dedicated stats endpoints
                const productsRes = await api.get('/products');
                const ordersRes = await api.get('/orders');

                const products = productsRes.data;
                const orders = ordersRes.data;

                const totalSales = orders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0);

                setStats({
                    totalSales: totalSales,
                    totalOrders: orders.length,
                    totalProducts: products.length
                });

            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div>
            <h2 className="mb-4">Dashboard</h2>
            <Row>
                <Col md={4}>
                    <Card className="mb-4 shadow-sm text-center">
                        <Card.Body>
                            <Card.Title>Total Sales</Card.Title>
                            <h3>${stats.totalSales.toFixed(2)}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-4 shadow-sm text-center">
                        <Card.Body>
                            <Card.Title>Total Orders</Card.Title>
                            <h3>{stats.totalOrders}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-4 shadow-sm text-center">
                        <Card.Body>
                            <Card.Title>Total Products</Card.Title>
                            <h3>{stats.totalProducts}</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
