const express = require('express');
const app = express();
const fs = require("fs");

app.get('/users', function (req, res) {
  fs.readFile( __dirname + "/" + "data.json", 'utf8', function (err, data) {
    console.log( data );
    res.end( data );
  });
})

const server = app.listen(8081, function () {

  console.log("Server listening at http://8081")

})