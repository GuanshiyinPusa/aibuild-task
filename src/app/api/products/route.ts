import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sessionManager } from '@/lib/sessionManager';

// Helper function to transform product data for charts
const transformProductData = (product: any) => {
    const chartData = [];
    let currentInventory = product.openingInventory;

    for (let day = 1; day <= 3; day++) {
        const dayData = product.dailyData.find((d: any) => d.day === day);
        if (dayData) {
            currentInventory = currentInventory + dayData.procurementQty - dayData.salesQty;

            chartData.push({
                day: `Day ${day}`,
                inventory: Math.max(0, currentInventory),
                procurementAmount: dayData.procurementQty * dayData.procurementPrice,
                salesAmount: dayData.salesQty * dayData.salesPrice
            });
        }
    }

    return {
        id: product.id,
        productId: product.productId,
        productName: product.productName,
        openingInventory: product.openingInventory,
        chartData
    };
};

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const sessionToken = request.cookies.get('session')?.value;
        if (!sessionToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = sessionManager.getSession(sessionToken);
        if (!session) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        // Fetch products for the authenticated user
        const products = await prisma.product.findMany({
            where: { userId: session.userId },
            include: {
                dailyData: {
                    orderBy: { day: 'asc' }
                }
            },
            orderBy: { productName: 'asc' }
        });

        // Transform data for charts
        const transformedProducts = products.map(transformProductData);

        return NextResponse.json({
            products: transformedProducts,
            source: 'database'
        });
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
