import DudaProduct from "../interfaces/DudaProduct";
import { getEndpointUrl, getRequestHeaders } from "./DudaClientHelpers"

export interface DudaProductService {
    getDudaProductById: (productId: string) => Promise<DudaProduct>
}

export const dudaProductService: DudaProductService = {
    getDudaProductById: async (productId: string) => {
        var request = new Request(getEndpointUrl(`/ecommerce/products/${productId}`), {
            method: 'GET',
            headers: getRequestHeaders() 
        });

        const response = await fetch(request);
        const product: DudaProduct = await response.json();

        return product;
    }
}