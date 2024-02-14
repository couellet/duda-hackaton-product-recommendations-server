import Product from "../interfaces/Product";
import { getEndpointUrl, getRequestHeaders } from "./DudaClientHelpers"

export interface ProductService {
    getProductById: (productId: string) => Promise<Product>
}

export const productClient: ProductService = {
    getProductById: async (productId: string) => {
        var request = new Request(getEndpointUrl(`/ecommerce/products/${productId}`), {
            method: 'GET',
            headers: getRequestHeaders() 
        });

        const response = await fetch(request);
        const product: Product = await response.json();

        return product;
    }
}