"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [streaming, setStreaming] = useState(false);   // fixed
  const [loading, setLoading] = useState(false);       // fixed
  const [streamResponse, setStreamResponse] = useState("");

  const handleChat = async () => {
    if (!message.trim()) return; // prevent empty send

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({messages: [{ role: "user", content: "message" }]
      }),
      });
       if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(errorText || "API request failed");
      }

      const data = await res.json();
      console.log("API raw response:", data);
      setResponse(data.response);

    } catch (error) {
      console.error("Error:", error);
      setResponse("An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  };
  const handleStreamChat = async () => {
    setStreaming(true);
    setStreamResponse("");

    try {
      const res = await fetch("/api/chat-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: message }),
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while(true){
         const { done, value } = await reader.read()
          if (done) break;

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")
          for (const line of lines) {
            if (line.startsWith ("data: ")) {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                setStreamResponse((prev) => prev + data.content)
              } else if (data.error) {
                console.error("Stream error:", data.error)
                setStreamResponse("An error occurred while streaming response.")
                setStreaming(false)
                return;
              }
              
            }
          }
        }
      } catch (error) {
        console.error("Stream error:", error);
        setStreamResponse("An error occurred while streaming response.");

      }
    }
     
  return (
    <div className={styles.page}>
      <div className="grid-overlay" />

      <div className="hero-title scene-3d">
        <h1 className="h1-3d">Welcome to the AI Next App</h1>
        <div className="card-3d">
          <div className={styles.chatContainer}>
            <textarea
              className={styles.textarea}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Buddy send me your amazing queries..."
              rows="4"
              cols="50"
              disabled={loading}
              style={{ width: "100%", marginBottom: "10px" }}
            />

            <button
              className="btn-3d"
              onClick={handleChat}
              disabled={loading}
            >
              {loading ? "Loading..." : "Chat"}
            </button>
            <button
              className="btn-3d"
              onClick={handleStreamChat}
              disabled={streaming}
            >
              {streaming ? "Streaming..." : "Stream Chat"}
            </button>   
          </div>

          {response && (
            <div className="mt-4 p-4 border rounded bg-gray-50">
              <strong>Response:</strong> {response}
            </div>
          )}
        </div>
      </div>

      {/* Accent gradient for 3D styling */}
      <svg className="svg-accent" width="0" height="0" aria-hidden="true">
        <defs>
          <linearGradient id="accentGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}