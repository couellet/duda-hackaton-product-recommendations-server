export interface Order {
    email: string;
    id: string;
    invoice_number: string;
    items: OrderItem[];
    created: string;
    payment: {
      currency:string;
    }
  }

export interface OrderItem {
    product_id: string;
    id: string;
    variation_id: string;
    name: string;
    total: string;
    quantity: number;
    unit_price: string;
    sku: string;
    image: string;
  }