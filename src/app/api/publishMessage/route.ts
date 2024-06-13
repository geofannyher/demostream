import { NextApiResponse } from "next";
import amqp from "amqplib";
import { NextResponse } from "next/server";

const RABBITMQ_URL: any = process.env.NEXT_RABBITMQ_URL;

let connection: any;
let channel: any;

async function getRabbitMQChannel() {
  if (!connection) {
    connection = await amqp.connect(RABBITMQ_URL);
  }
  if (!channel) {
    channel = await connection.createChannel();
    await channel.assertQueue("audio_queue3", { durable: true });
  }
  return channel;
}

export async function POST(req: Request, res: NextApiResponse) {
  if (req.method !== "POST") {
    return NextResponse.json({ success: false, message: "Method not allowed" });
  }

  const { message } = await req.json();
  if (typeof message !== "string" || message.trim() === "") {
    return NextResponse.json({ success: false, message: "Invalid message" });
  }

  try {
    const channel = await getRabbitMQChannel();
    channel.sendToQueue("audio_queue3", Buffer.from(message), {
      persistent: true,
    });
    return NextResponse.json({ success: true, message: "Message published" });
  } catch (error) {
    console.error("Error publishing message:", error);
    return NextResponse.json({
      success: false,
      message: "Error publishing message",
    });
  }
}
