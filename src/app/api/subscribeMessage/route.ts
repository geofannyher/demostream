import { NextApiResponse } from "next";
import amqp, { Message } from "amqplib";
import { NextResponse } from "next/server";

let connection: any;
let channel: any;

async function setupRabbitMQ() {
  if (!process.env.NEXT_RABBITMQ_URL) {
    throw new Error("RabbitMQ URL is not defined");
  }
  connection = await amqp.connect(process.env.NEXT_RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue("audio_queue3", { durable: true });
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
      async start(controller) {
        const processMessage = (msg: Message) => {
          if (msg !== null) {
            console.log("Received message:", msg.content.toString());
            controller.enqueue(
              encoder.encode("data: " + msg.content.toString() + "\n\n")
            );

            return new Promise((resolve) => {
              // Wait for audio to finish playing
              const audioElement = new Audio(
                URL.createObjectURL(new Blob([msg.content]))
              );
              audioElement.play();
              audioElement.onended = () => {
                channel.ack(msg);
                resolve();
              };
            });
          }
        };

        while (true) {
          const msg = await channel.get("audio_queue3", { noAck: false });
          if (msg) {
            await processMessage(msg);
          } else {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for 1 second before checking for new messages
          }
        }
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
