import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import OrderList from './pages/OrderList';
import AddProduct from './pages/AddProduct';
import Login from './pages/Login';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={
          <div className="d-flex flex-column min-vh-100">
            <Header />
            <Container fluid className="flex-grow-1">
              <Row className="h-100">
                <Col md={2} className="bg-light sidebar p-0">
                  <Sidebar />
                </Col>
                <Col md={10} className="p-4">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/add" element={<AddProduct />} />
                    <Route path="/orders" element={<OrderList />} />
                  </Routes>
                </Col>
              </Row>
            </Container>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
