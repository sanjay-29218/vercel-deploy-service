import path from "path";
import fs from "fs";
import { exec, spawn } from "child_process";
export async function buildProject(id: string) {
  // process
  return new Promise((resolve, reject) => {
    const child_process = exec(
      `cd ${path.join(
        __dirname,
        `output/${id}`
      )} && npm install && npm run build`
    );
    child_process.stdout?.on("data", (data) => console.log("stdout:" + data));
    child_process.stderr?.on("data", (data) => console.log("stderr:" + data));
    child_process.on("close", () => {
      resolve("");
    });
  });
}

export function getAllFiles(folderPath: string) {
  let response: string[] = [];
  const allFilesAndFolder = fs.readdirSync(folderPath);
  allFilesAndFolder.forEach((file) => {
    const filePath = path.join(folderPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      response = response.concat(getAllFiles(filePath));
    } else {
      response.push(filePath);
    }
  });
  return response;
}
