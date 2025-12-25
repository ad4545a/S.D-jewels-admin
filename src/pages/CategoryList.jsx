import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Modal } from 'react-bootstrap';
import api from '../utils/api';
import { FaTrash, FaPlus } from 'react-icons/fa';
import io from 'socket.io-client';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCategories();

        // Derive socket URL
        const baseUrl = api.defaults.baseURL || 'http://localhost:5000/api';
        const socketUrl = baseUrl.replace('/api', '');

        const socket = io(socketUrl);

        socket.on('data_updated', () => {
            fetchCategories();
        });
        return () => socket.disconnect();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error(error);
        }
    };

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await api.delete(`/categories/${id}`);
                fetchCategories();
            } catch (error) {
                alert('Failed to delete category');
            }
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories', { name, description });
            setShowModal(false);
            setName('');
            setDescription('');
            fetchCategories();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create category');
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Categories</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    <FaPlus className="me-2" /> Add Category
                </Button>
            </div>

            <div className="mb-3">
                <input
                    type="text"
                    placeholder="Search Category..."
                    className="form-control"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Table striped bordered hover responsive className="table-sm">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>NAME</th>
                        <th>DESCRIPTION</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.filter(category =>
                        category.name.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((category) => (
                        <tr key={category._id}>
                            <td>{category._id}</td>
                            <td>{category.name}</td>
                            <td>{category.description}</td>
                            <td>
                                <Button
                                    variant="danger"
                                    className="btn-sm mx-1"
                                    onClick={() => deleteHandler(category._id)}
                                >
                                    <FaTrash />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Category</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={submitHandler}>
                        <Form.Group className="mb-3" controlId="name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter category name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="description">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Save Changes
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default CategoryList;
