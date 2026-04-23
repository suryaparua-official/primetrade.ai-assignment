import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL || "redis://redis:6379",
});

client.on("error", (err) => {
  console.error("Redis error:", err.message);
});

client.on("connect", () => {
  console.log("Redis connected");
});

export const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
  }
};

export const disconnectRedis = async () => {
  if (client.isOpen) {
    await client.disconnect();
  }
};

export default client;
