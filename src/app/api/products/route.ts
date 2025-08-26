import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { sampleProducts, transformProductData } from '@/lib/sampleData';

export async function GET() {
    try {
        const hasUploadedData = dataStore.hasData();
        const rawProducts = hasUploadedData ? dataStore.getProducts() : sampleProducts;
        const transformedProducts = rawProducts.map(transformProductData);

        return NextResponse.json({
            products: transformedProducts,
            source: hasUploadedData ? 'uploaded' : 'sample'
        });
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { products } = await request.json();
        dataStore.setProducts(products);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to store products:', error);
        return NextResponse.json({ error: 'Failed to store products' }, { status: 500 });
    }
}
