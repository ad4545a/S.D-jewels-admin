import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const ProductList = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            console.error(error);
        }
    };

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                alert('Failed to delete product');
            }
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Products</h2>
                <Link to="/products/add">
                    <Button variant="primary">
                        <FaPlus className="me-2" /> Create Product
                    </Button>
                </Link>
            </div>

            <Table striped bordered hover responsive className="table-sm">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>IMAGE</th>
                        <th>NAME</th>
                        <th>PRICE</th>
                        <th>CATEGORY</th>
                        <th>BRAND</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product._id}>
                            <td>{product._id}</td>
                            <td>
                                <Image src={product.image} alt={product.name} fluid rounded style={{ width: '50px' }} />
                            </td>
                            <td>{product.name}</td>
                            <td>${product.price}</td>
                            <td>{product.category}</td>
                            <td>{product.brand}</td>
                            <td>
                                <Button variant="light" className="btn-sm mx-1">
                                    <FaEdit />
                                </Button>
                                <Button
                                    variant="danger"
                                    className="btn-sm mx-1"
                                    onClick={() => deleteHandler(product._id)}
                                >
                                    <FaTrash />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default ProductList;
