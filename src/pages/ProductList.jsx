import React, { useEffect, useState } from 'react';
import { Table, Button, Image, Form, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { FaEdit, FaTrash, FaPlus, FaFilter } from 'react-icons/fa';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [priceFilter, setPriceFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
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

    const clearFilters = () => {
        setSearchTerm('');
        setCategoryFilter('');
        setPriceFilter('');
        setStockFilter('');
    };

    // Filter Logic
    const filteredProducts = products.filter(product => {
        // Search
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product._id.toLowerCase().includes(searchTerm.toLowerCase());

        // Category
        let matchesCategory = true;
        if (categoryFilter) {
            // Handle array or string category
            const pCats = Array.isArray(product.category) ? product.category : [product.category];
            matchesCategory = pCats.includes(categoryFilter);
        }

        // Stock
        let matchesStock = true;
        if (stockFilter === 'In Stock') matchesStock = product.countInStock > 0;
        if (stockFilter === 'Out of Stock') matchesStock = product.countInStock <= 0;

        return matchesSearch && matchesCategory && matchesStock;
    }).sort((a, b) => {
        // Sort Logic
        if (priceFilter === 'Low to High') return a.price - b.price;
        if (priceFilter === 'High to Low') return b.price - a.price;
        return 0; // Default order
    });

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0 fw-bold">Products Inventory</h2>
                <Link to="/products/add">
                    <Button variant="primary" className="shadow-sm">
                        <FaPlus className="me-2" /> Add Product
                    </Button>
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="bg-light p-3 rounded mb-4 shadow-sm">
                <Row className="g-3 align-items-end">
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label className="small text-muted fw-bold">Search</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Label className="small text-muted fw-bold">Category</Form.Label>
                            <Form.Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Label className="small text-muted fw-bold">Price</Form.Label>
                            <Form.Select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
                                <option value="">Default</option>
                                <option value="Low to High">Low to High</option>
                                <option value="High to Low">High to Low</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Label className="small text-muted fw-bold">Stock Status</Form.Label>
                            <Form.Select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                                <option value="">All</option>
                                <option value="In Stock">In Stock</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3} className="text-end">
                        <Button variant="outline-danger" onClick={clearFilters} className="btn-sm">
                            <FaFilter className="me-2" /> Clear Filters
                        </Button>
                    </Col>
                </Row>
            </div>

            <Table striped bordered hover responsive className="align-middle shadow-sm">
                <thead className="bg-dark text-white">
                    <tr>
                        <th>IMAGE</th>
                        <th>NAME</th>
                        <th>CATEGORY</th>
                        <th>PRICE</th>
                        <th>STOCK</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <tr key={product._id}>
                                <td style={{ width: '80px' }}>
                                    <Image src={product.image} alt={product.name} fluid rounded style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                </td>
                                <td className="fw-bold text-primary">{product.name}</td>
                                <td>
                                    {Array.isArray(product.category)
                                        ? product.category.map(c => <Badge key={c} bg="info" className="me-1 text-dark">{c}</Badge>)
                                        : <Badge bg="info" className="text-dark">{product.category}</Badge>
                                    }
                                </td>
                                <td>₹{product.price}</td>
                                <td>
                                    {product.countInStock > 0 ? (
                                        <Badge bg="success">In Stock ({product.countInStock})</Badge>
                                    ) : (
                                        <Badge bg="danger">Out of Stock</Badge>
                                    )}
                                </td>
                                <td>
                                    <Link to={`/products/${product._id || product.id}/edit`}>
                                        <Button variant="outline-primary" className="btn-sm me-2">
                                            <FaEdit />
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline-danger"
                                        className="btn-sm"
                                        onClick={() => deleteHandler(product._id)}
                                    >
                                        <FaTrash />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center py-4 text-muted">No products found matching filters.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default ProductList;
