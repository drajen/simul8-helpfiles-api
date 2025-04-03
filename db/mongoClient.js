const { MongoClient } = require('mongodb');
const uri = require("../atlas_uri");

console.log(uri)

// Create a new MongoClient
const client = new MongoClient(uri);
const dbname = "HelpFilesDB";

let db;

//  Define the connectToDatabase function
const connectToDatabase = async () => {
    try {
        await client.connect();
        db = client.db(dbname);  
        console.log(`Connected to the ${dbname} database`);
    } catch (err) {
        console.error("Error connecting to the database:", err);
    }
};

// Define the main function
//const main = async () => {
 //   try {
 //       await connectToDatabase();
 //   } catch (err) {
//        console.error('Error connecting to the database: ${err}');
 //   } finally {
 //       await client.close();
 //   }
//};

const getDB = () => db;

module.exports = { connectToDatabase, getDB };
