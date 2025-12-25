import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBox, FaShoppingCart, FaSignOutAlt, FaList, FaUser } from 'react-icons/fa';

const Sidebar = () => {
    const location = useLocation();

    return (
        <div className="d-flex flex-column h-100 sidebar-container">
            <div className="sidebar-brand mb-4">
                S.D. JEWELS <span className="text-muted small" style={{ fontSize: '0.4em', letterSpacing: '0' }}>ADMIN</span>
            </div>

            <Nav className="flex-column nav-pills w-100 px-3">
                <Nav.Item className="mb-2">
                    <Nav.Link as={Link} to="/" className={`nav-link-custom ${location.pathname === '/' ? 'active' : ''}`}>
                        <FaHome className="me-3" /> Dashboard
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item className="mb-2">
                    <Nav.Link as={Link} to="/products" className={`nav-link-custom ${location.pathname.startsWith('/products') ? 'active' : ''}`}>
                        <FaBox className="me-3" /> Products
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item className="mb-2">
                    <Nav.Link as={Link} to="/categories" className={`nav-link-custom ${location.pathname.startsWith('/categories') ? 'active' : ''}`}>
                        <FaList className="me-3" /> Categories
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item className="mb-2">
                    <Nav.Link as={Link} to="/orders" className={`nav-link-custom ${location.pathname.startsWith('/orders') ? 'active' : ''}`}>
                        <FaShoppingCart className="me-3" /> Orders
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item className="mb-2">
                    <Nav.Link as={Link} to="/users" className={`nav-link-custom ${location.pathname.startsWith('/users') ? 'active' : ''}`}>
                        <FaUser className="me-3" /> Customers
                    </Nav.Link>
                </Nav.Item>

                <div className="mt-5 border-top border-secondary pt-3 mx-2"></div>

                <Nav.Item>
                    <Nav.Link onClick={() => { localStorage.removeItem('userInfo'); window.location.href = '/login'; }} className="nav-link-custom text-danger" style={{ cursor: 'pointer', color: '#ef4444 !important' }}>
                        <FaSignOutAlt className="me-3" /> Logout
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </div>
    );
};

export default Sidebar;
