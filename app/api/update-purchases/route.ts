import { URL } from "url";
import { db } from "@vercel/postgres"
import { productPurchase } from "@/app/entities/ProductPurchase";
import { getEndpointUrl, getRequestHeaders } from "@/app/entities/DudaClientHelpers";
import DudaPagedResponse from "@/app/interfaces/DudaResponse";
import { Order } from "@/app/interfaces/Order";
import { setTimeout } from 'timers/promises';


export const dynamic = 'force-dynamic'; // static by default, unless reading the request

export async function GET(request: Request) {
  const siteAlias = new URLSearchParams(new URL(request.url).search).get('siteAlias');

  const limit = 50;
  let offset = 0;
  let totalResponses = 0;

  do {
    const dudaRequest = new Request(getEndpointUrl(`/ecommerce/orders?offset=${offset}&limit=${limit}`), {
      method: 'GET',
      headers: getRequestHeaders()
    });

    const responseJson: DudaPagedResponse<Order> = await (await fetch(dudaRequest)).json();

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

    await setTimeout(100);
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