'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
    return (
        <div className="w-full h-96 p-6 border border-gray-200 rounded-lg bg-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{productName}</h3>
                    <p className="text-sm text-gray-500">Product ID: {productId}</p>
                </div>
            </div>
            <ResponsiveContainer width="100%" height="85%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip
                        formatter={(value: any, name: any) => [
                            `${typeof value === 'number' ? value.toLocaleString() : value}${name.includes('Amount') ? ' $' : ' units'}`,
                            name
                        ]}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="inventory"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        name="Inventory (units)"
                    />
                    <Line
                        type="monotone"
                        dataKey="procurementAmount"
                        stroke="#10b981"
                        strokeWidth={3}
                        name="Procurement Amount"
                    />
                    <Line
                        type="monotone"
                        dataKey="salesAmount"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        name="Sales Amount"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
