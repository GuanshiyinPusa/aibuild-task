'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductChart from '@/components/ProductChart';
import { useAuth } from '@/lib/useAuth';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Chip,
    Container,
    Paper,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Card,
    CardContent,
    CircularProgress,
} from '@mui/material';
import {
    CloudUpload,
    Logout,
    Dashboard as DashboardIcon,
    InsertChart,
} from '@mui/icons-material';

interface Product {
    id: string;
    productId: string;
    productName: string;
    chartData: Array<{
        day: string;
        inventory: number;
        procurementAmount: number;
        salesAmount: number;
    }>;
}

export default function Dashboard() {
    const { user, isLoading: authLoading, logout } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [dataSource, setDataSource] = useState<'sample' | 'uploaded' | 'database'>('database');
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Memoize requireAuth to avoid useEffect dependency warning
    const requireAuth = useCallback(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        requireAuth();
    }, [requireAuth]);

    useEffect(() => {
        if (user) {
            fetchProducts();
        }
    }, [user]);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            if (response.ok) {
                const data: { products: Product[]; source: string } = await response.json();
                setProducts(data.products);
                setDataSource(data.source as 'sample' | 'uploaded' | 'database');
                const autoSelect = data.products.slice(0, Math.min(2, data.products.length)).map((p) => p.id);
                setSelectedProducts(autoSelect);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProductSelection = (productId: string) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const selectedProductsData = products.filter(product => selectedProducts.includes(product.id));

    if (authLoading) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                bgcolor="background.default"
            >
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                    Checking authentication...
                </Typography>
            </Box>
        );
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    if (isLoading) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                bgcolor="background.default"
            >
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                    Loading products...
                </Typography>
            </Box>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AppBar position="static" elevation={2}>
                <Toolbar>
                    <DashboardIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        Analytics Dashboard
                        <Chip
                            label={dataSource === 'uploaded' ? '📄 Excel Data' : dataSource === 'database' ? '💾 Database' : '🧪 Sample Data'}
                            size="small"
                            color={dataSource === 'uploaded' || dataSource === 'database' ? 'success' : 'info'}
                            sx={{ ml: 2 }}
                        />
                    </Typography>

                    <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="body2" color="inherit">
                            Welcome, <strong>{user.username}</strong>
                        </Typography>

                        <Button
                            component={Link}
                            href="/upload"
                            variant="contained"
                            color="secondary"
                            startIcon={<CloudUpload />}
                            sx={{ color: 'white' }}
                        >
                            Upload Data
                        </Button>

                        <Button
                            onClick={logout}
                            variant="outlined"
                            color="inherit"
                            startIcon={<Logout />}
                            sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}
                        >
                            Logout
                        </Button>

                        <Chip
                            label={`${products.length} Products`}
                            color="success"
                            variant="filled"
                        />
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ py: 4 }}>
                {products.length === 0 ? (
                    <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
                        <InsertChart sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h5" gutterBottom color="text.secondary">
                            No product data available
                        </Typography>
                        <Button
                            component={Link}
                            href="/upload"
                            variant="contained"
                            size="large"
                            startIcon={<CloudUpload />}
                            sx={{ mt: 2 }}
                        >
                            Upload Excel File
                        </Button>
                    </Paper>
                ) : (
                    <>
                        <Card elevation={2} sx={{ mb: 4 }}>
                            <CardContent>
                                <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
                                    Select Products to Compare
                                </Typography>
                                <FormGroup row>
                                    {products.map(product => (
                                        <FormControlLabel
                                            key={product.id}
                                            control={
                                                <Checkbox
                                                    checked={selectedProducts.includes(product.id)}
                                                    onChange={() => handleProductSelection(product.id)}
                                                    color="primary"
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {product.productName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ID: {product.productId}
                                                    </Typography>
                                                </Box>
                                            }
                                            sx={{
                                                mr: 3,
                                                mb: 1,
                                                border: 1,
                                                borderColor: 'divider',
                                                borderRadius: 2,
                                                px: 2,
                                                py: 1,
                                                '&:hover': {
                                                    backgroundColor: 'action.hover',
                                                },
                                            }}
                                        />
                                    ))}
                                </FormGroup>
                            </CardContent>
                        </Card>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {selectedProductsData.length > 0 ? (
                                selectedProductsData.map(product => (
                                    <Card key={product.id} elevation={3}>
                                        <CardContent>
                                            <ProductChart
                                                data={product.chartData}
                                                productName={product.productName}
                                                productId={product.productId}
                                            />
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Paper
                                    elevation={2}
                                    sx={{
                                        p: 8,
                                        textAlign: 'center',
                                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                                    }}
                                >
                                    <InsertChart sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                                    <Typography variant="h5" color="text.secondary" gutterBottom>
                                        Select products above to view their analytics
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Choose one or more products to see detailed charts and insights
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    </>
                )}
            </Container>
        </div>
    );
}
