import { NextApiRequest, NextApiResponse } from "next";
import amqp, { Message } from "amqplib";

const RABBITMQ_URL =
  "amqps://lvqhizkj:wlODxXijHupv4JbrB90ivkLrLlJjRorI@octopus.rmq3.cloudamqp.com/lvqhizkj";

let connection: amqp.Connection | any = null;
let channel: amqp.Channel | any = null;

async function setupRabbitMQ() {
  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue("audio_queue", { durable: false });
}

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.status(200).end();

    try {
      if (!connection || !channel) {
        await setupRabbitMQ();
      }

      channel.consume(
        "audio_queue",
        (msg: Message | null) => {
          if (msg !== null) {
            console.log("Received message:", msg.content.toString());
            res.write(`data: ${msg.content.toString()}\n\n`);
            channel.ack(msg);
          }
        },
        { noAck: false }
      );

      req.on("close", () => {
        console.log("Client disconnected");
      });
    } catch (error) {
      console.error("Error subscribing to messages:", error);
      res
        .status(500)
        .json({ success: false, message: "Error subscribing to messages" });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
