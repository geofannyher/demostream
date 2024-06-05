import { NextApiRequest, NextApiResponse } from "next"
import amqp, { Message } from "amqplib"
import { NextResponse } from "next/server"

const RABBITMQ_URL = "amqps://lvqhizkj:wlODxXijHupv4JbrB90ivkLrLlJjRorI@octopus.rmq3.cloudamqp.com/lvqhizkj"

let connection: amqp.Connection | any = null
let channel: amqp.Channel | any = null

async function setupRabbitMQ() {
  connection = await amqp.connect(RABBITMQ_URL)
  channel = await connection.createChannel()
  await channel.assertQueue("audio_queue", { durable: false })
}

export const runtime = "nodejs"
// This is required to enable streaming
export const dynamic = "force-dynamic"

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const encoder = new TextEncoder()
  try {
    if (!connection || !channel) {
      await setupRabbitMQ()
    }

    const stream = new ReadableStream({
      start(controller) {
        // Subscribe to Redis updates for the key: "posts"
        // In case of any error, just log it
        channel.consume(
          "audio_queue",
          (msg: Message | null) => {
            if (msg !== null) {
              console.log("Received message:", msg.content.toString())
              controller.enqueue(encoder.encode("data: " + msg.content.toString() + "\n\n"))
              channel.ack(msg)
            }
          },
          { noAck: false },
        )
      },
    })

    console.log("SSE Connection opened")
    return new NextResponse(stream, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/event-stream; charset=utf-8",
        Connection: "keep-alive",
        "Cache-Control": "no-cache, no-transform",
        "Content-Encoding": "none",
      },
    })
  } catch (error) {
    console.error("Error subscribing to messages:", error)
    res.status(500).json({ success: false, message: "Error subscribing to messages" })
  }
}
