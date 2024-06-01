import express from "express"
import axios from "axios";
import NodeCache from "node-cache";
import productrouter from "./Router/productrouter.js"
const app = express();
const port = 3000;

const cache = new NodeCache({ stdTTL: 300 });

// Companies and categories
const companies = ["AMZ", "FLP", "SNP", "MYN", "AZO"];
const categories = ["Phone", "Computer", "TV", "Earphone", "Tablet", "Charger", "Mouse", "Keypad", "Bluetooth", "Pendrive", "Remote", "Speaker", "Headset", "Laptop", "PC"];

// Test Server Base URL
const testServerBaseUrl = 'http://20.244.56.144/test';


// Utility function to fetch data from a company
const fetchCompanyData = async (company, category, minPrice, maxPrice, top) => {
    try {
        const url = `${testServerBaseUrl}/companies/${company}/categories/${category}/products?top=${top}&minPrice=${minPrice}&maxPrice=${maxPrice}`;
        const response = await axios.get(url);
        return response.data.map(product => ({ ...product, company }));
    } catch (error) {
        console.error(`Failed to fetch data from ${company}`, error);
        return [];
    }
};

// Utility function to fetch data from all companies
const fetchDataFromCompanies = async (category, minPrice, maxPrice, top) => {
    const requests = companies.map(company => fetchCompanyData(company, category, minPrice, maxPrice, top));
    const responses = await Promise.all(requests);
    return responses.flat();
};



// Generate a custom unique identifier for each product
const generateProductID = (product, index) => `${product.company}_${product.id}_${index}`;

app.use("/categories/:categoryname",productrouter);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});