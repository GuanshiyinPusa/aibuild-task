'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';

export default function Upload() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [uploadedData, setUploadedData] = useState<any>(null);
    const router = useRouter();

    // Add authentication
    const { user, isLoading: authLoading, requireAuth } = useAuth();

    useEffect(() => {
        requireAuth();
    }, []);

    // Add authentication loading check
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

    if (!user) {
        return null;
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (selectedFile: File) => {
        if (selectedFile.type.includes('sheet') ||
            selectedFile.name.endsWith('.xlsx') ||
            selectedFile.name.endsWith('.xls')) {
            setFile(selectedFile);
            setMessage('');
            setUploadedData(null);
        } else {
            setMessage('Please select an Excel file (.xlsx or .xls)');
            setFile(null);
        }
    };

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setIsUploading(true);
        setMessage('');
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                setUploadedData(result);
                setMessage(`✅ ${result.message}`);
                // Store the data so dashboard can access it
                await fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ products: result.data })
                });
            } else {
                setMessage(`❌ ${result.error}`);
            }
        } catch (error) {
            setMessage('❌ Upload failed. Please try again.');
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const goToDashboard = () => {
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Product Data</h1>
                    <p className="text-gray-600">
                        Upload an Excel file with your procurement and sales data to visualize in the dashboard.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <form onSubmit={handleFileUpload} className="space-y-6">
                        {/* File Drop Zone */}
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${dragActive
                                ? 'border-blue-500 bg-blue-50'
                                : file
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <div className="space-y-4">
                                {/* Upload Icon */}
                                <div className="mx-auto w-16 h-16 text-gray-400">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                                        <path strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                {file ? (
                                    <div>
                                        <p className="text-lg font-medium text-green-700">File Selected:</p>
                                        <p className="text-green-600">{file.name}</p>
                                        <p className="text-sm text-gray-500">
                                            Size: {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-lg font-medium text-gray-700">
                                            Drop Excel file here, or click to select
                                        </p>
                                        <p className="text-gray-500">
                                            Supports .xlsx and .xls files
                                        </p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                                    className="hidden"
                                    id="file-upload"
                                />
                                {!file && (
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium inline-block"
                                    >
                                        Choose File
                                    </label>
                                )}
                            </div>
                        </div>
                        {/* Upload Button */}
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard')}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Back to Dashboard
                            </button>
                            <button
                                type="submit"
                                disabled={!file || isUploading}
                                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {isUploading ? 'Processing...' : 'Upload & Process'}
                            </button>
                        </div>
                    </form>
                    {/* Status Message */}
                    {message && (
                        <div className={`mt-6 p-4 rounded-lg ${message.includes('✅')
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                            <div className="flex items-center justify-between">
                                <span>{message}</span>
                                {message.includes('✅') && (
                                    <button
                                        onClick={goToDashboard}
                                        className="ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
                                    >
                                        View Dashboard
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Show uploaded data preview */}
                    {uploadedData && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-blue-900 mb-2">Upload Summary:</h3>
                            <div className="text-sm text-blue-800">
                                <p>📊 Products processed: <strong>{uploadedData.data?.length || 0}</strong></p>
                                {uploadedData.data && uploadedData.data.length > 0 && (
                                    <div className="mt-2">
                                        <p>Sample products:</p>
                                        <ul className="list-disc list-inside ml-4 space-y-1">
                                            {uploadedData.data.slice(0, 3).map((product: any, index: number) => (
                                                <li key={index}>
                                                    <strong>{product.productName}</strong> (ID: {product.productId})
                                                </li>
                                            ))}
                                            {uploadedData.data.length > 3 && <li>... and {uploadedData.data.length - 3} more</li>}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Expected Format Info */}
                    <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">Expected Excel Format:</h3>
                        <div className="text-sm text-blue-700 space-y-1">
                            <p>• <strong>Column A:</strong> Product ID</p>
                            <p>• <strong>Column B:</strong> Product Name</p>
                            <p>• <strong>Column C:</strong> Opening Inventory</p>
                            <p>• <strong>Columns D-I:</strong> Procurement Qty & Price (Days 1-3)</p>
                            <p>• <strong>Columns J-O:</strong> Sales Qty & Price (Days 1-3)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
