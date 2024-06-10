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
      setLoading(false);
      setResponseMessage("Message cannot be empty");
      return;
    }

    try {
      setLoading(true);

      const result = await axios.post(
        "/api/audio",
        { text: message },
        { responseType: "arraybuffer" }
      );
      setStatus("processing audio...");
      const mainAudioBlob = new Blob([result?.data], {
        type: "audio/mpeg",
      });
      const url = URL.createObjectURL(mainAudioBlob);
      const response = await axios.post("/api/publishMessage", {
        message: url,
      });
      setStatus("Add to Queue...");

      setResponseMessage(response.data.message);
      setStatus("");
      setMessage("");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setStatus("");
      console.error("Error sending message:", error);
      setResponseMessage("Error sending message");
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
          <p className="mt-4 text-center">{responseMessage}</p>
        )}{" "}
      </div>
    </div>
  );
};

export default SubmitMessage;
