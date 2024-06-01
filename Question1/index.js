import express from "express"
import productrouter from "./Router/productrouter.js"
const app = express();
const port = 3000;

app.use("/categories/:categoryname",productrouter);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});