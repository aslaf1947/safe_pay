var express = require('express');
var cors = require('cors');
const dotenv = require('dotenv');
var bodyParser = require('body-parser');
var app = express();
dotenv.config();
var session = require('express-session')
var fileUpload = require('express-fileupload');
const database = require('./config/database');
var formRouter = require('./routes/form.routes');

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded())

app.use(express.static('asset'))
app.use(bodyParser.json())
app.use(fileUpload())
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}))
database()
app.use('/safepay',formRouter)
app.listen(4000)