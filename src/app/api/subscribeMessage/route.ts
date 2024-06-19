import { NextApiResponse } from "next";
import amqp, { Message } from "amqplib";
import { NextResponse } from "next/server";

let connection: amqp.Connection;
let channel: amqp.Channel;

async function setupRabbitMQ() {
  if (!process.env.NEXT_RABBITMQ_URL) {
    throw new Error("RabbitMQ URL is not defined");
  }
  connection = await amqp.connect(process.env.NEXT_RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue("audio_queue10", { durable: true });
  channel.prefetch(1); // Ensure only one message is processed at a time
  console.log("RabbitMQ setup completed");
}

async function consumeMessages(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  if (!connection || !channel) {
    await setupRabbitMQ();
  }

  channel.consume(
    "audio_queue10",
    (msg: Message | null) => {
      if (msg !== null) {
        const messageContent = msg.content.toString();
        console.log("Received message:", messageContent);
        controller.enqueue(encoder.encode("data: " + messageContent + "\n\n"));

        const audioElement = new Audio(messageContent);
        audioElement.play().catch((error) => {
          console.error("Error playing audio:", error);
        });

        audioElement.onended = () => {
          console.log("Audio finished playing, acknowledging message");
          channel.ack(msg);
        };
      } else {
        console.log("Received null message");
      }
    },
    { noAck: false }
  );
}

export const runtime = "nodejs";
// This is required to enable streaming
export const dynamic = "force-dynamic";

export async function GET(req: Request, res: NextApiResponse) {
  const encoder = new TextEncoder();
  try {
    if (!connection || !channel) {
      await setupRabbitMQ();
    }

    const stream = new ReadableStream({
      start(controller) {
        consumeMessages(controller, encoder).catch(console.error);
      },
    });

    console.log("SSE Connection opened");
    return new NextResponse(stream, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/event-stream; charset=utf-8",
        Connection: "keep-alive",
        "Cache-Control": "no-cache, no-transform",
        "Content-Encoding": "none",
      },
    });
  } catch (error) {
    console.error("Error subscribing to messages:", error);
    return NextResponse.json({
      success: false,
      message: "Error subscribing to messages",
    });
  }
}
