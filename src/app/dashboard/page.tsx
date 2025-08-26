'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductChart from '@/components/ProductChart';
import { useAuth } from '@/lib/useAuth';

export default function Dashboard() {
    const { user, isLoading: authLoading, logout, requireAuth } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [dataSource, setDataSource] = useState<'sample' | 'uploaded'>('sample');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        requireAuth();
    }, []);

    useEffect(() => {
        if (user) {
            fetchProducts();
        }
    }, [user]);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/products');
            if (response.ok) {
                const data = await response.json();
                setProducts(data.products);
                setDataSource(data.source);
                const autoSelect = data.products.slice(0, Math.min(2, data.products.length)).map((p: any) => p.id);
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

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    // Don't render dashboard if not authenticated
    if (!user) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Analytics Dashboard
                            </h1>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${dataSource === 'uploaded'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                {dataSource === 'uploaded' ? '📄 Excel Data' : '🧪 Sample Data'}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">
                                Welcome, <strong>{user.username}</strong>
                            </span>
                            <Link
                                href="/upload"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            >
                                Upload Data
                            </Link>
                            <button
                                onClick={logout}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                            >
                                Logout
                            </button>
                            <span className="px-3 py-2 text-sm bg-green-100 text-green-800 rounded-lg">
                                {products.length} Products
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-6">
                {products.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border">
                        <p className="text-gray-500 text-lg mb-4">
                            No product data available
                        </p>
                        <Link
                            href="/upload"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Upload Excel File
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Product Selection */}
                        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border">
                            <h2 className="text-xl font-semibold mb-4 text-gray-900">
                                Select Products to Compare
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {products.map(product => (
                                    <label key={product.id} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product.id)}
                                            onChange={() => handleProductSelection(product.id)}
                                            className="h-4 w-4 text-blue-600"
                                        />
                                        <div className="flex-1">
                                            <span className="font-medium text-gray-900">{product.productName}</span>
                                            <div className="text-sm text-gray-500">ID: {product.productId}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="space-y-8">
                            {selectedProductsData.length > 0 ? (
                                selectedProductsData.map(product => (
                                    <ProductChart
                                        key={product.id}
                                        data={product.chartData}
                                        productName={product.productName}
                                        productId={product.productId}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white rounded-lg border">
                                    <p className="text-gray-500 text-lg">
                                        Select products above to view their analytics
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
