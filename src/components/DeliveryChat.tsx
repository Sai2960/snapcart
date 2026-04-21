import { getSocket } from "@/lib/socket";
import { IMessage } from "@/models/message.model";
import axios from "axios";
import { Loader, Send, Sparkle } from "lucide-react";

import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

type props = {
  orderId: string
  deliveryBoyId: string
};

function DeliveryChat({ orderId, deliveryBoyId }: props) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // ✅ FIX: Always use string version of orderId for socket comparisons
  const orderIdStr = orderId?.toString();

  useEffect(() => {
    if (!orderIdStr) return;
    const socket = getSocket();

    // ✅ FIX: emit as string
    socket.emit("join-room", orderIdStr);

    const handleMessage = (message: any) => {
      if (message.roomId === orderIdStr) {
        setMessages((prev) => [...prev, message]);
      }
    };
    socket.on("send-message", handleMessage);

    return () => {
      socket.off("send-message", handleMessage);
    };
  }, [orderIdStr]); // ✅ FIX: depend on string version

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMsg = () => {
    if (!newMessage.trim()) return;
    const socket = getSocket();

    const message = {
      // ✅ FIX: Send roomId as string
      roomId: orderIdStr,
      text: newMessage,
      // ✅ FIX: Send senderId as string
      senderId: deliveryBoyId?.toString(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    socket.emit("send-message", message);
    setNewMessage("");
  };

  useEffect(() => {
    if (!orderIdStr) return;
    const getAllMessages = async () => {
      try {
        const result = await axios.post("/api/chat/messages", {
          // ✅ FIX: Send as string
          roomId: orderIdStr,
        });
        setMessages(result.data);
      } catch (error) {
        console.log(error);
      }
    };
    getAllMessages();
  }, [orderIdStr]); // ✅ FIX: depend on string version

  const getSuggestion = async () => {
    setLoading(true);
    try {
      const lastMessage = messages?.at(-1); // just get the last message regardless of sender
      if (!lastMessage?.text) {
        setLoading(false);
        return;
      }
      const result = await axios.post("/api/chat/ai-suggestions", {
        message: lastMessage?.text,
        role: "delivery_boy",
      });
      console.log("SUGGESTIONS RECEIVED:", result.data);
      setSuggestions(result.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 bg-white rounded-3xl shadow-lg border p-4 h-[320px] flex flex-col mb-8">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-gray-700 text-sm">
          Quick Replies
        </span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          disabled={loading}
          onClick={getSuggestion}
          className="px-3 py-1 text-xs flex items-center gap-1 bg-purple-100 text-purple-700 rounded-full shadow-sm border border-purple-200 cursor-pointer"
        >
          <Sparkle size={14} />
          {loading ? (
            <Loader
              className="w-5 h-5
        animate-spin"
            />
          ) : (
            "AI suggest"
          )}
        </motion.button>
      </div>

      <div className="flex gap-2 flex-wrap mb-3">
        {suggestions.map((s, i) => (
          <motion.div
            key={`${s}-${i}`}
            whileTap={{ scale: 0.92 }}
            className="px-3 py-1 text-xs bg-green-50 border border-green-200 text-green-700 rounded-full cursor-pointer"
            onClick={() => setNewMessage(s)}
          >
            {s}
          </motion.div>
        ))}
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto p-2 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        ref={chatBoxRef}
      >
        <AnimatePresence>
          {messages?.map((msg) => (
            <motion.div
              key={msg._id?.toString()}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              // ✅ FIX: Compare as strings
              className={`flex ${msg.senderId?.toString() == deliveryBoyId?.toString() ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 max-w-[75%] rounded-2xl shadow ${
                  msg.senderId?.toString() === deliveryBoyId?.toString()
                    ? "bg-green-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
                <p className="text-[10px] opacity-70 mt-1 text-right">
                  {msg.time}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input always at bottom */}
      <div className="flex gap-2 border-t pt-3 mt-3">
        <input
          type="text"
          placeholder="Type a Message..."
          className="flex-1 bg-gray-100 px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMsg()}
        />
        <button
          className="bg-green-600 hover:bg-green-700 p-3 rounded-xl text-white"
          onClick={sendMsg}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default DeliveryChat;
