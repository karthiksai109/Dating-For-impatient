const express=require('express')
const mongoose=require('mongoose')
const route = require('./Routes/route')
const cors = require("cors");

const app=express()
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());



const dotenv = require("dotenv");
dotenv.config();
app.use(express.json())

mongoose.set('strictQuery',false)
mongoose.connect('mongodb+srv://group21Database:f8HsIED1oiOyc6yi@karthikcluster.b2ikjot.mongodb.net/dating-impatient'
    
).then(()=>console.log('MongoDb connected'))
.catch((err)=>console.log(err))

app.use('/',route)


app.listen(process.env.PORT || 5000,function(){
    console.log(`connected to port ${process.env.PORT || 5000}`)
})


