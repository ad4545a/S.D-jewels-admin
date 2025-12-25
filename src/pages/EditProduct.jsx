import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import api from '../utils/api';
import { useNavigate, useParams } from 'react-router-dom';

// --- Filter Options Constants ---
const GENDER_OPTIONS = ["Women", "Men", "Kids", "Unisex"];
const OCCASION_OPTIONS = ["Daily Wear", "Party Wear", "Wedding", "Work Wear", "Anniversary", "Gift"];
const METAL_TYPE_OPTIONS = ["Gold", "Platinum", "Silver", "Brass", "925 Silver", "Oxidized Silver", "Gold Plated", "Rose Gold Plated"];
const METAL_COLOR_OPTIONS = ["Yellow", "White", "Rose", "Two-Tone", "Oxidized"];
const STONE_TYPE_OPTIONS = ["Diamond", "Gemstone", "Pearl", "Polki", "Navratna", "Swarovski", "Cubic Zirconia", "Plain", "Solitaire"];
const CATEGORY_STYLES = {
    "Ring": ["Solitaire", "Halo", "Vintage", "Band", "Couple Rings", "Cluster", "Three Stone", "Cocktail", "Promise Rings", "Infinity"],
    "Earrings": ["Studs", "Hoops", "Drops", "Jhumkas", "Chandbalis", "Sui Dhaga", "Ear Cuffs", "Danglers"],
    "Necklace": ["Chain", "Pendant", "Collar", "Choker", "Layered", "Locket", "Long Necklace", "Pearl Necklaces", "Bridal Sets"],
    "Bracelet": ["Chain", "Tennis", "Bangle", "Cuff", "Charm", "Flexible"],
    "Mangalsutra": ["Modern Mangalsutra", "Traditional", "Gold Mangalsutra", "Diamond Mangalsutra", "Bracelet Mangalsutra", "Chain Mangalsutra"],
    "Pendant": ["Alphabet", "Heart", "Religious", "Casual", "Solitaire"],
    "Solitaire": ["Solitaire Rings", "Solitaire Earrings", "Solitaire Pendants", "Solitaire Mangalsutras", "Solitaire Bands"],
    "Silver": ["Earrings", "Necklaces", "Rings", "Bracelets", "Anklets", "Toe Rings", "Nose Pins"]
};

const DEFAULT_STYLE_OPTIONS = [
    "Solitaire", "Halo", "Vintage", "Band", "Studs", "Hoops", "Drops", "Jhumkas", "Chain", "Tennis", "Bangle"
];

// --- Helper Component for Multi-Select ---
const MultiSelect = ({ label, options, value, onChange }) => {
    // Ensure value is always an array
    const selectedValues = Array.isArray(value) ? value : [];

    const handleCheckboxChange = (option) => {
        if (selectedValues.includes(option)) {
            onChange(selectedValues.filter(item => item !== option));
        } else {
            onChange([...selectedValues, option]);
        }
    };

    return (
        <Form.Group className="mb-3">
            <Form.Label>{label}</Form.Label>
            <div className="border rounded p-2" style={{ maxHeight: '120px', overflowY: 'auto', background: '#fff' }}>
                {options.map((opt) => (
                    <Form.Check
                        key={opt}
                        type="checkbox"
                        label={opt}
                        checked={selectedValues.includes(opt)}
                        onChange={() => handleCheckboxChange(opt)}
                        className="mb-1"
                    />
                ))}
            </div>
            <Form.Text className="text-muted" style={{ fontSize: '0.8rem' }}>
                Selected: {selectedValues.join(', ') || 'None'}
            </Form.Text>
        </Form.Group>
    );
};

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- Basic Info ---
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');

    // --- Pricing & Stock ---
    const [price, setPrice] = useState(0);
    const [countInStock, setCountInStock] = useState(0);

    // --- Attributes (Multi-Select Arrays) ---
    const [style, setStyle] = useState([]);
    const [metalType, setMetalType] = useState([]);
    const [metalColor, setMetalColor] = useState([]);
    const [stoneType, setStoneType] = useState([]);
    const [gender, setGender] = useState([]);
    const [occasion, setOccasion] = useState([]);
    const [collectionName, setCollectionName] = useState([]);

    // --- Specifics ---
    const [weight, setWeight] = useState('');
    const [carat, setCarat] = useState('');
    const [material, setMaterial] = useState('');
    const [size, setSize] = useState('');
    const [productDetails, setProductDetails] = useState('');

    // --- Media ---
    const [image, setImage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories', error);
            }
        };

        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${id}`);
                setName(data.name);
                setPrice(data.price);
                setImage(data.image);
                setBrand(data.brand);
                const catVal = Array.isArray(data.category) ? data.category[0] : data.category;
                setCategory(catVal || '');
                setCountInStock(data.countInStock);
                setDescription(data.description);
                setProductDetails(data.productDetails || '');
                setWeight(data.weight || '');
                setCarat(data.carat || '');
                setMaterial(data.material || '');
                setSize(data.size || '');

                // Helper to safely convert existing data to array
                const toArray = (val) => {
                    if (Array.isArray(val)) return val;
                    if (val && typeof val === 'string') return [val];
                    return [];
                };

                // New Fields (Ensure Arrays)
                setStyle(toArray(data.style));
                setMetalType(toArray(data.metalType));
                setMetalColor(toArray(data.metalColor));
                setStoneType(toArray(data.stoneType));
                setGender(toArray(data.gender));
                setOccasion(toArray(data.occasion));
                setCollectionName(toArray(data.collectionName));

            } catch (error) {
                console.error('Failed to fetch product', error);
            }
        };

        fetchCategories();
        fetchProduct();
    }, [id]);

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const { data } = await api.post('/upload', formData);
            setImage(data.url);
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
            alert('Image upload failed');
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/products/${id}`, {
                name, price, image, brand, category,
                description, productDetails, countInStock,
                weight, carat, material, size,
                style, metalType, metalColor, stoneType, gender, occasion, collectionName
            });
            navigate('/products');
        } catch (error) {
            console.error('Update Product Error:', error);
            const message = error.response && error.response.data.message
                ? error.response.data.message
                : error.message;
            alert(`Error updating product: ${message}`);
        }
    };

    const styleOptions = CATEGORY_STYLES[category] || DEFAULT_STYLE_OPTIONS;

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0 fw-bold text-dark">Edit Product</h2>
                <Button variant="outline-secondary" onClick={() => navigate('/products')}>Cancel</Button>
            </div>

            <Form onSubmit={submitHandler}>
                <Row>
                    {/* Left Column: Main Details */}
                    <Col lg={8}>
                        <Card className="mb-4 shadow-sm border-0">
                            <Card.Body>
                                <Card.Title className="mb-3 text-muted">Basic Information</Card.Title>
                                <Form.Group className="mb-3" controlId="name">
                                    <Form.Label>Product Name</Form.Label>
                                    <Form.Control type="text" placeholder="e.g. Diamond Solitaire Ring" value={name} onChange={(e) => setName(e.target.value)} required />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="description">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control as="textarea" rows={3} placeholder="Product description..." value={description} onChange={(e) => setDescription(e.target.value)} required />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="brand">
                                            <Form.Label>Brand</Form.Label>
                                            <Form.Control type="text" value={brand} onChange={(e) => setBrand(e.target.value)} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="category">
                                            <Form.Label>Category</Form.Label>
                                            <Form.Select value={category} onChange={(e) => setCategory(e.target.value)} required>
                                                <option value="">Select Category</option>
                                                {categories.map((cat) => (
                                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Card className="mb-4 shadow-sm border-0">
                            <Card.Body>
                                <Card.Title className="mb-3 text-muted">Jewelry Attributes (Multi-Select)</Card.Title>
                                <Row>
                                    <Col md={4}>
                                        <MultiSelect label="Gender" options={GENDER_OPTIONS} value={gender} onChange={setGender} />
                                    </Col>
                                    <Col md={4}>
                                        <MultiSelect label="Occasion" options={OCCASION_OPTIONS} value={occasion} onChange={setOccasion} />
                                    </Col>
                                    <Col md={4}>
                                        <MultiSelect label="Style" options={styleOptions} value={style} onChange={setStyle} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={4}>
                                        <MultiSelect label="Metal Type" options={METAL_TYPE_OPTIONS} value={metalType} onChange={setMetalType} />
                                    </Col>
                                    <Col md={4}>
                                        <MultiSelect label="Metal Color" options={METAL_COLOR_OPTIONS} value={metalColor} onChange={setMetalColor} />
                                    </Col>
                                    <Col md={4}>
                                        <MultiSelect label="Stone Type" options={STONE_TYPE_OPTIONS} value={stoneType} onChange={setStoneType} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="collectionName">
                                            <Form.Label>Collection (Type to add)</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. Butterfly"
                                                value={collectionName.join(', ')}
                                                onChange={(e) => setCollectionName(e.target.value.split(',').map(s => s.trim()))}
                                            />
                                            <Form.Text className="text-muted">Use commas for multiple</Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="carat">
                                            <Form.Label>Purity (Carat)</Form.Label>
                                            <Form.Select value={carat} onChange={(e) => setCarat(e.target.value)}>
                                                <option value="">Select Purity</option>
                                                <option value="14k">14k</option>
                                                <option value="18k">18k</option>
                                                <option value="22k">22k</option>
                                                <option value="24k">24k</option>
                                                <option value="950 Pt">950 Pt (Platinum)</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Card className="mb-4 shadow-sm border-0">
                            <Card.Body>
                                <Card.Title className="mb-3 text-muted">Detailed Specs</Card.Title>
                                <Form.Group className="mb-3" controlId="productDetails">
                                    <Form.Label>Full Details (JSON/Text)</Form.Label>
                                    <Form.Control as="textarea" rows={3} value={productDetails} onChange={(e) => setProductDetails(e.target.value)} />
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Right Column: Organization & Media */}
                    <Col lg={4}>
                        <Card className="mb-4 shadow-sm border-0">
                            <Card.Body>
                                <Card.Title className="mb-3 text-muted">Pricing & Stock</Card.Title>
                                <Form.Group className="mb-3" controlId="price">
                                    <Form.Label>Price (₹)</Form.Label>
                                    <Form.Control type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="countInStock">
                                    <Form.Label>Stock Quantity</Form.Label>
                                    <Form.Control type="number" placeholder="0" value={countInStock} onChange={(e) => setCountInStock(Number(e.target.value))} required />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="weight">
                                    <Form.Label>Weight (Gross)</Form.Label>
                                    <Form.Control type="text" placeholder="e.g. 5.5g" value={weight} onChange={(e) => setWeight(e.target.value)} />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="material">
                                    <Form.Label>Material (Generic)</Form.Label>
                                    <Form.Control type="text" placeholder="e.g. Gold" value={material} onChange={(e) => setMaterial(e.target.value)} />
                                </Form.Group>

                                {['Ring', 'Bangle', 'Bracelet', 'Necklace', 'Mangalsutra', 'Chain'].includes(category) && (
                                    <Form.Group className="mb-3" controlId="size">
                                        <Form.Label>
                                            {category === 'Ring' ? 'Ring Size' :
                                                ['Bangle', 'Bracelet'].includes(category) ? 'Bangle/Bracelet Size' :
                                                    ['Necklace', 'Mangalsutra', 'Chain'].includes(category) ? 'Chain Length' :
                                                        'Size/Dimensions'}
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder={category === 'Ring' ? "e.g. 12, 14, 16" : "e.g. 18 inch, 2.4, 2.6"}
                                            value={size}
                                            onChange={(e) => setSize(e.target.value)}
                                        />
                                    </Form.Group>
                                )}
                            </Card.Body>
                        </Card>

                        <Card className="mb-4 shadow-sm border-0">
                            <Card.Body>
                                <Card.Title className="mb-3 text-muted">Product Image</Card.Title>
                                <Form.Group className="mb-3" controlId="image">
                                    <div className="mb-3 border rounded p-2 text-center" style={{ minHeight: '150px', backgroundColor: '#f9f9f9' }}>
                                        {image ? <img src={image} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} /> : <span className="text-muted">No image uploaded</span>}
                                    </div>
                                    <Form.Label>Image URL</Form.Label>
                                    <Form.Control type="text" placeholder="Enter URL" value={image} onChange={(e) => setImage(e.target.value)} className="mb-2" />
                                    <Form.Control type="file" onChange={uploadFileHandler} />
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <div className="d-grid gap-2 mb-5">
                    <Button variant="primary" size="lg" type="submit" disabled={uploading}>
                        {uploading ? 'Processing...' : 'Update Product'}
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

export default EditProduct;
