const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const app = express()

app.use(cors())
app.use(express.json())

const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster1.zscbcon.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send("Unauthorised Uses")
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'Unauthorised Token' })
        }
        req.decoded = decoded;
        next()
    })

}

async function run() {
    try {
        const onlycategoryCollection = client.db('secondSell').collection('categories');

        const sportsCategoryCollection = client.db('secondSell').collection('sportsCategory');

        const categoryCollection = client.db('secondSell').collection('bikeCategory');

        const usersCollection = client.db('secondSell').collection('users');
        const bookingCollections = client.db('secondSell').collection('bookings');

        const reviewCollection = client.db('secondSell').collection('reviews')
        const blogCollections = client.db('secondSell').collection('blogs')

        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail }
            const user = await usersCollection.findOne(query);


            if (user.role !== 'admin') {
                return res.status(401).send({ message: " Forbidden Access" })
            }
            next()

        }

        app.get('/categories', async (req, res) => {
            const query = {}
            const categories = await categoryCollection.find(query).toArray();
            res.send(categories)
        });

        app.post('/categories', async (req, res) => {
            const productInfo = req.body;
            const result = await categoryCollection.insertOne(productInfo);
            res.send(result)
        })



        app.get('/product/:category', async (req, res) => {
            const filter = req.params.category;
            const query = { category: filter }
            const data = await categoryCollection.find(query).toArray()
            res.send(data);
        })

        app.get('/allcategories', async (req, res) => {
            const query = {}
            const categories = await onlycategoryCollection.find(query).toArray();
            res.send(categories)
        });

        // app.get('/scategories', async (req, res) => {
        //     const query = {};
        //     const sportscategories =await sportsCategoryCollection.find(query).toArray()
        //     res.send(sportscategories)

        // })


        app.get('/products/category', async (req, res) => {
            const filter = req.query.category
            const query = {
                category: filter
            }
            const data = await categoryCollection.find(query).toArray()
            // data.forEach(category => )
            console.log(data);

            res.send(data)
        })
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            console.log(user);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN)
                return res.send({ accessToken: token })

            }
            return res.status(403).send({ accessToken: " " })
        })

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray()
            console.log(users);
            res.send(users)
        })
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(filter);
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const info = req.body;
            const users = await usersCollection.insertOne(info)
            console.log(users);
            res.send(users)
        })

        //  Update User As Admin
        app.put('/admin/users/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })
        app.get('/admin/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            console.log(user);
            res.send({ isAdmin: user?.role === "admin" })
        });

        // Varification 
        app.put('/admin/sellers/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    varification: 'varified'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.get('/admin/sellers/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            console.log(user);
            res.send({ isVarified: user?.varification === "varified" })
        });


        app.get('/sellers/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            console.log(user);
            res.send({ isSeller: user?.role === "seller" })
        })

        app.get('/users/:role', async (req, res) => {
            const role = req.params.role
            const filter = { role: role }
            const result = await usersCollection.find(filter).toArray();
            console.log(result);
            res.send(result)

        })
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const result = await usersCollection.findOne(filter)
            res.send(result)
        })

        // MY Product
        app.get('/categories/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await categoryCollection.find(query).toArray()
            res.send(result)
        })

        //Book Product 
        app.post('/bookings', async (req, res) => {
            const productData = req.body;
            const result = await bookingCollections.insertOne(productData);
            res.send(result)
        })


        // Review Panel 
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })
        app.get('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.find(review).toArray()
            res.send(result)
        });

        app.post('/blog', async (req, res) => {
            const blog = req.body;
            const result = await blogCollections.insertOne(blog)
            res.send(result)
        });
        app.get('/blog', async(req,res)=> {
            const query = {};
            const blog = await blogCollections.find(query).toArray()
            res.send(blog)
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
