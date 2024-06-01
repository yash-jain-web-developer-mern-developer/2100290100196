import NodeCache from "node-cache";
import axios from "axios";
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
export const productmaincontroller=async (req, res) => {
    const { categoryname } = req.params;
    const { n = 10, page = 1, minPrice = 0, maxPrice = Infinity, sort = 'price', order = 'asc' } = req.query;

    if (!categories.includes(categoryname)) {
        return res.status(400).json({ error: 'Invalid category' });
    }

    const top = Math.max(n, 10); // Ensure we fetch at least 10 products per company to cover the pagination requirement
    const cacheKey = `${categoryname}_${n}_${page}_${minPrice}_${maxPrice}_${sort}_${order}`;
    
    if (cache.has(cacheKey)) {
        return res.json(cache.get(cacheKey));
    }

    try {
        let products = await fetchDataFromCompanies(categoryname, minPrice, maxPrice, top);
        
        // Sort products based on query parameters
        products.sort((a, b) => {
            if (sort === 'price') {
                return order === 'asc' ? a.price - b.price : b.price - a.price;
            } else if (sort === 'rating') {
                return order === 'asc' ? a.rating - b.rating : b.rating - a.rating;
            } else if (sort === 'discount') {
                return order === 'asc' ? a.discount - b.discount : b.discount - a.discount;
            } else if (sort === 'company') {
                return order === 'asc' ? a.company.localeCompare(b.company) : b.company.localeCompare(a.company);
            }
        });

        // Paginate results
        const startIndex = (page - 1) * n;
        const endIndex = startIndex + parseInt(n);
        const paginatedProducts = products.slice(startIndex, endIndex);

        // Add custom unique identifier
        const response = paginatedProducts.map((product, index) => ({
            ...product,
            id: generateProductID(product, startIndex + index)
        }));

        // Cache the response
        cache.set(cacheKey, response);

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
}
export const productidcontroller=async (req, res) => async (req, res) => {
    const { categoryname, productid } = req.params;
    const [company, id] = productid.split('_');

    if (!companies.includes(company)) {
        return res.status(400).json({ error: 'Invalid company' });
    }

    const cacheKey = `product_${categoryname}_${productid}`;
    if (cache.has(cacheKey)) {
        return res.json(cache.get(cacheKey));
    }

    try {
        const url = `${testServerBaseUrl}/companies/${company}/categories/${categoryname}/products/${id}`;
        const response = await axios.get(url);
        const product = response.data;

        const responseData = {
            ...product,
            id: productid
        };

        // Cache the response
        cache.set(cacheKey, responseData);

        res.json(responseData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product details' });
    }
};