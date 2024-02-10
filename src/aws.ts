import { S3 } from "aws-sdk";
import { dir } from "console";
import fs from "fs";
import path from "path";
import { getAllFiles } from "./utils";
const s3 = new S3({
  accessKeyId: "57bb9a79735bc75e8cb4a481aadacee8",
  secretAccessKey:
    "d70e104fa239679cb6ee85c9785eaf0e3a6fcfa56197bad58b6506073092b768",
  endpoint: "https://1783b6098998d87c4500c4602dd62b05.r2.cloudflarestorage.com",
});

export async function downloadS3Folder(prefix: string) {
  console.log("prefix", prefix);
  const allFiles = await s3
    .listObjectsV2({
      Bucket: "vercel",
      Prefix: prefix,
    })
    .promise();
  console.log("allfiles", allFiles);
  const allPromises = allFiles.Contents?.map(({ Key }) => {
    console.log("key", Key);
    return (
      new Promise((resolve, reject) => {
        if (!Key) {
          console.log("nokey");
          reject("");
          return;
        }
        const finalOutputPath = path.join(__dirname, Key);
        const fileContent = fs.createWriteStream(finalOutputPath);
        const finalOutpudir = path.dirname(finalOutputPath);
        if (!fs.existsSync(finalOutpudir)) {
          fs.mkdirSync(finalOutpudir, { recursive: true });
        }
        s3.getObject({
          Bucket: "vercel",
          Key: Key,
        })
          .createReadStream()
          .pipe(fileContent)
          .on("finish", () => {
            console.log("downloaded");
            resolve("");
          });
      }) ?? []
    );
  }) as Promise<unknown>[];

  await Promise.all(allPromises?.filter((x) => x !== undefined));
}

export const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3
    .upload({
      Body: fileContent,
      Bucket: "vercel",
      Key: fileName,
    })
    .promise();

  console.log("response", response);
};
export const uploadDistFIle = async (id: string) => {
  const folderPath = path.join(__dirname, `output/${id}/dist`);
  const allDistFiles = getAllFiles(folderPath);
  allDistFiles.forEach((file) => {
    uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
  });
};
