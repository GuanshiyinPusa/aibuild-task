import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sessionManager } from '@/lib/sessionManager';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
    try {
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

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        const dataRows = jsonData.slice(1);

        // Delete existing products for this user first (without transaction)
        console.log('Deleting existing products for user:', session.userId);
        await prisma.product.deleteMany({
            where: { userId: session.userId }
        });

        const createdProducts = [];

        // Process each row individually (without transaction)
        for (const row of dataRows) {
            if (!row || row.length === 0 || !row[0]) continue;

            try {
                const [
                    productId, productName, openingInventory,
                    procQty1, procPrice1, procQty2, procPrice2, procQty3, procPrice3,
                    salesQty1, salesPrice1, salesQty2, salesPrice2, salesQty3, salesPrice3
                ] = row;

                // Create product
                const product = await prisma.product.create({
                    data: {
                        productId: productId?.toString() || '',
                        productName: productName?.toString() || 'Unknown Product',
                        openingInventory: parseInt(openingInventory) || 0,
                        userId: session.userId
                    }
                });

                // Create daily data entries
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

                // Create daily data one by one to avoid transaction issues
                for (const dayEntry of dailyDataEntries) {
                    await prisma.dailyData.create({
                        data: dayEntry
                    });
                }

                createdProducts.push({
                    id: product.id,
                    productId: product.productId,
                    productName: product.productName
                });

                console.log(`Created product: ${product.productName}`);
            } catch (rowError) {
                console.error(`Error processing row:`, row, rowError);
                // Continue with next row instead of failing completely
            }
        }

        console.log(`Successfully processed ${createdProducts.length} products for user ${session.username}`);

        return NextResponse.json({
            success: true,
            message: `Successfully processed ${createdProducts.length} products`,
            data: createdProducts
        });

    } catch (error) {
        console.error('Upload processing error:', error);
        return NextResponse.json(
            { error: 'Failed to process file. Please check the format and try again.' },
            { status: 500 }
        );
    }
}
