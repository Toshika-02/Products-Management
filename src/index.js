const express = require("express");
const multer = require("multer");
const route = require("./route/route.js");
const mongoose  = require("mongoose");
const app = express();
let bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}))

app.use(multer().any());

mongoose
  .connect(
    "mongodb+srv://neesh:E8DNG8XaM4rrzJCV@cluster0.vlwog.mongodb.net/group54Database",
    {
      useNewUrlParser: true}
  )
  .then(() => console.log("Connected with MongoDB"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});