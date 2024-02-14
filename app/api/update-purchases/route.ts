import { URL } from "url";
import { db } from "@vercel/postgres"
import { productPurchase } from "@/app/entities/ProductPurchase";
import DudaResponse from "@/app/interfaces/DudaResponse";
import { Order } from "@/app/interfaces/Order";

export const dynamic = 'force-dynamic'; // static by default, unless reading the request

export async function GET(request: Request) {
  const siteAlias = new URLSearchParams(new URL(request.url).search).get('siteAlias');

  const authToken = btoa(`${process.env.DUDA_API_USERNAME!}:${process.env.DUDA_API_PASSWORD}`);

  const limit = 25;
  let offset = 0;
  let totalResponses = 0;

  do {
    const url = buildRequestUrl(
      siteAlias!,
      offset, 
      limit);

    const dudaRequest = new Request(url, {
      method: 'GET',
      headers: new Headers({
        Authorization: `Basic ${authToken}`,
        Accept: 'application/json'
      }),
    });

    const responseJson: DudaResponse<Order> = await (await fetch(dudaRequest)).json();

    totalResponses = responseJson.total_responses;

    if (offset === 0) {
      console.log(`${totalResponses} orders to process`);
    }

    const shouldExit = !await insertOrdersBatch(responseJson.results);

    if (responseJson.results.length <= 0 || shouldExit) {
      console.log('Exiting');
      break;
    }

    offset += limit;

  } while (offset + limit <= totalResponses);

  return new Response('OK');
}

async function insertOrdersBatch(orders: Order[]): Promise<boolean> {
  const client = await db.connect();

  const data = orders.flatMap(order => {
    return order.items.map(orderItem => {
      return {
      order: order,
      orderItem: orderItem
    }})
  });

  const operations = await Promise.all(data.map(async ({order, orderItem}) => {
    if (await productPurchase.exists(order.id, orderItem.id)) {
      console.log(`Record for product ${orderItem.id} on order ${order.id} exists`);
      return false;
    } else {
      await productPurchase.insert(client, {
        orderId: order.id,
        email: order.email,
        invoiceNumber: order.invoice_number,
        image: orderItem.image,
        name: orderItem.name,
        productId: orderItem.product_id,
        productInternalId:orderItem.id,
        variationId: orderItem.variation_id,
        created: order.created,
        currency: order.payment.currency,
        total: parseFloat(orderItem.total),
        quantity: orderItem.quantity,
        unitPrice: parseFloat(orderItem.unit_price),
        sku: orderItem.sku
      });
      console.log(`Inserted product ${orderItem.id} for order ${order.id}`)
      return true;
    }
  }));

  return operations.every(inserted => inserted);
}

function buildRequestUrl(siteAlias: string, offset: number, limit: number): string {
  return `${process.env.DUDA_API_URL!}/api/sites/multiscreen/${siteAlias}/ecommerce/orders?offset=${offset}&limit=${limit}`;
}
