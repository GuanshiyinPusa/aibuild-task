'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import {
    Container,
    Paper,
    Typography,
    Button,
    Box,
    Alert,
    LinearProgress,
    Card,
    CardContent,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Fade,
    Zoom,
} from '@mui/material';
import {
    CloudUpload,
    Dashboard,
    CheckCircle,
    InsertDriveFile,
    ArrowBack,
    Description,
    TableChart,
    Timeline,
    Assessment,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Fixed styled components for drag and drop
const DropZone = styled(Paper, {
    // This tells Material-UI which props should NOT be passed to the DOM
    shouldForwardProp: (prop) => prop !== 'isDragActive' && prop !== 'hasFile',
})<{ isDragActive?: boolean; hasFile?: boolean }>(({ theme, isDragActive, hasFile }) => ({
    border: `2px dashed ${hasFile
        ? theme.palette.success.main
        : isDragActive
            ? theme.palette.primary.main
            : theme.palette.divider
        }`,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(4),
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: hasFile
        ? theme.palette.success.light + '10'
        : isDragActive
            ? theme.palette.primary.light + '10'
            : 'transparent',
    '&:hover': {
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light + '05',
    },
}));

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

interface UploadResponse {
    success: boolean;
    message: string;
    data?: Array<{
        id: string;
        productId: string;
        productName: string;
    }>;
}
export default function Upload() {
    const { user, isLoading: authLoading, requireAuth } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [uploadedData, setUploadedData] = useState<UploadResponse | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const router = useRouter();

    useEffect(() => {
        requireAuth();
    }, [requireAuth]);

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
        setUploadProgress(0);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 200);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.ok) {
                setUploadedData(result);
                setMessage(`✅ ${result.message}`);
            } else {
                setMessage(`❌ ${result.error}`);
            }

        } catch (error) {
            clearInterval(progressInterval);
            setMessage('❌ Upload failed. Please try again.');
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
            setTimeout(() => setUploadProgress(0), 2000);
        }
    };

    const goToDashboard = () => {
        router.push('/dashboard');
    };

    // Loading state
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
                <LinearProgress sx={{ width: '200px', mb: 2 }} />
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

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                py: 4,
            }}
        >
            <Container maxWidth="md">
                {/* Header */}
                <Fade in timeout={800}>
                    <Box textAlign="center" mb={4}>
                        <CloudUpload sx={{ fontSize: 60, color: 'white', mb: 2 }} />
                        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
                            Upload Product Data
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            Upload an Excel file with your procurement and sales data to visualize in the dashboard
                        </Typography>
                    </Box>
                </Fade>

                {/* Main Upload Card */}
                <Zoom in timeout={1000}>
                    <Paper elevation={8} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box component="form" onSubmit={handleFileUpload}>
                                {/* File Drop Zone - FIXED VERSION */}
                                <DropZone
                                    isDragActive={dragActive}
                                    hasFile={!!file}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    sx={{ mb: 3 }}
                                >
                                    <Box>
                                        {file ? (
                                            <Fade in>
                                                <Box>
                                                    <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                                                    <Typography variant="h5" gutterBottom color="success.main" fontWeight="bold">
                                                        File Selected
                                                    </Typography>
                                                    <Chip
                                                        icon={<InsertDriveFile />}
                                                        label={file.name}
                                                        color="success"
                                                        variant="outlined"
                                                        sx={{ mb: 1, maxWidth: '300px' }}
                                                    />
                                                    <Typography variant="body2" color="text.secondary">
                                                        Size: {(file.size / 1024).toFixed(2)} KB
                                                    </Typography>
                                                </Box>
                                            </Fade>
                                        ) : (
                                            <Box>
                                                <CloudUpload sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                                <Typography variant="h5" gutterBottom color="text.primary" fontWeight="medium">
                                                    Drop Excel file here, or click to select
                                                </Typography>
                                                <Typography variant="body1" color="text.secondary" mb={3}>
                                                    Supports .xlsx and .xls files up to 10MB
                                                </Typography>

                                                <Button
                                                    component="label"
                                                    variant="contained"
                                                    startIcon={<CloudUpload />}
                                                    size="large"
                                                    sx={{ fontWeight: 'bold' }}
                                                >
                                                    Choose File
                                                    <VisuallyHiddenInput
                                                        type="file"
                                                        accept=".xlsx,.xls"
                                                        onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                                                    />
                                                </Button>
                                            </Box>
                                        )}
                                    </Box>
                                </DropZone>

                                {/* Progress Bar */}
                                {isUploading && (
                                    <Fade in>
                                        <Box sx={{ mb: 3 }}>
                                            <Box display="flex" alignItems="center" justifyContent="between" mb={1}>
                                                <Typography variant="body2" color="primary" fontWeight="medium">
                                                    Processing file...
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {uploadProgress}%
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={uploadProgress}
                                                sx={{ height: 8, borderRadius: 5 }}
                                            />
                                        </Box>
                                    </Fade>
                                )}

                                {/* Action Buttons */}
                                <Box display="flex" gap={2} mb={3}>
                                    <Button
                                        startIcon={<ArrowBack />}
                                        onClick={() => router.push('/dashboard')}
                                        variant="outlined"
                                        fullWidth
                                        size="large"
                                    >
                                        Back to Dashboard
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={!file || isUploading}
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        startIcon={isUploading ? undefined : <CloudUpload />}
                                        sx={{ fontWeight: 'bold' }}
                                    >
                                        {isUploading ? 'Processing...' : 'Upload & Process'}
                                    </Button>
                                </Box>

                                {/* Status Message */}
                                {message && (
                                    <Fade in>
                                        <Alert
                                            severity={message.includes('✅') ? 'success' : 'error'}
                                            sx={{ mb: 3 }}
                                            action={
                                                message.includes('✅') && (
                                                    <Button
                                                        color="inherit"
                                                        size="small"
                                                        onClick={goToDashboard}
                                                        startIcon={<Dashboard />}
                                                    >
                                                        View Dashboard
                                                    </Button>
                                                )
                                            }
                                        >
                                            <Typography variant="body1" fontWeight="medium">
                                                {message}
                                            </Typography>
                                        </Alert>
                                    </Fade>
                                )}

                                {/* Upload Summary */}
                                {uploadedData && (
                                    <Zoom in>
                                        <Card variant="outlined" sx={{ bgcolor: 'success.light', color: 'success.contrastText', mb: 3 }}>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom color="success.dark" fontWeight="bold">
                                                    📊 Upload Summary
                                                </Typography>
                                                <Box display="flex" alignItems="center" gap={2} mb={2}>
                                                    <Assessment color="success" />
                                                    <Typography variant="body1" color="success.dark">
                                                        <strong>{uploadedData.data?.length || 0}</strong> products processed successfully
                                                    </Typography>
                                                </Box>

                                                {uploadedData.data && uploadedData.data.length > 0 && (
                                                    <Box>
                                                        <Typography variant="subtitle2" color="success.dark" mb={1}>
                                                            Sample products:
                                                        </Typography>
                                                        <List dense>
                                                            {uploadedData.data.slice(0, 3).map((product, index: number) => (
                                                                <ListItem key={index} sx={{ py: 0.5 }}>
                                                                    <ListItemIcon sx={{ minWidth: 30 }}>
                                                                        <TableChart color="success" fontSize="small" />
                                                                    </ListItemIcon>
                                                                    <ListItemText
                                                                        primary={
                                                                            <Typography variant="body2" color="success.dark" fontWeight="medium">
                                                                                {product.productName}
                                                                            </Typography>
                                                                        }
                                                                        secondary={
                                                                            <Typography variant="caption" color="success.dark">
                                                                                ID: {product.productId}
                                                                            </Typography>
                                                                        }
                                                                    />
                                                                </ListItem>
                                                            ))}
                                                            {uploadedData.data.length > 3 && (
                                                                <ListItem sx={{ py: 0.5 }}>
                                                                    <ListItemIcon sx={{ minWidth: 30 }}>
                                                                        <Timeline color="success" fontSize="small" />
                                                                    </ListItemIcon>
                                                                    <ListItemText
                                                                        primary={
                                                                            <Typography variant="body2" color="success.dark" fontStyle="italic">
                                                                                ... and {uploadedData.data.length - 3} more products
                                                                            </Typography>
                                                                        }
                                                                    />
                                                                </ListItem>
                                                            )}
                                                        </List>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Zoom>
                                )}
                            </Box>
                        </CardContent>
                    </Paper>
                </Zoom>

                {/* Expected Format Guide */}
                <Fade in timeout={1200}>
                    <Card sx={{ mt: 4, backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                                📋 Expected Excel Format
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <List>
                                <ListItem>
                                    <ListItemIcon><Description color="primary" /></ListItemIcon>
                                    <ListItemText
                                        primary="Column A: Product ID"
                                        secondary="Unique identifier for each product"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><Description color="primary" /></ListItemIcon>
                                    <ListItemText
                                        primary="Column B: Product Name"
                                        secondary="Descriptive name of the product"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><Description color="primary" /></ListItemIcon>
                                    <ListItemText
                                        primary="Column C: Opening Inventory"
                                        secondary="Initial stock quantity on Day 1"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><Description color="primary" /></ListItemIcon>
                                    <ListItemText
                                        primary="Columns D-I: Procurement Data"
                                        secondary="Quantity & Price for Days 1, 2, 3"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><Description color="primary" /></ListItemIcon>
                                    <ListItemText
                                        primary="Columns J-O: Sales Data"
                                        secondary="Quantity & Price for Days 1, 2, 3"
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Fade>
            </Container>
        </Box>
    );
}
