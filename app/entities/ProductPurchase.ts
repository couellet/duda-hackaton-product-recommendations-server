import { QueryResultRow, VercelPoolClient, sql } from "@vercel/postgres";
import { dudaProductService } from "./DudaProduct";
import DudaProduct from "../interfaces/DudaProduct";

export interface ProductPurchaseService {
    getByProductId: (productId: string) => Promise<ProductPurchase[]>;
    insert: (db: VercelPoolClient, productPurchase: ProductPurchase) => Promise<void>;
    exists: (orderId: string, productId: string) => Promise<boolean>;
    frequentlyPurchasedTogether: (productId: string) => Promise<DudaProduct[]>;
}

export const productPurchase: ProductPurchaseService = {
    getByProductId: async(productId: string) => {
        const results = await sql`SELECT * FROM product_purchases WHERE product_id=${productId}`;

        return results.rows.map<ProductPurchase>(row => mapProductPurchaseRowToProductPurchase(row));
    },
    frequentlyPurchasedTogether: async (productId: string) => {
        const results = await sql`
        select product_id, count(order_id) as occurences from product_purchases where order_id in (
            select distinct order_id from product_purchases where product_id=${productId}
        ) 
        and product_id != ${productId}
        group by product_id
        order by occurences desc
        limit 30`;

        const output: DudaProduct[] = [];

        for (const row of results.rows) {
            if (output.length >= 3 || parseInt(row['occurences']) <= 1) break;

            console.log('Row score is', row['occurences'])

            const product = await dudaProductService.getDudaProductById(row['product_id']);

            if (product.status === 'ACTIVE')
                output.push(product);
        }
     
        return output;
    },
    exists: async (orderId: string, productInternalId: string) => {
        const result = await sql`SELECT * FROM product_purchases WHERE order_id=${orderId} AND internal_id=${productInternalId}`;
        return result.rowCount > 0;
    },
    insert: async (db: VercelPoolClient, productPurchase: ProductPurchase) => {

        const queryText = `
        INSERT INTO product_purchases (
            order_id,
            email,
            invoice_number,
            created,
            currency,
            product_id,
            internal_id,
            variation_id,
            name,
            total,
            quantity,
            unit_price,
            sku,
            image
        ) 
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `;

        await db.query(queryText, [
        productPurchase.orderId,
        productPurchase.email,
        productPurchase.invoiceNumber,
        productPurchase.created,
        productPurchase.currency,
        productPurchase.productId,
        productPurchase.productInternalId,
        productPurchase.variationId,
        productPurchase.name,
        productPurchase.total,
        productPurchase.quantity,
        productPurchase.unitPrice,
        productPurchase.sku,
        productPurchase.image
        ]);
    }
}

function mapProductPurchaseRowToProductPurchase(row: QueryResultRow) : ProductPurchase {
    return {
        productId: row['product_id'],
        orderId: row['order_id'],
        email: row['email'],
        invoiceNumber: row['invoice_number'],
        id: row['id'],
        created: row['created'],
        currency: row['currency'],
        productInternalId: row['internal_id'],
        variationId: row['variation_id'],
        name: row['name'],
        total: parseFloat(row['total']),
        quantity: row['quantity'],
        unitPrice: parseFloat(row['unit_price']),
        sku: row['sku'],
        image: row['image']
    };
}

export interface ProductPurchase {
    id?: string;
    orderId: string;
    email: string;
    invoiceNumber: string;
    created: string;
    currency: string;
    productId: string;
    productInternalId: string;
    variationId: string;
    name: string;
    total: number;
    quantity: number;
    unitPrice: number;
    sku: string;
    image: string;
}

