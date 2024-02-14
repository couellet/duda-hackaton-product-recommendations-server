export default interface Product {
    categories: [{
        id: string;
        order: number;
        title: string;
    }];
    custom_fields: [{
        id: string;
        value: string
    }];
    description: string;
    external_id: string;
    id: string;
    images: [{
        alt: string;
        url: string;
    }];
    managed_inventory: boolean;
    name: string;
    options: [{
        choices: [{
            id: string;
            value: string
        }],
        id: string;
        name: string
    }];
    prices: [{
        compare_at_price: string;
        currency: string;
        price: string;
    }];
    quantity: number;
    requires_shipping: boolean;
    seo: {
        description: string;
        product_url: string;
        title: string;
    }
    sku: string;
    status: string;
    stock_status: string;
    type: string;
    variations: [{
        external_id: string;
        id: string;
        images: [{
            alt: string;
            url: string;
        }];
        options: [{
            choice_id: string;
            choice_value: string;
            option_id: string;
            option_name: string;
        }];
        quantity: number;
        sku: string;
        status: string
        price_difference: string;
    }];
}