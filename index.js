import express from "express"
import axios from "axios";
import NodeCache from "node-cache";
import productrouter from "./Router/productrouter.js"
const app = express();
const port = 3000;

const cache = new NodeCache({ stdTTL: 300 });

// Mock API endpoints for e-commerce companies (replace with actual URLs)
const ecommerceAPIs = [
    'https://api.ecommerce1.com/products',
    'https://api.ecommerce2.com/products',
    'https://api.ecommerce3.com/products',
    'https://api.ecommerce4.com/products',
    'https://api.ecommerce5.com/products'
];
app.use("/categories/:categoryname",productrouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});