import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";

import { prisma } from "../lib/prisma";
import path from "node:path";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { pipeline } from "node:stream";
import { promisify } from "node:util";

const pump = promisify(pipeline);

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 25,
    },
  });

  app.post("/videos", async (request, reply) => {
    const data = await request.file();

    if (!data) {
      console.log(data);
      reply.code(400).send({ error: "Missing file input." });
      return;
    }
    const extension = path.extname(data.filename);
    if (extension !== ".mp3") {
      reply
        .code(400)
        .send({ error: "Invalid file type, please upload only MP3" });
      return;
    }
    const fileBaseName = path.basename(data.filename, extension);
    const fileUploadName = `${fileBaseName}-${Date.now()}${extension}`;

    const uploadDestination = path.resolve(
      __dirname,
      "..",
      "..",
      "tmp",
      fileUploadName
    );

    await pump(data.file, fs.createWriteStream(uploadDestination));

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDestination,
      },
    });

    return { video };
  });
}
