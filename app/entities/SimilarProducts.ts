import { dudaProductService } from "./DudaProduct";

export const getSimilarProducts = async (productId: string) => {
    const url = process.env.RECOMMENTATIONS_API_URL;

    const request = new Request(`${url}?productid=${productId}`);

    const response = await fetch(request);

    console.log(response.status);

    const ids: string[] = await response.json();

    return await Promise.all(ids.map(async id => {
        return await dudaProductService.getDudaProductById(id);
    }));
}