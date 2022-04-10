const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRYPE_SECRET);

const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.od1ig.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("TheWhiteHall");
    const packagesCollection = database.collection("packages");
    const ordersCollection = database.collection("orders");
    const customerReviewCollection = database.collection("review");
    const userCollection = database.collection("user");
    const GalaryCollection = database.collection("galary");
    const bookCenterCollection = database.collection("bookCenter");

    // Get api
    app.get("/packages", async (req, res) => {
      const cursor = packagesCollection.find({});
      const packages = await cursor.toArray();
      res.send(packages);
    });
    // Get singel package
    app.get("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const package = await packagesCollection.findOne(query);
      res.json(package);
    });

    // POST Booking Center Info
    app.post("/bookCenter", async (req, res) => {
      const bookCenter = req.body;
      const result = await bookCenterCollection.insertOne(bookCenter);
      res.json(result);
    });

    // Get api for Booking Center
    app.get("/bookCenter", async (req, res) => {
      const cursor = bookCenterCollection.find({});
      const bookCenter = await cursor.toArray();
      res.send(bookCenter);
    });

    // Get singel Booking Center
    app.get("/bookCenter/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const bookCenter = await bookCenterCollection.findOne(query);
      res.json(bookCenter);
    });

    // make order
    app.post("/addOrders", async (req, res) => {
      const orders = req.body;
      delete orders._id;
      const result = await ordersCollection.insertOne(req.body);
      res.send(result);
    });

    // get my orders
    app.get("/myOrder/:email", async (req, res) => {
      const result = await ordersCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    // get all orders
    app.get("/allOrders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // cancel order

    app.delete("/cancelOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.json(result);
    });

    // add review
    app.post("/addSReview", async (req, res) => {
      const result = await customerReviewCollection.insertOne(req.body);
      res.send(result);
    });

    // get all review
    app.get("/review", async (req, res) => {
      const cursor = customerReviewCollection.find({});
      const review = await cursor.toArray();
      res.send(review);
    });

    // add user info
    app.post("/addUserInfo", async (req, res) => {
      const result = await userCollection.insertOne(req.body);
      res.send(result);
    });

    // POST packages
    app.post("/packages", async (req, res) => {
      const package = req.body;
      const result = await packagesCollection.insertOne(package);
      res.json(result);
    });

    // POST Galary imaage
    app.post("/galary", async (req, res) => {
      const galary = req.body;
      const result = await GalaryCollection.insertOne(galary);
      res.json(result);
    });

    // get all Galary
    app.get("/galary", async (req, res) => {
      const cursor = GalaryCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // Delete package

    app.delete("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await packagesCollection.deleteOne(query);
      res.json(result);
    });

    // Delete bookCenter Package

    app.delete("/bookCenter/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookCenterCollection.deleteOne(query);
      res.json(result);
    });

    // make a user admin
    app.put("/makeAdmin", async (req, res) => {
      const filter = { email: req.body.email };
      const result = await userCollection.find(filter).toArray();
      if (result) {
        const documents = await userCollection.updateOne(filter, {
          $set: { role: "admin" },
        });
      }
    });

    // check admin or not
    app.get("/checkAdmin/:email", async (req, res) => {
      const result = await userCollection
        .find({ email: req.params.email })
        .toArray();

      res.send(result);
    });



    // update cart Product by email
    app.put("/bookedService/:email", async (req, res) => {
      const email = req?.params?.email;
      const payment = req.body;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          payment: payment,
        },
      };
      const result = await ordersCollection.updateMany(filter, updateDoc);
      res.send(result);
    });

    // payment
    app.post("/create-payment-intent", async (req, res) => {
      const paymentInfo = req.body;
      console.log(paymentInfo.price);
      const amount = paymentInfo.price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // update order status

    app.put("/statusUpdate/:id", async (req, res) => {
      const filter = { _id: ObjectId(req.params.id) };

      const result = await ordersCollection.updateOne(filter, {
        $set: {
          status: req.body.status,
        },
      });
      res.send(result);
    });
  } finally {
    // await client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Server");
});

app.listen(port, () => {
  console.log("Running server is port", port);

});
