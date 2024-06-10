"use client";
import React, { useState } from "react";
import axios from "axios";
import { LoadingOutlined } from "@ant-design/icons";

const SubmitMessage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-black bg-gray-100 p-4">
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
    </div>
  );
};

export default SubmitMessage;
