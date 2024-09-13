const { errorHandler } = require('../auth');

// [SECTION] IMPORT MODELS
const Product = require('../models/Product');

// [SECTION] CREATE PRODUCT
module.exports.createProduct = (req, res) => {

    let newProduct = new Product({
        name : req.body.name,
        description : req.body.description,
        price : req.body.price
    });

   
    return Product.findOne({ name: req.body.name })
    .then(existingProduct => {
        
        if (existingProduct) {
            return res.status(409).send({message: 'Product Already Exists'});
        } else{
            return newProduct.save()
            .then(product => res.status(201).send(product))
            .catch(error => errorHandler(error, req, res));
        }
    }).catch(error => errorHandler(error, req, res));
    
};

// [SECTION] RETRIVE ALL PRODUCT
module.exports.retrieveAllProduct = (req, res) => {
    return Product.find({})
    .then(products => {
     
        if(products.length > 0){
            return res.status(200).send(products);
        }
        else{
           
            return res.status(404).send({message: 'No Product Found'});
        }
    })
    .catch(error => errorHandler(error, req, res));

};

// [SECTION] RETRIVE ALL ACTIVE PRODUCT
module.exports.retrieveAllActiveProduct = (req, res) => {

    return Product.find({ isActive : true }).then(products => {
        if (products.length > 0){
           
            return res.status(200).send(products);
        }
        else {
            
            return res.status(200).send({ message: 'No active product found' });
        }
    }).catch(err => res.status(500).send(err));

};

// [SECTION] RETRIVE SINGLE PRODUCT
module.exports.retrieveSingleProduct = (req, res) => {

    return Product.findById(req.params.productId)
    .then(product => {
        if (product) { return res.status(200).send(product); }  
        return res.status(500).send({ error: 'Product not found' });
    })
    .catch(error => errorHandler(error, req, res)); 

};

// [SECTION] UPDATE PRODUCT INFO
module.exports.updateProductInfo = (req, res)=>{

    let updatedProduct = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    }

    return Product.findByIdAndUpdate(req.params.productId, updatedProduct)
    .then(product => {
        if (product) {
      
            return res.status(200).send({ success: true, message: 'Product updated successfully' });
        } else {
           
            return res.status(404).send({ error: 'Product not found' })
        }
    })
    .catch(error => errorHandler(error, req, res));
};

// [SECTION] ARCHIVE PRODUCT
module.exports.archiveProduct = (req, res) => {

    let updateActiveField = {
        isActive: false
    }

    return Product.findByIdAndUpdate(req.params.productId, updateActiveField, {new: true})
        .then(archiveProduct => {
            if (archiveProduct) {
                if (!archiveProduct.isActive) {
                    
                   return res.status(200).send({ 
                       message: 'Product already archived',
                       archiveProduct: archiveProduct
                       });
                } else {
                    return res.status(200).send({ 
                        success: true, 
                        message: 'Product archived successfully'
                    });
                }
            
            } else {
               return res.status(404).send({ error: 'Product not found' });
            }
        })
        .catch(error => errorHandler(error, req, res));
};

// [SECTION] ACTIVATE PRODUCT
module.exports.activateProduct = (req, res) => {

    let updateActiveField = {
        isActive: true
    }
    
    return Product.findByIdAndUpdate(req.params.productId, updateActiveField)
        .then(activateProduct => {
            
            if (activateProduct) {
              
                if (activateProduct.isActive) {
          
                   return res.status(200).send({ 
                       message: 'Product already active', 
                       activateProduct: activateProduct
                   });;
                }
            
                return res.status(200).send({
                        success: true,
                        message: 'Product activated successfully'
                    });
            } else {
    
                return res.status(404).send({ error: 'Product not found' });
            }
        })
        .catch(error => errorHandler(error, req, res));
};

//[SECTION] ADD SEARCH PRODUCT BY THEIR NAMES
module.exports.searchProductsByNames = (req, res) => {

    const { productName } = req.body;

    return Product.find({
        name: {  $regex: new RegExp(productName, 'i') }
    })
    .then(foundProducts => {
        if (foundProducts.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        console.log(foundProducts);
        res.json(foundProducts);
    })
    .catch(err => errorHandler(err, req, res));

};
  
//[SECTION] ADD SEARCH PRODUCT BY THEIR PRICE RANGE
module.exports.searchProductsByPrice = (req, res) => {

    const { minPrice, maxPrice } = req.body;

    return Product.find({
        price: { $gte: minPrice, $lte: maxPrice }
    })
    .then(product => {
        if(product.length === 0){
            return res.status(404).send({ error: 'Failed to Find' });
        } else {
            return res.status(200).send(product);
        }
    })
    .catch(err => errorHandler(err, req, res));

};
