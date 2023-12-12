const express = require("express");
var cors= require("cors");
const app = express();
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.port || 5000;

app.use(cors({
  origin:[
  //  "http://localhost:5174",
  //  'https://stunning-zabaione-17bb92.netlify.app',
  //  "https://restaurant-management-28904.web.app",
  //  "https://restaurant-management-28904.firebaseapp.com"
  ],
  credentials:true
}));



app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m1npfxh.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const AllFoodItems = client
  .db("Restaurant_management")
  .collection("AllFoodItems");
const addFoodItem = client
  .db("Restaurant_management")
  .collection("addFoodItem");

  const allOrder = client.db("Restaurant_management").collection("AllOrder")
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    // AuthRelated API 
    // app.post("/jwt",async(req,res)=>{
    //   const user = req.body;
    //   console.log(user);
    // })


    // Pagination
    app.get('/itemsCount', async (req, res) => {
      const count = await AllFoodItems.estimatedDocumentCount();
      res.send({ count });
    })

      app.get('/allFood', async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);

     
      const result = await AllFoodItems.find()
      .skip(page * size)
      .limit(size)
      .toArray();
      res.send(result);
    })



    // app.get("/allFood", async (req, res) => {
    //   const result = await AllFoodItems.find().toArray();
    //   res.send(result);
    // });

    app.get("/singleItem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await AllFoodItems.find(query).toArray();
      res.send(result);
    });

  
    app.get("/topFood", async (req, res) => {
      const result = await AllFoodItems.find().limit(6).toArray();
      res.send(result);
    });

    app.post("/addItem", async (req, res) => {
      const item = req.body;
      const result = await addFoodItem.insertOne(item);
      const result2 = await AllFoodItems.insertOne(item);
      res.send(result);
    });

    app.get("/addItem", async (req, res) => {
      console.log(req.query.email);

      let query = {};
      if (req.query?.email) {
        query = { addedName: req.query.email };
      }
      const result = await addFoodItem.find(query).toArray();
      res.send(result);
    });

    // Order
    app.post("/order",async(req,res)=>{
      const orderData = req.body;
      const result = await allOrder.insertOne(orderData);
      res.send(result);
    })
    app.get("/order", async (req, res) => {
      console.log(req.query.email);

      let query = {};
      if (req.query?.email) {
        query = { buyerEmail: req.query.email };
      }
      const result = await allOrder.find(query).toArray();
      res.send(result);
    });

    // Delete 
    app.delete("/OrderItem/:id", async(req,res)=>{
      const id = req.params;
      const query = {_id: new ObjectId(id)}
      const result = await allOrder.deleteOne(query);
      res.send(result);
      
    })














    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Restaurant Management Server is Running");
});

app.listen(port, () => {
  console.log(`Restaurant Management Listing on Port : ${port}`);
});
