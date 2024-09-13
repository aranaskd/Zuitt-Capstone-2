const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors")
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");

require('dotenv').config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const corsOptions = {
	origin: ['http://localhost:3000'], // Allow requests from this origin (The client's URL) the origin is in Array form if there are multiple origins
	//methods: '*', //Allow only specified HTTP methods // optional only if you want to restrict the methods
	// allowedHeaders: ['Content-Type', 'Authorization'], // Allow only specified headers// optional only if you want to restrict the headers
	credentials: true,
	optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGO_STRING);
mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'));

//[SECTION] Backend Routes
app.use("/b3/users", userRoutes);
app.use("/b3/products", productRoutes);
app.use("/b3/cart", cartRoutes);
app.use("/b3/orders", orderRoutes);

//[SECTION] Server Gateway Response
if(require.main === module){
	app.listen(process.env.PORT || 3000, () => {
		console.log(`API is now online on port ${process.env.PORT || 3000 }`)
	});
}

module.exports = {app, mongoose};