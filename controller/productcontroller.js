import NodeCache from "node-cache";
const cache = new NodeCache({ stdTTL: 300 });
export const productcontroller=async (req, res) => {
    const { categoryname } = req.params;
    const { n = 10, page = 1, sort = 'price', order = 'asc' } = req.query;
    const cacheKey = `${categoryname}_${n}_${page}_${sort}_${order}`;
    
    if (cache.has(cacheKey)) {
        return res.json(cache.get(cacheKey));
    }

    try {
        let products = await fetchDataFromCompanies(categoryname);
        
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
const productidcontroller=async (req, res) => {
    const { categoryname, productid } = req.params;
    const [company, id] = productid.split('_');

    const cacheKey = `product_${categoryname}_${productid}`;
    if (cache.has(cacheKey)) {
        return res.json(cache.get(cacheKey));
    }

    try {
        const companyAPI = ecommerceAPIs.find(api => api.includes(company));
        const response = await axios.get(`${companyAPI}/${id}`);
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
}