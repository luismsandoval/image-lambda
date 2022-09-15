// ****************** LAMBDA FUNCTION ****************** //

const AWS = require("aws-sdk");

const S3 = new AWS.S3();

exports.handler = async (event) => {
  let { bucket, object } = event.Records[0].s3;

  try {
    let payload = await S3.getObject({
      Bucket: bucket.name,
      Key: "images.json",
    }).promise();

    let stringifiedPayload = payload.Body.toString();

    let readPayload = JSON.parse(stringifiedPayload);
    let newPayload = readPayload.images;

    const newImageObject = {
      name: object.key,
      size: object.size,
    };

    const objectToPut = {
      images: newPayload,
    };

    if (objectToPut.images.some((i) => i.name == newImageObject.name)) {
      const indexOf = objectToPut.images.indexOf(
        objectToPut.images.find((i) => i.name == newImageObject.name)
      );
      objectToPut.images[indexOf] = newImageObject;
    } else {
      objectToPut.images.push(newImageObject);
    }

    await S3.putObject({
      Bucket: bucket.name,
      Key: "images.json",
      Body: JSON.stringify(objectToPut),
      ContentType: "application/json",
    }).promise();
  } catch (e) {
    console.log("ERROR:", e);
    if (e) {
      let payload = await S3.putObject({
        Bucket: bucket.name,
        Key: "images.json",
        Body: JSON.stringify({
          images: [{ name: object.key, size: object.size }],
        }),
        ContentType: "application/json",
      }).promise();

      const response = {
        statusCode: 200,
        body: JSON.stringify(payload),
      };
      return response;
    }
  }
};
