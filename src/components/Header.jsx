import React from 'react';
import { Navbar, Container, Nav, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaUser } from 'react-icons/fa';

const Header = () => {
    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-0">
            <Container fluid>
                <Navbar.Brand as={Link} to="/">Shop Admin</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link href="#" className="text-white">
                            <FaUser /> Admin
                        </Nav.Link>
                        <Nav.Link onClick={() => { localStorage.removeItem('userInfo'); window.location.href = '/login'; }} className="text-white" style={{ cursor: 'pointer' }}>
                            Logout
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
