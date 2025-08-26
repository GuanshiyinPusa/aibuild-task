export const sampleProducts = [
    {
        id: '1',
        productId: '0000001',
        productName: 'CHERRY 1PACK',
        openingInventory: 117,
        dailyData: [
            { day: 1, procurementQty: 0, procurementPrice: 0, salesQty: 22, salesPrice: 5.98 },
            { day: 2, procurementQty: 21, procurementPrice: 13.72, salesQty: 12, salesPrice: 5.98 },
            { day: 3, procurementQty: 0, procurementPrice: 0, salesQty: 7, salesPrice: 4.98 }
        ]
    },
    {
        id: '2',
        productId: '0000002',
        productName: 'ENOKI MUSHROOM 360G',
        openingInventory: 1020,
        dailyData: [
            { day: 1, procurementQty: 750, procurementPrice: 3.2, salesQty: 157, salesPrice: 4.38 },
            { day: 2, procurementQty: 240, procurementPrice: 2.8, salesQty: 111, salesPrice: 4.38 },
            { day: 3, procurementQty: 192, procurementPrice: 3.6, salesQty: 95, salesPrice: 4.38 }
        ]
    },
    {
        id: '3',
        productId: '0000003',
        productName: 'JIN RAMEN HOT 5P',
        openingInventory: 23,
        dailyData: [
            { day: 1, procurementQty: 720, procurementPrice: 7, salesQty: 23, salesPrice: 9.98 },
            { day: 2, procurementQty: 0, procurementPrice: 7, salesQty: 20, salesPrice: 9.98 },
            { day: 3, procurementQty: 360, procurementPrice: 7.6, salesQty: 15, salesPrice: 9.98 }
        ]
    }
];

export const transformProductData = (product: any) => {
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
        ...product,
        chartData
    };
};
