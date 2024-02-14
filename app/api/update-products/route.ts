import { getEndpointUrl, getRequestHeaders } from "@/app/entities/DudaClientHelpers";
import DudaPagedResponse from "@/app/interfaces/DudaResponse";
import DudaProduct from "@/app/interfaces/DudaProduct";
import { productService } from "@/app/entities/Product";
import { db } from "@vercel/postgres";
import { stripHtml } from 'string-strip-html';

export const dynamic = 'force-dynamic'; // static by default, unless reading the request

export async function GET(req: Request) {
    let offset = 0;
    const limit = 5;
    let totalResponses = 0;


    const dbClient = await db.connect();

    do {
        console.log(`Fetching ${limit} products to import`);

        const request = new Request(getEndpointUrl(`/ecommerce/products?offset=${offset}&limit=${limit}`), {
            headers: getRequestHeaders()
        });

        const response = await fetch(request);

        const json: DudaPagedResponse<DudaProduct> = await response.json();

        totalResponses = json.total_responses;

        for (const product of json.results) {
            if (product.status !== 'ACTIVE') {
                continue;
            }

            const exists = await productService.exists(product.id);

            if (exists) {
                continue;
            }
            //this is where you should describe the product tell your website visitors what's special about it why they should have this and maybe provide any other bit of info you feel is important
            let description = stripHtml(product.description).result.replace(/[.,;:]/g, '').toLowerCase();

            if (description.startsWith('this is where you should describe the product')) {
                description = '';
            }

            const title = product.name.toLowerCase();
            const categoryTitle = product.categories.map(category => category.title.toLowerCase()).join(' ');

            await productService.insertProduct(dbClient, {
                id: product.id,
                title: title,
                categoryTitle: categoryTitle,
                description: description,
                words: `${title} ${description} ${categoryTitle}`
            });
        }

        offset += limit;
    } while (offset + limit <= totalResponses)

    return new Response("OK");
}

