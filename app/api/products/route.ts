import { productService } from "@/app/entities/Product";

export const dynamic = 'force-dynamic'; // static by default, unless reading the request

export async function GET(request: Request) {
    const products = await productService.getAll();
    return Response.json(products);
}