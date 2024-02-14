import { VercelPoolClient, sql } from "@vercel/postgres";
import { Product } from "../interfaces/Product";

interface ProductService {
    insertProduct: (db: VercelPoolClient, product: Product) => Promise<void>;
    exists: (productId: string) => Promise<boolean>;
    getAll: () => Promise<Product[]>;
}

export const productService: ProductService = {
    insertProduct: async (db: VercelPoolClient, product: Product) => {
        const queryText = `
        INSERT INTO Products (product_id, category_title, product_title, product_description, product_words)
        VALUES ($1, $2, $3, $4, $5)
        `;

        await db.query(queryText, [product.id, product.categoryTitle, product.title, product.description, product.words]);
    },
    getAll: async () => {
        const results = await sql`SELECT * FROM Products`;

        return results.rows.map(row => {
            return {
                title: row['product_title'],
                id: row['product_id'],
                categoryTitle: row['category_title'],
                description: row['product_description'],
                words: row['product_words']
            }
        });
    },
    exists: async (productId: string) => {
        const results = await sql`SELECT * FROM Products WHERE product_id=${productId}`;

        return results.rowCount > 0;
    }
}