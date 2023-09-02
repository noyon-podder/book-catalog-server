const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// database connect

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tlsofwm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const booksCollection = client.db("book-catalog").collection("books");

    app.get("/books", async (req, res) => {
      const books = await booksCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
      res.send(books);
    });

    app.get("/books/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await booksCollection.findOne(filter);
      res.send(result);
    });

    app.post("/create_book", async (req, res) => {
      const data = req.body;
      const result = await booksCollection.insertOne(data);
      res.send(result);
    });

    app.patch("/update_book/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      console.log(updatedData);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          title: updatedData.title,
          author: updatedData.author,
          publicationDate: updatedData.publicationDate,
          genre: updatedData.genre,
          details: updatedData.details,
          // images: updatedData.images,
        },
      };
      const result = await booksCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/delete_book/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await booksCollection.deleteOne(filter);
      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("SERVER RUNNING SUCCESSFULLY");
});

app.listen(port, () => {
  console.log(`SERVER RUNNING PORT: `, port);
});
