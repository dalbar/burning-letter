import s3 from "../../s3";
import { v4 as uuid } from "uuid";

module.exports = (req, res) => {
  if (!(req.body && req.body.note)) {
    res.status(400);
    res.send("Invalid Request");
  }

  const { note } = req.body;

  const noteId = uuid();
  s3.putObject({ Key: noteId, Body: note, Bucket: process.env.MyBucket })
    .promise()
    .then(() => {
      res.send(`Created note with ID ${noteId}`);
    });
};
