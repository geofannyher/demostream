import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { text } = await req.json();
  try {
    const result = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/xM0TBYBF0vSckov9kDQy",
      {
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.95,
          style: 0.15,
          use_speaker_boost: true,
        },
      },
      {
        headers: {
          accept: "audio/mpeg",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    const audioBuffer = Buffer.from(result.data, "binary");

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}

// import axios from "axios";
// import { NextResponse } from "next/server";
// import { v2 as cloudinary } from "cloudinary";
// import { Readable } from "stream";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export async function POST(req: Request) {
//   const { text } = await req.json();
//   try {
//     const result = await axios.post(
//       "https://api.elevenlabs.io/v1/text-to-speech/xM0TBYBF0vSckov9kDQy",
//       {
//         text: text,
//         model_id: "eleven_multilingual_v2",
//         voice_settings: {
//           stability: 0.4,
//           similarity_boost: 0.95,
//           style: 0.15,
//           use_speaker_boost: true,
//         },
//       },
//       {
//         headers: {
//           accept: "audio/mpeg",
//           "xi-api-key": process.env.ELEVENLABS_API_KEY,
//           "Content-Type": "application/json",
//         },
//         responseType: "arraybuffer",
//       }
//     );
//     // Upload audio ke Cloudinary
//     const cloudinaryUpload = await cloudinary.uploader.upload_stream(
//       { resource_type: "video", audio_codec: "none" },
//       (error, result) => {
//         if (error) {
//           console.error(error);
//           return NextResponse.json({ error: error.message });
//         }
//         console.log(result);
//         // Proses sukses
//         return NextResponse.json({ success: true, cloudinary_result: result });
//       }
//     );

//     // Mengonversi array buffer ke readable stream
//     const audioReadableStream = new Readable();
//     audioReadableStream.push(Buffer.from(result.data, "binary"));
//     audioReadableStream.push(null);

//     // Pipe audio buffer ke Cloudinary uploader
//     audioReadableStream.pipe(cloudinaryUpload);
//   } catch (error: any) {
//     return NextResponse.json({ error: error.message });
//   }
// }
