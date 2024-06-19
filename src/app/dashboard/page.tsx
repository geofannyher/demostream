"use client";
import React, { useState } from "react";
import axios from "axios";
import { LoadingOutlined } from "@ant-design/icons";
import { FiUploadCloud } from "react-icons/fi";
import { notification } from "antd";
const SubmitMessage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [api, context] = notification.useNotification();
  const [audio1, setAudio1] = useState(
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1718784391/videoStream/audio/pml8sun5agx8gpeghved.mp3"
  );
  const [audio2, setAudio2] = useState(
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1718784391/videoStream/audio/wmrifnbiv6bkx18gevy8.mp3"
  );
  const [audio3, setAudio3] = useState(
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1718784391/videoStream/audio/nqeypjuwbjdgntaphxdx.mp3"
  );
  const [audio4, setAudio4] = useState(
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1718784390/videoStream/audio/r8z0mrlr3hy8tafbczpt.mp3"
  );
  const [audio5, setAudio5] = useState(
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1718784390/videoStream/audio/vxvpbmvybfpdugudy51r.mp3"
  );
  const [audio6, setAudio6] = useState(
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1718784390/videoStream/audio/vyx4prmcqzrmypmdzqsv.mp3"
  );
  const [audio7, setAudio7] = useState(
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1718784390/videoStream/audio/j4dqpuafh4a3ivirqu9d.mp3"
  );
  const [audio8, setAudio8] = useState(
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1718784390/videoStream/audio/oaxgw9mgxwfqsbiazs2y.mp3"
  );
  const [audio9, setAudio9] = useState(
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1718784390/videoStream/audio/tlcg5szezfhn9crzkvv6.mp3"
  );
  const [audio10, setAudio10] = useState(
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1718784389/videoStream/audio/nayecgtshvtwnvroxroj.mp3"
  );
  const [audio11, setAudio11] = useState(
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1718784379/videoStream/audio/whsggxc11kbclsauyog0.mp3"
  );
  const [audio12, setAudio12] = useState(
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1718784379/videoStream/audio/vblfivwth45fj8y5jz2l.mp3"
  );
  const [audio13, setAudio13] = useState(
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1718784379/videoStream/audio/nc2o0cvv7izp338ratq2.mp3"
  );
  const [audio14, setAudio14] = useState(
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1718784379/videoStream/audio/hnsvhmuznll0nrgllogv.mp3"
  );
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  const handleSend = async () => {
    if (!message.trim()) {
      setResponseMessage("Message cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setStatus("Sending message...");
      const result = await axios.post(
        "/api/audio",
        { text: message },
        { responseType: "arraybuffer" }
      );

      if (result.status !== 200) {
        throw new Error("Failed to generate audio");
      }

      setStatus("Processing audio...");
      const mainAudioBlob = new Blob([result.data], {
        type: "audio/mpeg",
      });
      const formData = new FormData();
      formData.append("file", mainAudioBlob);
      formData.append("upload_preset", "rfc3rxgd");

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/dp8ita8x5/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status !== 200) {
        setResponseMessage("Failed to upload audio to Cloudinary");
      }

      setStatus("Publishing message...");
      const response = await axios.post("/api/publishMessage", {
        message: res.data.secure_url,
      });

      if (response.status !== 200) {
        setResponseMessage("Failed to publish message");
      }

      setResponseMessage("Message successfully sent and processed");
      setMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      setResponseMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  const handleSubmit = async (audio: string) => {
    try {
      const res = await axios.post("/api/publishMessage", {
        message: audio,
      });
      if (res.status !== 200) {
        return api.error({ message: "Failed to publish message" });
      }
      return api.success({
        message: "Message successfully sent and processed",
      });
    } catch (error) {
      return api.error({ message: "System error" });
    }
  };

  return (
    <>
      {context}
      <div className="min-h-screen flex flex-col items-center justify-center text-black bg-gray-200 p-4 space-y-2">
        <h1 className="text-2xl font-bold mb-4">Streaming Text to Speech</h1>
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Enter message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <button
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-900 transition duration-300 text-white p-2 rounded"
            onClick={handleSend}
          >
            {loading ? (
              <span>
                <LoadingOutlined style={{ marginRight: 8 }} />
                {status}
              </span>
            ) : (
              "Send Message"
            )}
          </button>
          {responseMessage && (
            <p
              className={`mt-4 text-center ${
                responseMessage.startsWith("Error")
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            >
              {responseMessage}
            </p>
          )}
        </div>
        <div className="w-full space-y-4">
          <div className="flex gap-2 flex-wrap justify-start">
            <div className="flex gap-2 flex-col lg:flex-row">
              {audio1 && (
                <audio controls>
                  <source src={audio1} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <button
                onClick={() => handleSubmit(audio1)}
                className="rounded-full w-full lg:w-1/3 flex justify-center gap-2 text-sm font-semibold  items-center bg-violet-600 hover:bg-violet-900 transition duration-300 text-white p-1 "
              >
                <FiUploadCloud /> Audio 1
              </button>
            </div>
            <div className="flex gap-2 flex-col lg:flex-row">
              {audio2 && (
                <audio controls>
                  <source src={audio2} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <button
                onClick={() => handleSubmit(audio2)}
                className="rounded-full w-full lg:w-1/3 flex justify-center gap-2 text-sm font-semibold  items-center bg-violet-600 hover:bg-violet-900 transition duration-300 text-white p-1 "
              >
                <FiUploadCloud /> Audio 2
              </button>
            </div>
            <div className="flex gap-2 flex-col lg:flex-row">
              {audio3 && (
                <audio controls>
                  <source src={audio3} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <button
                onClick={() => handleSubmit(audio3)}
                className="rounded-full w-full lg:w-1/3 flex justify-center gap-2 text-sm font-semibold  items-center bg-violet-600 hover:bg-violet-900 transition duration-300 text-white p-1 "
              >
                <FiUploadCloud /> Audio 3
              </button>
            </div>
            <div className="flex gap-2 flex-col lg:flex-row">
              {audio4 && (
                <audio controls>
                  <source src={audio4} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <button
                onClick={() => handleSubmit(audio4)}
                className="rounded-full w-full lg:w-1/3 flex justify-center gap-2 text-sm font-semibold  items-center bg-violet-600 hover:bg-violet-900 transition duration-300 text-white p-1 "
              >
                <FiUploadCloud /> Audio 4
              </button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-start">
            <div className="flex gap-2 flex-col lg:flex-row">
              {audio5 && (
                <audio controls>
                  <source src={audio5} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <button
                onClick={() => handleSubmit(audio5)}
                className="rounded-full w-full lg:w-1/3 flex justify-center gap-2 text-sm font-semibold  items-center bg-violet-600 hover:bg-violet-900 transition duration-300 text-white p-1 "
              >
                <FiUploadCloud /> Audio 5
              </button>
            </div>
            <div className="flex gap-2 flex-col lg:flex-row">
              {audio6 && (
                <audio controls>
                  <source src={audio6} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <button
                onClick={() => handleSubmit(audio6)}
                className="rounded-full w-full lg:w-1/3 flex justify-center gap-2 text-sm font-semibold  items-center bg-violet-600 hover:bg-violet-900 transition duration-300 text-white p-1 "
              >
                <FiUploadCloud /> Audio 6
              </button>
            </div>
            <div className="flex gap-2 flex-col lg:flex-row">
              {audio7 && (
                <audio controls>
                  <source src={audio7} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <button
                onClick={() => handleSubmit(audio7)}
                className="rounded-full w-full lg:w-1/3 flex justify-center gap-2 text-sm font-semibold  items-center bg-violet-600 hover:bg-violet-900 transition duration-300 text-white p-1 "
              >
                <FiUploadCloud /> Audio 7
              </button>
            </div>
            <div className="flex gap-2 flex-col lg:flex-row">
              {audio8 && (
                <audio controls>
                  <source src={audio8} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <button
                onClick={() => handleSubmit(audio8)}
                className="rounded-full w-full lg:w-1/3 flex justify-center gap-2 text-sm font-semibold  items-center bg-violet-600 hover:bg-violet-900 transition duration-300 text-white p-1 "
              >
                <FiUploadCloud /> Audio 8
              </button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-start">
            <div className="flex gap-2 flex-col lg:flex-row">
              {audio9 && (
                <audio controls>
                  <source src={audio9} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <button
                onClick={() => handleSubmit(audio9)}
                className="rounded-full w-full lg:w-1/3 flex justify-center gap-2 text-sm font-semibold  items-center bg-violet-600 hover:bg-violet-900 transition duration-300 text-white p-1 "
              >
                <FiUploadCloud /> Audio 9
              </button>
            </div>
            <div className="flex gap-2 flex-col lg:flex-row">
              {audio10 && (
                <audio controls>
                  <source src={audio10} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <button
                onClick={() => handleSubmit(audio10)}
                className="rounded-full w-full lg:w-1/3 flex justify-center gap-2 text-sm font-semibold  items-center bg-violet-600 hover:bg-violet-900 transition duration-300 text-white p-1 "
              >
                <FiUploadCloud /> Audio 10
              </button>
            </div>
            <div className="flex gap-2 flex-col lg:flex-row">
              {audio11 && (
                <audio controls>
                  <source src={audio11} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <button
                onClick={() => handleSubmit(audio11)}
                className="rounded-full w-full lg:w-1/3 flex justify-center gap-2 text-sm font-semibold  items-center bg-violet-600 hover:bg-violet-900 transition duration-300 text-white p-1 "
              >
                <FiUploadCloud /> Audio 11
              </button>
            </div>
            <div className="flex gap-2 flex-col lg:flex-row">
              {audio12 && (
                <audio controls>
                  <source src={audio12} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <button
                onClick={() => handleSubmit(audio12)}
                className="rounded-full w-full lg:w-1/3 flex justify-center gap-2 text-sm font-semibold  items-center bg-violet-600 hover:bg-violet-900 transition duration-300 text-white p-1 "
              >
                <FiUploadCloud /> Audio 12
              </button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-start">
            <div className="flex gap-2 flex-col lg:flex-row">
              {audio13 && (
                <audio controls>
                  <source src={audio13} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <button
                onClick={() => handleSubmit(audio13)}
                className="rounded-full w-full lg:w-1/3 flex justify-center gap-2 text-sm font-semibold  items-center bg-violet-600 hover:bg-violet-900 transition duration-300 text-white p-1 "
              >
                <FiUploadCloud /> Audio 13
              </button>
            </div>
            <div className="flex gap-2 flex-col lg:flex-row">
              {audio14 && (
                <audio controls>
                  <source src={audio14} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <button
                onClick={() => handleSubmit(audio14)}
                className="rounded-full w-full lg:w-1/3 flex justify-center gap-2 text-sm font-semibold  items-center bg-violet-600 hover:bg-violet-900 transition duration-300 text-white p-1 "
              >
                <FiUploadCloud /> Audio 14
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubmitMessage;
