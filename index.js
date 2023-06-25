const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

// if you want to change the port change here
const port = 3000;

app.get('/',function (req,res){
    res.json({'message':'Server connection successful!'});
});

app.listen(process.env.PORT || port, () => console.log('Server is running at port: '+ port + '/' + process.env.PORT));