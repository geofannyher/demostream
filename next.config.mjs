// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/subscribeMessages",
        headers: [
          {
            key: "Content-Type",
            value: "text/event-stream",
          },
          {
            key: "Cache-Control",
            value: "no-cache",
          },
          {
            key: "Connection",
            value: "keep-alive",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
