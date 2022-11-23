const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()

app.use(cors())
app.use(express.json())

const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.zscbcon.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoryCollection = client.db('secondSell').collection('categories');
        const sportsCategoryCollection = client.db('secondSell').collection('sportsCategory');

        app.get('/categories', async (req, res) => {
            const query = {}
            const categories = await categoryCollection.find(query).toArray();
            res.send(categories)
        });

        app.get('/categories/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id :ObjectId(id)}
            const categories = await categoryCollection.find(query).toArray();
            res.send(categories)
        });

        app.get('/scategories', async (req, res) => {
            const query = {};
            const sportscategories =await sportsCategoryCollection.find(query).toArray()
            res.send(sportscategories)

        })

    }
    finally {

    }
}
run().catch(err => console.log(err)
)



app.get('/', (req, res) => {
    res.send("Server Is Online Now")
})

app.listen(port);
