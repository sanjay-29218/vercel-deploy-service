import { response } from "express";
import { commandOptions, createClient } from "redis";
import { downloadS3Folder, uploadDistFIle } from "./aws";
import { buildProject } from "./utils";
const subscriber = createClient();

const publisher = createClient();
publisher.connect();
subscriber.on("error", (err) => console.log("Redis Client Error", err));

subscriber.connect();

async function main() {
  while (1) {
    const response = await subscriber.brPop(
      commandOptions({ isolated: true }),
      "build-queue",
      0
    );

    const id = response?.element;
    await downloadS3Folder(`output/${id}`);
    await buildProject(id || "");
    await uploadDistFIle(id || "");

    publisher.hSet("status", id || "", "uploaded");

    console.log("response", response);
  }
}
main();
