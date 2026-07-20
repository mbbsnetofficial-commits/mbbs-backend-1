const app = require('./app');
const port = process.env.PORT || 3000;

const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config({
     path: './config.env'
})

// const dns = require('dns');
// const { type } = require('express/lib/response');
// dns.setServers(['8.8.8.8', '8.8.4.4']);

const connndectionString = process.env.CONNECTION_STRING ;

mongoose.connect(connndectionString)
.then(()=>{
    console.log("Database connected successfully");
})
.catch((err)=>{
    console.log("Database connection failed",err);
})


app.listen(port,"localhost",()=>{
     console.log(`server is started at port ${port}`);
})