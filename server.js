const path = require("path");
const express = require("express");
const PORT = process.env.PORT || 8080;
const app = express();

const DIST_DIR = path.join(__dirname, "dist");

//Serving the files on the dist folder
app.use(express.static(DIST_DIR));

//Send index.html when the user access the web
app.get("*", function (req, res) {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});

app.listen(PORT);

