const mongoose = require('mongoose');
const express = require('express');
const ejs = require('ejs');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const routes = require('./route_modules');
const app = express();
app.use(session({
    secret: 'flashmessage',
    saveUninitialized: true,
    resave: true
}));
app.use(flash());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(routes);
// userlogin


 .mongoose.connect('mongodb+srv://logan:logan%402000@inotebook-cluster.cflpmda.mongodb.net/developerDB?retryWrites=true&w=majority')
    .then(() => {
        console.log("connected");
        app.listen(process.env.PORT || 3000, () => {
            console.log("server is running");
        });
    })
    .catch((error) => { console.log(error) });

