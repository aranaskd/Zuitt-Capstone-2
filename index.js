require('dotenv').config(); // Load environment variables before other code
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
    origin: ['http://localhost:3000', 'http://zuitt-bootcamp-prod-443-7483-aranas.s3-website.us-east-1.amazonaws.com'], // Allow requests from this origin
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_STRING);
mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'));

// [SECTION] Backend Routes
app.use("/b3/users", userRoutes);
app.use("/b3/products", productRoutes);
app.use("/b3/cart", cartRoutes);
app.use("/b3/orders", orderRoutes);

// [SECTION] Server Gateway Response
if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`API is now online on port ${port}`);
    });
}

module.exports = { app, mongoose };