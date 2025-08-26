import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
    try {
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

        const processedProducts = dataRows
            .filter(row => row && row.length > 0 && row[0]) // Filter out empty rows
            .map((row, index) => {
                const [
                    productId, productName, openingInventory,
                    procQty1, procPrice1, procQty2, procPrice2, procQty3, procPrice3,
                    salesQty1, salesPrice1, salesQty2, salesPrice2, salesQty3, salesPrice3
                ] = row;

                // Create daily data array
                const dailyData = [
                    {
                        day: 1,
                        procurementQty: parseInt(procQty1) || 0,
                        procurementPrice: parseFloat(procPrice1) || 0,
                        salesQty: parseInt(salesQty1) || 0,
                        salesPrice: parseFloat(salesPrice1) || 0
                    },
                    {
                        day: 2,
                        procurementQty: parseInt(procQty2) || 0,
                        procurementPrice: parseFloat(procPrice2) || 0,
                        salesQty: parseInt(salesQty2) || 0,
                        salesPrice: parseFloat(salesPrice2) || 0
                    },
                    {
                        day: 3,
                        procurementQty: parseInt(procQty3) || 0,
                        procurementPrice: parseFloat(procPrice3) || 0,
                        salesQty: parseInt(salesQty3) || 0,
                        salesPrice: parseFloat(salesPrice3) || 0
                    }
                ];

                return {
                    id: (index + 1).toString(),
                    productId: productId?.toString() || '',
                    productName: productName?.toString() || 'Unknown Product',
                    openingInventory: parseInt(openingInventory) || 0,
                    dailyData
                };
            });

        // For now, we'll return the processed data
        // Later we'll save this to database
        return NextResponse.json({
            success: true,
            message: `Successfully processed ${processedProducts.length} products`,
            data: processedProducts
        });

    } catch (error) {
        console.error('Upload processing error:', error);
        return NextResponse.json(
            { error: 'Failed to process file. Please check the format and try again.' },
            { status: 500 }
        );
    }
}
