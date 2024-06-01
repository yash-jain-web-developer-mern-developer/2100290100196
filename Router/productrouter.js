import express from "express";
const router=express.Router();
router.get("/products",productcontroller);
router.get("/products/:productid",productidcontroller);
 export default router;