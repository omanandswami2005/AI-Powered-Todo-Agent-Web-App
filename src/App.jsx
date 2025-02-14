import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import useSpeechToText from "react-hook-speech-to-text";
import Markdown from "react-markdown";
import gfm from "remark-gfm";

const App = () => {
  const [command, setCommand] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!command.trim()) return;

    sendCommandToServer(command);
  };

  const sendCommandToServer = async (text) => {
    const userMessage = { role: "user", text };
    setMessages([...messages, userMessage]);
    setCommand("");
    setIsTyping(true);

    const response = await fetch("http://localhost:5000/api/todo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command: text }),
    });

    const data = await response.json();
    console.log(data.message);
    setMessages([
      ...messages,
      userMessage,
      { role: "model", text: data.message },
    ]);
    setIsTyping(false);
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStopRecording = () => {
    stopSpeechToText();
    console.log("Recording stopped");
    setTimeout(() => {
      if (results.length > 0) {
        console.log("Results:", results);
        const finalTranscript = results.slice(-1)[0].transcript;
        setCommand(finalTranscript);
        // sendCommandToServer(finalTranscript);
      }
    }, 500);
  };

  return (
    <div className="h-screen bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex justify-center items-center p-4">
      <div className="chat-container p-6 rounded-3xl shadow-2xl backdrop-blur-2xl bg-white/20 dark:bg-black/30 w-full max-w-lg border border-white/40 dark:border-gray-700">
        <div
          ref={chatBoxRef}
          className="chat-box space-y-4 max-h-96 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
        >
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-3 rounded-xl max-w-[75%] shadow-md border-2 my-3 ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-500 to-blue-400 text-black self-end ml-auto border-blue-300 shadow-blue-500"
                  : "bg-gradient-to-r from-purple-500 to-purple-400 text-black border-purple-300 shadow-purple-500"
              }`}
            >
<Markdown
  remarkPlugins={[gfm]}
  className="break-words whitespace-pre-wrap [&_pre]:bg-transparent [&_pre]:p-0 [&_pre]:border-0 [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:bg-transparent [&_code]:p-0"
>
  {String(msg.text)}
</Markdown>

                {/* {msg.text} */}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="p-3 rounded-xl max-w-[75%] bg-purple-400 text-white border-2 border-purple-300 shadow-purple-500"
            >
              **Typing...**
            </motion.div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="mt-4 flex space-x-2">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter command..."
            className="w-full p-3 rounded-lg bg-white/30 dark:bg-black/40 text-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all placeholder-gray-300"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="submit"
            className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-pink-500 hover:to-yellow-500 text-white rounded-lg shadow-md transition-all duration-300 border-2 border-yellow-300 shadow-yellow-500 animate-glow"
          >
            Submit
          </motion.button>
        </form>
        <button
          onClick={isRecording ? handleStopRecording : startSpeechToText}
          className="mt-4 w-full p-3 bg-blue-500 text-white rounded-lg shadow-md transition-all duration-300 border-2 border-blue-300 hover:bg-blue-600"
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>
    </div>
  );
};

export default App;
