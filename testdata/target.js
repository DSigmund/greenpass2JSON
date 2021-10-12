const express = require('express')
const http = require('http')
const bodyParser = require("body-parser");

let app = express()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/', (req, res) => {
  console.log(req.body)
  res.sendStatus(200)
})

let server = http.createServer(app)

server.listen(9999)
console.log('target running on 9999')