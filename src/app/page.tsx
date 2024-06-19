"use client";

import React, { useEffect, useRef, useState } from "react";

const PlayVideo: React.FC = () => {
  const video1 =
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1717647802/videoStream/ngedy7l9bog5zn4kjuay.mp4";
  const video2 =
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1717660258/videoStream/s5qqdoqebuuu2fvgz7rf.mp4";

  const [currentVideo, setCurrentVideo] = useState(video1);
  const [audioUrl, setAudioUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  const connectToStream = () => {
    const eventSource = new EventSource("/api/subscribeMessage");
    eventSource.addEventListener("message", (event) => {
      console.log("Received message event:", event);
      const newAudioUrl = event.data.trim();
      if (newAudioUrl) {
        console.log("Setting new audio URL:", newAudioUrl);
        setAudioUrl(newAudioUrl);
      } else {
        console.error("Received invalid audio URL");
      }
    });

    eventSource.addEventListener("error", (error) => {
      console.error("EventSource error:", error);
      eventSource.close();
      setTimeout(connectToStream, 1000); // Use 1 second timeout to prevent rapid reconnection attempts
    });

    return eventSource;
  };

  useEffect(() => {
    const eventSource = connectToStream();
    return () => {
      console.log("CLOSED");
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      console.log("Playing audio from URL:", audioUrl);
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  }, [audioUrl]);

  const handleAudioEnded = () => {
    console.log("Audio ended");
    setCurrentVideo(video1); // Switch back to video1 when audio ends
  };

  const handleAudioCanPlayThrough = () => {
    console.log("Audio can play through");
    setCurrentVideo(video2); // Switch to video2 when audio starts playing
  };

  return (
    <div className="grid grid-cols-3 h-[100dvh]">
      <div className="col-span-3 flex items-center justify-center bg-white h-full">
        <div
          style={{
            width: "calc(100dvh * 9 / 16)",
          }}
          className="relative bg-white flex items-center justify-center"
        >
          <div className="flex h-full flex-col items-center justify-center">
            <div className="relative">
              {currentVideo && (
                <video key={currentVideo} autoPlay loop muted>
                  <source src={currentVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
      </div>
      {audioUrl && (
        <audio
          ref={audioRef}
          onEnded={handleAudioEnded}
          onCanPlayThrough={handleAudioCanPlayThrough}
          autoPlay
          controls
        >
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default PlayVideo;
