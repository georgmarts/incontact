import { MongoClient } from 'mongodb'

// const URI = 'mongodb+srv://dimon:MDB12345678@cluster0.lztvnre.mongodb.net/?retryWrites=true&w=majority'
const URI = 'mongodb+srv://dimon:MDB12345678@cluster0.lztvnre.mongodb.net'

const options = {}

if (!URI) {
  throw new Error('Invalid environment variable: "MONGODB_URI"')
}

let client = new MongoClient(URI, options)
// let clientPromise: Promise<MongoClient>
let clientPromise

if (process.env.NODE_ENV !== 'production') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(URI, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  clientPromise = client.connect()
}

export default clientPromise