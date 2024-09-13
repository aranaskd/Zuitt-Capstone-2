const express = require('express');
const router = express.Router();
const productController = require('../controllers/product')
const { verify, verifyAdmin } = require('../auth')


//[SECTION] Create Product, Admin Access, POST Method
router.post("/", verify, verifyAdmin, productController.createProduct);

//[SECTION] Retrive All Products, Admin Access, GET Method
router.get("/all", verify, verifyAdmin, productController.retrieveAllProduct);

//[SECTION] Retrive All Active Products, All Access, GET Method
router.get("/active", productController.retrieveAllActiveProduct);

//[SECTION] Retrive Single Product, All Access, GET Method
router.get("/:productId", productController.retrieveSingleProduct);

//[SECTION] Update Product Details, Admin Access, PATCH Method
router.patch("/:productId/update", verify, verifyAdmin, productController.updateProductInfo);

//[SECTION] Archive Product, Admin Access, PATCH Method
router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);

//[SECTION] Activate Product, Admin Access, PATCH Method
router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);

//[SECTION] Add Search Products by their Names, All Access, POST Method
router.post("/search-by-name", productController.searchProductsByNames);

//[SECTION] Add Search Products by their Price Range, All Access, POST Method
router.post("/search-by-price", productController.searchProductsByPrice);

module.exports = router;