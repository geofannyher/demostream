"use client";

import React, { useEffect, useRef, useState } from "react";
const PlayVideo: React.FC = () => {
  const video1 =
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1717647802/videoStream/ngedy7l9bog5zn4kjuay.mp4";
  const video2 =
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1717566427/videoStream/chslvojsihspxxxj80ur.mp4";
  // const [messages, setMessages] = useState<string[]>([]);
  const [currentVideo, setCurrentVideo] = useState(video1);
  // const [loadingText, setLoadingText] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  // const [status, setStatus] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  // const [inputText, setInputText] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  const connectToStream = () => {
    // Connect to /api/stream as the SSE API source
    const eventSource = new EventSource("/api/subscribeMessage");
    eventSource.addEventListener("message", (event) => {
      setAudioUrl(event.data);
      setCurrentVideo(video2);
      // setMessages((prevMessages) => [...prevMessages, event.data]);
    });
    // In case of any error, close the event source
    // So that it attempts to connect again
    eventSource.addEventListener("error", () => {
      eventSource.close();
      setTimeout(connectToStream, 1);
    });
    // As soon as SSE API source is closed, attempt to reconnect
    // @ts-ignore
    eventSource.onclose = () => {
      setTimeout(connectToStream, 1);
    };
    return eventSource;
  };
  useEffect(() => {
    const eventSource = connectToStream();
    return () => {
      console.log("CLOSED");
      eventSource.close();
    };
  }, []);

  const handleAudioEnded = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioUrl("");
    }
  };

  return (
    <div className="grid grid-cols-3 h-[100dvh]">
      {/* Video Component */}
      <div className="col-span-3 flex items-center justify-center bg-white h-full">
        <div
          style={{
            width: "calc(100dvh * 9 / 16)",
          }}
          className="relative  bg-white flex items-center justify-center"
        >
          <div className="flex h-full flex-col items-center justify-center">
            <div className="relative">
              {currentVideo && (
                <video
                  key={currentVideo}
                  autoPlay
                  loop
                  muted
                  // className={`transition-opacity duration-1000 ${
                  //   isLoading ? "opacity-0" : "opacity-100"
                  // }`}
                  onEnded={handleAudioEnded}
                >
                  <source src={currentVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          // onEnded={handleAudioEnded}
          controls
          className="hidden"
        >
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default PlayVideo;
