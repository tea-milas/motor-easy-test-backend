require("dotenv").config();
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const port = process.env.SERVER_PORT;
const connectionString =  process.env.CONNECTION_STRING;


app.get("/tyres", async (req, res) => {
    try {
        const { brand, title, size } = req.query;
        const mongo = await mongoClient.connect(connectionString, {useUnifiedTopology: true, ignoreUndefined: true});
        const tyresCollection = mongo.db("tyres_db").collection("tyres");
        const brandsCollection = mongo.db("tyres_db").collection("brands");
        const tyres = await tyresCollection.find({brand, title, size}).toArray();
        const brands = [];

        for (let i = 0; i < tyres.length; i++) {
            const brandId = tyres[i]["brand_id"];
            if(!brands.includes(brandId)) {
                const brand = await brandsCollection.findOne({_id: brandId});
                brands.push(brand);
                delete tyres[i]["brand_id"];
                tyres[i]["brand"] = brand;
            } else {
                tyres[i]["brand"] = brand;
            }
        }

        mongo.close();
        res.send(tyres);

    } catch (err) {
        console.error("Failed to fetch tyres ", err);
        res.status(500).send("Something went wrong");
    }
});

app.get("/brands", async (req, res) => {
    try {
        const { title} = req.query;
        const mongo = await mongoClient.connect(connectionString, {useUnifiedTopology: true, ignoreUndefined: true});
        const brandsCollection = mongo.db("tyres_db").collection("brands");
        const brands = await brandsCollection.find({title}).toArray();

        mongo.close();
        res.send(brands);

    } catch (err) {
        console.error("Failed to fetch brands ", err);
        res.status(500).send("Something went wrong");
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

 
