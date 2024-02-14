import { productService } from "@/app/entities/Product";
import { productPurchase } from "@/app/entities/ProductPurchase";

export const dynamic = 'force-dynamic'; // static by default, unless reading the request

export async function GET(request: Request) {
  const productId = new URLSearchParams(new URL(request.url).search).get('productId');

  const products = await productPurchase.frequentlyPurchasedTogether(productId!);

  const allProducts = await productService.getAll();

  return Response.json(products);
}