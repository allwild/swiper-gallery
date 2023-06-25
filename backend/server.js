const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const fileUpload = require("express-fileupload");
const fs = require("fs");
const port = 8001;
let id = 0;
const imagesDirectory = path.join(`${__dirname}/data/img`);
const imageExtensions = [".jpg", ".jpeg", ".png", ".gif"];

app.use(fileUpload());
app.use("/public", express.static(`${__dirname}/../frontend/public`));
app.use(express.static(`${__dirname}/data/img`));
app.use(bodyParser.json());

app.post("/upload", (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  const imageFile = req.files.image;
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  imageFile.name = `${new Date(now - timezoneOffset)
    .toISOString()
    .replace("T", "_")
    .replace(/\..+/, "")}.jpg`;
  const fileName = imageFile.name;
  // Use the mv() method to move the file to the relative path
  const path = `${__dirname}/data/img/${fileName}`;
  imageFile.mv(path, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(`${fileName}`);
  });
});

app.post("/upload-data", (req, res) => {
  fs.readFile(`${__dirname}/data/json/new.json`, "utf8", (err, data) => {
    if (err) {
      throw err;
    }
    const galleryData = JSON.parse(data);
    galleryData.push(JSON.parse(JSON.stringify(req.body))[0]);

    fs.writeFile(
      `${__dirname}/data/json/new.json`,
      JSON.stringify(galleryData, null, 4),
      (err) => {
        if (err) console.log(data, err);
        else {
          res.send("File written successfully\n");
        }
      }
    );
  });
});


app.get("/", (req, res) => {
  res.sendFile(path.join(`${__dirname}/../frontend/index.html`));
});


app.get("/getpics", (req, res) => {
  res.sendFile(`${__dirname}/data/json/new.json`, function (err) {
    if (err) {
      res.send(err);
    } else {
      console.log("Sent:", `${__dirname}/data/json/new.json`);
    }
  });
});


app.delete("/delete/:imageName", (req, res) => {
  const imageName = req.params.imageName;


  // Removes element from the array of img details 
  fs.readFile(`${__dirname}/data/json/new.json`, "utf-8", (err, data) => {
    const allImgDetails = JSON.parse(data) 
    for (let i = 0; i < allImgDetails.length; i++) {
      if (allImgDetails[i].url === imageName) {
        allImgDetails.splice(i, 1)
      }
    }
    

    // Writes back array without the removed element
    fs.writeFile(
      `${__dirname}/data/json/new.json`,
      JSON.stringify(allImgDetails, null, 4),
      (err) => {
        if (err) console.log(data, err);
        /* else {
          res.send("File written successfully\n");
        } */
      }
    );
  });


  // Deletes corresponding image from 'img' directory
  fs.unlink(`${__dirname}/data/img/${imageName}`, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Server error");
    } else {
      console.log(`Deleted file ${imageName}`);
      res.sendStatus(204);
    }
  });
});


app.listen(port, () => {
  console.log(`http://127.0.0.1:${port}`);
});
