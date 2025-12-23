import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBox, FaShoppingCart, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
    const location = useLocation();

    return (
        <div className="d-flex flex-column h-100 p-3 bg-light shadow-sm" style={{ minHeight: '100vh' }}>
            <Nav className="flex-column nav-pills w-100">
                <Nav.Item>
                    <Nav.Link as={Link} to="/" active={location.pathname === '/'}>
                        <FaHome className="me-2" /> Dashboard
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} to="/products" active={location.pathname.startsWith('/products')}>
                        <FaBox className="me-2" /> Products
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link as={Link} to="/orders" active={location.pathname.startsWith('/orders')}>
                        <FaShoppingCart className="me-2" /> Orders
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link onClick={() => { localStorage.removeItem('userInfo'); window.location.href = '/login'; }} className="text-danger" style={{ cursor: 'pointer' }}>
                        <FaSignOutAlt className="me-2" /> Logout
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </div>
    );
};

export default Sidebar;
