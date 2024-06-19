import { NextApiResponse } from "next";
import amqp from "amqplib";
import { NextResponse } from "next/server";

const RABBITMQ_URL: any = process.env.NEXT_RABBITMQ_URL;

async function publishMessage(message: string) {
  const connection = await amqp.connect(RABBITMQ_URL);
  try {
    const channel = await connection.createChannel();
    await channel.assertQueue("audio_queue10", { durable: true });
    channel.sendToQueue("audio_queue10", Buffer.from(message), {
      persistent: true,
    });
    console.log("Message published to queue:", message);
    await channel.close();
  } finally {
    await connection.close();
  }
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
    await publishMessage(message);
    return NextResponse.json({ success: true, message: "Message published" });
  } catch (error) {
    console.error("Error publishing message:", error);
    return NextResponse.json({
      success: false,
      message: "Error publishing message",
    });
  }
}
