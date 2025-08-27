import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sessionManager } from '@/lib/sessionManager';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
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

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Read the Excel file
        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: 'buffer' });

        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON (array of arrays)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip the header row and process data
        const dataRows = jsonData.slice(1) as any[][];

        // Start a transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
            // Delete existing products for this user (fresh import)
            await tx.product.deleteMany({
                where: { userId: session.userId }
            });

            const createdProducts = [];

            for (const row of dataRows) {
                // Skip empty rows
                if (!row || row.length === 0 || !row[0]) continue;

                const [
                    productId, productName, openingInventory,
                    procQty1, procPrice1, procQty2, procPrice2, procQty3, procPrice3,
                    salesQty1, salesPrice1, salesQty2, salesPrice2, salesQty3, salesPrice3
                ] = row;

                // Create product
                const product = await tx.product.create({
                    data: {
                        productId: productId?.toString() || '',
                        productName: productName?.toString() || 'Unknown Product',
                        openingInventory: parseInt(openingInventory) || 0,
                        userId: session.userId
                    }
                });

                // Create daily data for 3 days
                const dailyDataEntries = [
                    {
                        day: 1,
                        procurementQty: parseInt(procQty1) || 0,
                        procurementPrice: parseFloat(procPrice1) || 0,
                        salesQty: parseInt(salesQty1) || 0,
                        salesPrice: parseFloat(salesPrice1) || 0,
                        productId: product.id
                    },
                    {
                        day: 2,
                        procurementQty: parseInt(procQty2) || 0,
                        procurementPrice: parseFloat(procPrice2) || 0,
                        salesQty: parseInt(salesQty2) || 0,
                        salesPrice: parseFloat(salesPrice2) || 0,
                        productId: product.id
                    },
                    {
                        day: 3,
                        procurementQty: parseInt(procQty3) || 0,
                        procurementPrice: parseFloat(procPrice3) || 0,
                        salesQty: parseInt(salesQty3) || 0,
                        salesPrice: parseFloat(salesPrice3) || 0,
                        productId: product.id
                    }
                ];

                await tx.dailyData.createMany({
                    data: dailyDataEntries
                });

                createdProducts.push({
                    id: product.id,
                    productId: product.productId,
                    productName: product.productName
                });
            }

            return createdProducts;
        });

        console.log(`Successfully processed ${result.length} products for user ${session.username}`);

        return NextResponse.json({
            success: true,
            message: `Successfully processed ${result.length} products`,
            data: result
        });

    } catch (error) {
        console.error('Upload processing error:', error);
        return NextResponse.json(
            { error: 'Failed to process file. Please check the format and try again.' },
            { status: 500 }
        );
    }
}
