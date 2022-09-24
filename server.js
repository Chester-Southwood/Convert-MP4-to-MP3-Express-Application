const express    = require("express"),
      ffmpeg     = require("fluent-ffmpeg"),
      fileUpload = require("express-fileupload")
      fs         = require('fs');
      
const app                 = express(),
      portNum             = 5000
      tempFilePath        = '/temp/'
      defaultTempFileName = 'renameMe.mp3';

app.use(fileUpload({
    useTempFiles:true,
    tempFileDir: tempFilePath
}));

ffmpeg.setFfmpegPath("./ffmpeg/bin/ffmpeg.exe");

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/mp4tomp3", (req, res) => {
    console.log("POST ENDPOINT '/mp4tomp3' was hit!");
    filePath = tempFilePath + req.files.mp4.name;
    downloadTempFile(req, filePath);
    convertDownloadAndDeleteTempFile(res, filePath);
});

app.listen(portNum, () => {
    console.log("Server is running on port " + portNum);
});

//Helper methods for post endpoint /mp4tomp3
function deleteFile(filePath) {
    try {
        fs.unlinkSync(filePath);
    } catch(err) {
        throw err;
    }
}

function downloadTempFile(req, filePath) {
    req.files.mp4.mv(filePath, (err) => {
        if(err) return res.sendStatus(500).send(err);
        else console.log("Successfully downloaded tmp mp4 file.")
    });
}

function convertDownloadAndDeleteTempFile(res, filePath) {
    res.contentType("video/mp3");
    res.attachment(defaultTempFileName);

    ffmpeg(filePath)
    .on("error", (error) => {
        console.log("Error converting to tmp: " + error);
    })
    .toFormat("mp3")
    .on("end", () => {
        console.log("Successfully converted mp4 file.");
        deleteFile(filePath);
        console.log("Successfully deleted tmp mp4 file.")
    })
    .on("error", (error) => {
        console.log(error);
    })
    .pipe(res, {end:true});
}