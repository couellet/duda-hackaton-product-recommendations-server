CREATE TABLE Products (
    id SERIAL PRIMARY KEY,
    product_id varchar(50) NOT NULL,
    category_title varchar(1000) NULL,
    product_title varchar(1000) NULL,
    product_description text NULL
)