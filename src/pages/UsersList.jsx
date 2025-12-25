import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Badge, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FaTrash, FaUserEdit, FaCheck, FaTimes } from 'react-icons/fa';

const UsersList = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error(error);
            alert('Failed to fetch users');
        }
    };

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error(error);
                alert('Failed to delete user');
            }
        }
    };

    return (
        <Container fluid className="py-4">
            <h2 className="mb-4 fw-bold text-dark">Customers</h2>
            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light text-secondary">
                            <tr>
                                <th className="py-3 ps-4 border-0">ID</th>
                                <th className="py-3 border-0">NAME</th>
                                <th className="py-3 border-0">EMAIL</th>
                                <th className="py-3 border-0">ADMIN</th>
                                <th className="py-3 border-0 text-end pe-4">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td className="ps-4 text-muted small">{user._id}</td>
                                    <td className="fw-semibold">{user.name}</td>
                                    <td><a href={`mailto:${user.email}`} className="text-decoration-none">{user.email}</a></td>
                                    <td>
                                        {user.isAdmin ? (
                                            <Badge bg="success"><FaCheck /></Badge>
                                        ) : (
                                            <Badge bg="danger"><FaTimes /></Badge>
                                        )}
                                    </td>
                                    <td className="text-end pe-4">
                                        <Link to={`/users/${user._id}`}>
                                            <Button variant="light" size="sm" className="me-2 text-primary">
                                                <FaUserEdit /> Details
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="light"
                                            size="sm"
                                            className="text-danger"
                                            onClick={() => deleteHandler(user._id)}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default UsersList;
