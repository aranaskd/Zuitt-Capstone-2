const { errorHandler } = require('../auth');

// [SECTION] IMPORT MODELS
const Product = require('../models/Product');

// [SECTION] CREATE PRODUCT
module.exports.createProduct = (req, res) => {
    const { name, description, price } = req.body;

    if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Non-Admin users is forbidden.' });
    }

    return Product.findOne({ name })
        .then(existingProduct => {
            if (existingProduct) {
                return res.status(409).json({ message: 'Product Already Exists' });
            }

            const newProduct = new Product({ name, description, price });
            return newProduct.save();
        })
        .then(product => res.status(201).json(product))
        .catch(error => errorHandler(error, req, res));
};

// [SECTION] RETRIEVE ALL PRODUCTS
module.exports.retrieveAllProduct = (req, res) => {

    if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Non-Admin users is forbidden.' });
    }

    return Product.find({})
        .then(products => {
            if (products.length > 0) {
                return res.status(200).json(products);
            }
            return res.status(404).json({ message: 'No Products Found' });
        })
        .catch(error => errorHandler(error, req, res));
};

// [SECTION] RETRIEVE ALL ACTIVE PRODUCTS
module.exports.retrieveAllActiveProduct = (req, res) => {
    return Product.find({ isActive: true })
        .then(products => {
            if (products.length > 0) {
                return res.status(200).json(products);
            }
            return res.status(404).json({ message: 'No active products found' });
        })
        .catch(error => errorHandler(error, req, res));
};

// [SECTION] RETRIEVE SINGLE PRODUCT
module.exports.retrieveSingleProduct = (req, res) => {
    const { productId } = req.params;

    return Product.findById(productId)
        .then(product => {
            if (product) {
                return res.status(200).json(product);
            }
            return res.status(404).json({ error: 'Product not found' });
        })
        .catch(error => errorHandler(error, req, res));
};

// [SECTION] UPDATE PRODUCT INFO
module.exports.updateProductInfo = (req, res) => {
    const { productId } = req.params;
    const { name, description, price } = req.body;

    const updatedProduct = { name, description, price };

    if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Non-Admin users is forbidden.' });
    }

    return Product.findByIdAndUpdate(productId, updatedProduct, { new: true, runValidators: true })
        .then(product => {
            if (product) {
                return res.status(200).json({ success: true, message: 'Product updated successfully' });
            }
            return res.status(404).json({ error: 'Product not found' });
        })
        .catch(error => errorHandler(error, req, res));
};

// [SECTION] ARCHIVE PRODUCT
module.exports.archiveProduct = (req, res) => {
    const { productId } = req.params;
    const updateActiveField = { isActive: false };

    if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Non-Admin users is forbidden.' });
    }

    return Product.findByIdAndUpdate(productId, updateActiveField, { new: true })
        .then(archiveProduct => {
            if (!archiveProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }

            if (!archiveProduct.isActive) {
                return res.status(200).json({ message: 'Product already archived', archiveProduct });
            }

            return res.status(200).json({ success: true, message: 'Product archived successfully' });
        })
        .catch(error => errorHandler(error, req, res));
};

// [SECTION] ACTIVATE PRODUCT
module.exports.activateProduct = (req, res) => {
    const { productId } = req.params;
    const updateActiveField = { isActive: true };

    if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Non-Admin users is forbidden.' });
    }

    return Product.findByIdAndUpdate(productId, updateActiveField, { new: true })
        .then(activateProduct => {
            if (!activateProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }

            if (activateProduct.isActive) {
                return res.status(200).json({ message: 'Product already active', activateProduct });
            }

            return res.status(200).json({ success: true, message: 'Product activated successfully' });
        })
        .catch(error => errorHandler(error, req, res));
};

// [SECTION] SEARCH PRODUCTS BY NAME
module.exports.searchProductsByNames = (req, res) => {
    const { productName } = req.body;

    return Product.find({ name: { $regex: new RegExp(productName, 'i') } })
        .then(foundProducts => {
            if (foundProducts.length === 0) {
                return res.status(404).json({ error: 'No products found' });
            }
            return res.status(200).json(foundProducts);
        })
        .catch(err => errorHandler(err, req, res));
};

// [SECTION] SEARCH PRODUCTS BY PRICE RANGE
module.exports.searchProductsByPrice = (req, res) => {
    const { minPrice, maxPrice } = req.body;

    return Product.find({ price: { $gte: minPrice, $lte: maxPrice } })
        .then(products => {
            if (products.length === 0) {
                return res.status(404).json({ error: 'No products found in this price range' });
            }
            return res.status(200).json(products);
        })
        .catch(err => errorHandler(err, req, res));
};
