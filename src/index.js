let express = require('express')
let apiRoutes = require("./routes")
let bodyParser = require('body-parser')
let session = require('express-session')
let mongoose = require('mongoose')

var path = require('path')
let app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'assets')))
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: null }}))

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

let db_user = 'admin'
let db_pswd = 'admin'
let db_host = '127.0.0.1'
let db_port = '27017'

mongoose.connect('mongodb://'+db_user+':'+db_pswd+'@'+db_host+':'+db_port+'/bookmark_db');

var db = mongoose.connection

let port = 8000

let server = app.listen(port, function () {
	app.use('/', apiRoutes)
})