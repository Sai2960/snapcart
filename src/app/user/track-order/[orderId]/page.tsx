"use client";
import dynamic from "next/dynamic";
const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false });
import { getSocket } from "@/lib/socket";
import { IMessage } from "@/models/message.model";
import { IUser } from "@/models/user.model";
import { RootState } from "@/redux/store";
import axios from "axios";
import { ArrowLeft, Loader, Send, Sparkle } from "lucide-react";

import { AnimatePresence, motion } from "motion/react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

interface IOrder {
  _id?: string
  user: string
  items: [
    {
      grocery: string
      name: string;
      price: string;
      unit: string;
      image: string;
      quantity: number;
    },
  ];
  isPaid: boolean;
  totalAmount: number;
  paymentMethod: "cod" | "online";
  address: {
    fullName: string;
    mobile: string;
    city: string;
    state: string;
    pincode: string;
    fullAddress: string;
    latitude: number;
    longitude: number;
  };
  assignment?: string
  assignedDeliveryBoy?: string | IUser;
  status: "pending" | "out of delivery" | "delivered";
  createdAt?: Date;
  updatedAt?: Date;
}

interface ILocation {
  latitude: number;
  longitude: number;
}

const statusColors: Record<string, string> = {
  pending: "text-yellow-500",
  "out of delivery": "text-blue-500",
  delivered: "text-green-500",
};

function TrackOrder({ params }: { params: { orderId: string } }) {
  const { userData } = useSelector((state: RootState) => state.user);
  const { orderId: rawOrderId } = useParams();
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;
  const router = useRouter();
  const [newMessage, setNewMessage] = useState("");
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [order, setOrder] = useState<IOrder>();
  const [userLocation, setUserLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  });
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    const getOrder = async () => {
      try {
        const result = await axios.get(`/api/user/get-order/${orderId}`);
        setOrder(result.data);
        setUserLocation({
          latitude: result.data.address.latitude,
          longitude: result.data.address.longitude,
        });
        setDeliveryBoyLocation({
          latitude: result.data.assignedDeliveryBoy.location.coordinates[1],
          longitude: result.data.assignedDeliveryBoy.location.coordinates[0],
        });
      } catch (error) {
        console.log(error);
      }
    };
    getOrder();
  }, [userData?._id]);

  useEffect((): any => {
    const socket = getSocket();
    socket.on("update-deliveryBoy-location", (data) => {
      setDeliveryBoyLocation({
        latitude: data.location.coordinates?.[1] ?? data.location.latitude,
        longitude: data.location.coordinates?.[0] ?? data.location.longitude,
      });
    });
    return () => socket.off("update-deliveryBoy-location");
  }, [order]);

  const shortOrderId = order?._id
    ? `order#${order._id.toString().slice(-6)}`
    : "";

  // ✅ SINGLE socket useEffect — removed the duplicate
  useEffect(() => {
    if (!orderId) return;

    const socket = getSocket();

    const joinRoom = () => {
      console.log("✅ joining room:", orderId);
      socket.emit("join-room", orderId);
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.connect();
      socket.once("connect", joinRoom);
    }

    const handleMessage = (message: any) => {
      if (message.roomId === orderId) {
        setMessages((prev) => {
          // ✅ FIX duplicate: deduplicate by text+time+senderId for socket messages
          const isDuplicate = prev.some(
            (m) =>
              m.text === message.text &&
              m.time === message.time &&
              m.senderId?.toString() === message.senderId?.toString(),
          );
          if (isDuplicate) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on("send-message", handleMessage);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("send-message", handleMessage);
    };
  }, [orderId]);

  useEffect(() => {
    const getAllMessages = async () => {
      try {
        const result = await axios.post("/api/chat/messages", {
          roomId: orderId,
        });
        setMessages(result.data);
      } catch (error) {
        console.log(error);
      }
    };
    getAllMessages();
  }, [orderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getSuggestion = async () => {
    setLoading(true);
    try {
      const lastMessage = messages?.at(-1);
      if (!lastMessage?.text) {
        setLoading(false);
        return;
      }
      const result = await axios.post("/api/chat/ai-suggestions", {
        message: lastMessage?.text,
        role: "user",
      });
      setSuggestions(result.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const sendMsg = () => {
    if (!newMessage.trim()) return;
    const socket = getSocket();

    if (!socket.connected) {
      console.warn("Socket not connected");
      return;
    }

    const message = {
      roomId: orderId,
      text: newMessage,
      senderId: userData?._id?.toString(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    socket.emit("send-message", message);
    setNewMessage("");
  };

  return (
    <div className="w-full overflow-y-auto bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-2xl mx-auto pb-24">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-xl px-4 py-3 border-b shadow-sm flex gap-3 items-center z-50">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              Track Order
            </h1>
            {order && (
              <p className="text-xs text-gray-500 leading-tight">
                {shortOrderId}{" "}
                <span className={`font-semibold ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Map + Chat */}
        <div className="px-4 mt-6 space-y-4">
          <div className="rounded-3xl overflow-hidden border shadow">
            <LiveMap
              userLocation={userLocation}
              deliveryBoyLocation={deliveryBoyLocation}
            />
          </div>

          <div className="relative z-10 bg-white rounded-3xl shadow-lg border p-4 h-[420px] flex flex-col mb-8">
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

            <div
              className="flex-1 overflow-y-auto p-2 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              ref={chatBoxRef}
            >
              <AnimatePresence>
                {messages?.map((msg, index) => (
                  <motion.div
                    // ✅ FIX duplicate key: use index fallback when _id is missing
                    key={msg._id?.toString() ?? `msg-${index}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${
                      msg.senderId?.toString() === userData?._id?.toString()
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 max-w-[75%] rounded-2xl shadow ${
                        msg.senderId?.toString() === userData?._id?.toString()
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
              <div ref={bottomRef} />
            </div>

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
        </div>
      </div>
    </div>
  );
}

export default TrackOrder;
