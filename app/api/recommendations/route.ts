import { productPurchase } from "@/app/entities/ProductPurchase";
import { getSimilarProducts } from "@/app/entities/SimilarProducts";
import DudaProduct from "@/app/interfaces/DudaProduct";

export const dynamic = 'force-dynamic'; // static by default, unless reading the request

export interface RecommendationsResponse {
    recommendation_type: "similar" | "frequentlyBoughtTogether",
    results: DudaProduct[]
}

export async function GET(request: Request) {
  const productId = new URLSearchParams(new URL(request.url).search).get('productId');

  const response: RecommendationsResponse = {
    recommendation_type: "frequentlyBoughtTogether",
    results: []
  };

  const products = await productPurchase.frequentlyPurchasedTogether(productId!);

  response.results.push(...products);

  if (response.results.length < 3) {
    const similar = await getSimilarProducts(productId!);
    response.results.push(...similar.slice(0, 3 - response.results.length));
    response.recommendation_type = "similar";
  }

  return Response.json(response);
}