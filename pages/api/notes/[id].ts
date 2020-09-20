import { error } from "console";
import s3 from "../../../s3";

module.exports = (req, res) => {
  const { id } = req.query;
  s3.getObject({ Bucket: process.env.MyBucket, Key: id })
    .promise()
    .then((data) => {
      res.send(data.Body.toString("utf-8"));
    })
    .catch((e) => {
      console.error(e);
      res.send(`Note with ID ${id} does not exist`);
    });
};
