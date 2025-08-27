'use client';
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Switch,
    FormControlLabel,
    IconButton,
    Menu,
    MenuItem,
    Paper,
    Divider,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import {
    MoreVert,
    TrendingUp,
    Inventory,
    ShoppingCart,
    AttachMoney,
    ExpandMore,
    TableChart,
    ShowChart,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface ChartData {
    day: string;
    inventory: number;
    procurementAmount: number;
    salesAmount: number;
}

interface ProductChartProps {
    data: ChartData[];
    productName: string;
    productId: string;
}

export default function ProductChart({ data, productName, productId }: ProductChartProps) {
    const theme = useTheme();
    const [showInventory, setShowInventory] = useState(true);
    const [showProcurement, setShowProcurement] = useState(true);
    const [showSales, setShowSales] = useState(true);
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // Calculate summary statistics
    const totalProcurement = data.reduce((sum, day) => sum + day.procurementAmount, 0);
    const totalSales = data.reduce((sum, day) => sum + day.salesAmount, 0);
    const finalInventory = data[data.length - 1]?.inventory || 0;
    const netRevenue = totalSales - totalProcurement;
    const averageInventory = data.reduce((sum, day) => sum + day.inventory, 0) / data.length;

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleExport = () => {
        // Simulate export functionality
        const csvContent = [
            ['Day', 'Inventory', 'Procurement Amount', 'Sales Amount'],
            ...data.map(row => [row.day, row.inventory, row.procurementAmount, row.salesAmount])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${productName}_data.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        handleMenuClose();
    };

    // Custom tooltip component
    type TooltipPayloadEntry = {
        color: string;
        name: string;
        value: number;
        dataKey: string;
    };

    const CustomTooltip = ({
        active,
        payload,
        label,
    }: {
        active?: boolean;
        payload?: TooltipPayloadEntry[];
        label?: string;
    }) => {
        if (active && payload && payload.length) {
            return (
                <Paper elevation={8} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                        {label}
                    </Typography>
                    {payload.map((entry: TooltipPayloadEntry, index: number) => (
                        <Box key={index} display="flex" alignItems="center" gap={1} mb={0.5}>
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    backgroundColor: entry.color,
                                    borderRadius: '50%'
                                }}
                            />
                            <Typography variant="body2">
                                <strong>{entry.name}:</strong> {entry.value.toLocaleString()}
                                {entry.dataKey.includes('Amount') ? ' $' : ' units'}
                            </Typography>
                        </Box>
                    ))}
                </Paper>
            );
        }
        return null;
    };

    return (
        <Card elevation={3} sx={{ height: 'auto', overflow: 'visible' }}>
            {/* Card Header */}
            <CardContent sx={{ pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                        <Typography variant="h5" component="h3" fontWeight="bold" color="primary">
                            {productName}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                            <Chip
                                label={`ID: ${productId}`}
                                size="small"
                                variant="outlined"
                                color="primary"
                            />
                            <Chip
                                label={`${data.length} Days`}
                                size="small"
                                color="info"
                            />
                        </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                        {/* View Mode Toggle */}
                        <IconButton
                            onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
                            color={viewMode === 'table' ? 'primary' : 'default'}
                        >
                            {viewMode === 'chart' ? <TableChart /> : <ShowChart />}
                        </IconButton>

                        {/* Options Menu */}
                        <IconButton onClick={handleMenuClick}>
                            <MoreVert />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={handleExport}>Export as CSV</MenuItem>
                            <MenuItem onClick={handleMenuClose}>Print Chart</MenuItem>
                        </Menu>
                    </Box>
                </Box>

                {/* Key Metrics */}
                <Grid container spacing={2} mb={2}>
                    <Grid item xs={6} sm={3}>
                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                            <Inventory sx={{ mb: 0.5 }} />
                            <Typography variant="caption" display="block">Final Inventory</Typography>
                            <Typography variant="h6" fontWeight="bold">
                                {finalInventory.toLocaleString()} units
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                            <ShoppingCart sx={{ mb: 0.5 }} />
                            <Typography variant="caption" display="block">Total Procurement</Typography>
                            <Typography variant="h6" fontWeight="bold">
                                ${totalProcurement.toLocaleString()}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                            <AttachMoney sx={{ mb: 0.5 }} />
                            <Typography variant="caption" display="block">Total Sales</Typography>
                            <Typography variant="h6" fontWeight="bold">
                                ${totalSales.toLocaleString()}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 1.5,
                                textAlign: 'center',
                                bgcolor: netRevenue >= 0 ? 'success.light' : 'error.light',
                                color: netRevenue >= 0 ? 'success.contrastText' : 'error.contrastText'
                            }}
                        >
                            <TrendingUp sx={{ mb: 0.5 }} />
                            <Typography variant="caption" display="block">Net Revenue</Typography>
                            <Typography variant="h6" fontWeight="bold">
                                ${netRevenue.toLocaleString()}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Chart Controls */}
                {viewMode === 'chart' && (
                    <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showInventory}
                                    onChange={(e) => setShowInventory(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <Box sx={{ width: 12, height: 12, bgcolor: theme.palette.primary.main, borderRadius: '50%' }} />
                                    Inventory
                                </Box>
                            }
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showProcurement}
                                    onChange={(e) => setShowProcurement(e.target.checked)}
                                    color="success"
                                />
                            }
                            label={
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <Box sx={{ width: 12, height: 12, bgcolor: theme.palette.success.main, borderRadius: '50%' }} />
                                    Procurement
                                </Box>
                            }
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showSales}
                                    onChange={(e) => setShowSales(e.target.checked)}
                                    color="warning"
                                />
                            }
                            label={
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <Box sx={{ width: 12, height: 12, bgcolor: theme.palette.warning.main, borderRadius: '50%' }} />
                                    Sales
                                </Box>
                            }
                        />
                    </Box>
                )}
            </CardContent>

            <Divider />

            {/* Chart or Table Content */}
            <CardContent sx={{ pt: 2 }}>
                {viewMode === 'chart' ? (
                    <Box sx={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                <XAxis
                                    dataKey="day"
                                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                                    stroke={theme.palette.text.secondary}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                                    stroke={theme.palette.text.secondary}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{
                                        fontSize: '14px',
                                        paddingTop: '20px',
                                        color: theme.palette.text.primary
                                    }}
                                />

                                {showInventory && (
                                    <Line
                                        type="monotone"
                                        dataKey="inventory"
                                        stroke={theme.palette.primary.main}
                                        strokeWidth={3}
                                        name="Inventory (units)"
                                        dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 5 }}
                                        activeDot={{ r: 7, stroke: theme.palette.primary.main, strokeWidth: 2 }}
                                    />
                                )}

                                {showProcurement && (
                                    <Line
                                        type="monotone"
                                        dataKey="procurementAmount"
                                        stroke={theme.palette.success.main}
                                        strokeWidth={3}
                                        name="Procurement Amount ($)"
                                        dot={{ fill: theme.palette.success.main, strokeWidth: 2, r: 5 }}
                                        activeDot={{ r: 7, stroke: theme.palette.success.main, strokeWidth: 2 }}
                                    />
                                )}

                                {showSales && (
                                    <Line
                                        type="monotone"
                                        dataKey="salesAmount"
                                        stroke={theme.palette.warning.main}
                                        strokeWidth={3}
                                        name="Sales Amount ($)"
                                        dot={{ fill: theme.palette.warning.main, strokeWidth: 2, r: 5 }}
                                        activeDot={{ r: 7, stroke: theme.palette.warning.main, strokeWidth: 2 }}
                                    />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                ) : (
                    /* Table View */
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Day</strong></TableCell>
                                    <TableCell align="right"><strong>Inventory (units)</strong></TableCell>
                                    <TableCell align="right"><strong>Procurement ($)</strong></TableCell>
                                    <TableCell align="right"><strong>Sales ($)</strong></TableCell>
                                    <TableCell align="right"><strong>Daily Change</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.map((row, index) => {
                                    const dailyChange = row.salesAmount - row.procurementAmount;
                                    return (
                                        <TableRow key={index} hover>
                                            <TableCell component="th" scope="row">
                                                <Chip label={row.day} size="small" color="primary" />
                                            </TableCell>
                                            <TableCell align="right">
                                                {row.inventory.toLocaleString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                ${row.procurementAmount.toLocaleString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                ${row.salesAmount.toLocaleString()}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    label={`${dailyChange >= 0 ? '+' : ''}$${dailyChange.toLocaleString()}`}
                                                    size="small"
                                                    color={dailyChange >= 0 ? 'success' : 'error'}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </CardContent>

            {/* Additional Analytics */}
            <Divider />
            <Accordion elevation={0}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2" fontWeight="bold">
                        📊 Additional Analytics
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                Performance Metrics
                            </Typography>
                            <Box component="dl" sx={{ m: 0 }}>
                                <Box display="flex" justifyContent="space-between" py={0.5}>
                                    <Typography variant="body2" component="dt">Average Inventory:</Typography>
                                    <Typography variant="body2" component="dd" fontWeight="medium">
                                        {averageInventory.toFixed(0)} units
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" py={0.5}>
                                    <Typography variant="body2" component="dt">Inventory Turnover:</Typography>
                                    <Typography variant="body2" component="dd" fontWeight="medium">
                                        {(totalSales / averageInventory).toFixed(2)}x
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" py={0.5}>
                                    <Typography variant="body2" component="dt">Profit Margin:</Typography>
                                    <Typography variant="body2" component="dd" fontWeight="medium">
                                        {totalSales > 0 ? ((netRevenue / totalSales) * 100).toFixed(1) : 0}%
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                Daily Averages
                            </Typography>
                            <Box component="dl" sx={{ m: 0 }}>
                                <Box display="flex" justifyContent="space-between" py={0.5}>
                                    <Typography variant="body2" component="dt">Avg Procurement:</Typography>
                                    <Typography variant="body2" component="dd" fontWeight="medium">
                                        ${(totalProcurement / data.length).toLocaleString()}
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" py={0.5}>
                                    <Typography variant="body2" component="dt">Avg Sales:</Typography>
                                    <Typography variant="body2" component="dd" fontWeight="medium">
                                        ${(totalSales / data.length).toLocaleString()}
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" py={0.5}>
                                    <Typography variant="body2" component="dt">Avg Daily Profit:</Typography>
                                    <Typography variant="body2" component="dd" fontWeight="medium">
                                        ${(netRevenue / data.length).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Card>
    );
}
