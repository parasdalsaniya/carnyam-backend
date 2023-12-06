const AWS = require = {}("aws-sdk");
const {
  REACT_APP_AWS_BUCKET,
  REACT_APP_AWS_REGION,
  REACT_APP_ACCESS_ID,
  REACT_APP_SECRET_ACCESS_KEY,
} = process.env;

const uploadImageToS3 = async (file) => {
  try {
    AWS.config.update({
      credentials: new AWS.Credentials({
        accessKeyId: REACT_APP_ACCESS_ID,
        secretAccessKey: REACT_APP_SECRET_ACCESS_KEY,
      }),
      region: REACT_APP_AWS_REGION,
    });

    const S3 = new AWS.S3({
      apiVersion: "2006-03-01",
      params: { Bucket: REACT_APP_AWS_BUCKET },
    });

    const params = {
      Key: file.name,
      Body: file,
      ACL: "public-read",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
      },
    };

    const data = new Promise((resolve, reject) => {
      S3.upload(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.Location);
        }
      });
    });
    return data;
  } catch (error) {
    console.log("Error in uploadImageToS3: \n", error);
    throw error;
  }
};

module.exports = {
  uploadImageToS3
}
