import { VercelPoolClient, sql } from "@vercel/postgres";

export interface ProductPurchaseService {
    insert: (db: VercelPoolClient, productPurchase: ProductPurchase) => Promise<void>;
    exists: (orderId: string, productId: string) => Promise<boolean>;
}

export const productPurchase: ProductPurchaseService = {
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

