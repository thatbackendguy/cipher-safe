//importing libraries
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require("dotenv").config()
const cookieParser = require("cookie-parser");

//importing middlewares
const dbConnect = require('./config/dbConnect');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use('/api/user',userRoute)
app.use('/api/auth',authRoute)

app.use(notFound);
app.use(errorHandler);

dbConnect().then(()=>{
    app.listen(PORT, () => console.log('Server is running at port: '+ PORT));
});