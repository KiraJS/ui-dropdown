const express = require('express');
const app = express();
const fs = require("fs");

app.get('/users', function (req, res) {
  fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
    res.end( data );
  });
})

const server = app.listen(3000, function () {

  console.log("Server listening at http://3000")

})