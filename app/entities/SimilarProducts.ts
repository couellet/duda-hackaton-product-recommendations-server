import { dudaProductService } from "./DudaProduct";

export const getSimilarProducts = async (productId: string) => {
    const url = process.env.RECOMMENTATIONS_API_URL;

    const request = new Request(`${url}?productid=${productId}`);

    const response = await fetch(request);
    const ids: string[] = await response.json();

    return await Promise.all(ids.slice(0, 3).map(async id => {
        return await dudaProductService.getDudaProductById(id);
    }));
}