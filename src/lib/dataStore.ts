// Simple in-memory data store (will be replaced with database later)
let uploadedProducts: any[] = [];

export const dataStore = {
    setProducts: (products: any[]) => {
        uploadedProducts = products;
    },

    getProducts: () => {
        return uploadedProducts;
    },

    hasData: () => {
        return uploadedProducts.length > 0;
    },

    clear: () => {
        uploadedProducts = [];
    }
};
