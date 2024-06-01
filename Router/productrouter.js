import express from "express";
import { productmaincontroller,productidcontroller } from "../controller/productcontroller.js";
const router=express.Router();
router.get("/products",productmaincontroller);
router.get("/products/:productid",productidcontroller);
 export default router;