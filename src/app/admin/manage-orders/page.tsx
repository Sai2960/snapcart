"use client";
import AdminOrderCard from "@/components/AdminOrderCard";
import { getSocket } from "@/lib/socket";
import { IUser } from "@/models/user.model";
import axios from "axios";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface IOrder {
  _id?: string;
  user: string;
  items: [
    {
      grocery: string;
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

  assignment?: string;
  assignedDeliveryBoy?: IUser;
  status: "pending" | "out of delivery" | "delivered";
  createdAt?: Date;
  updatedAt?: Date;
}

function ManageOrders() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const router = useRouter();

  useEffect(() => {
    const getOrders = async () => {
      try {
        const result = await axios.get("/api/admin/get-orders");
        setOrders(result.data);
      } catch (error) {
        console.log(error);
      }
    };
    getOrders();
  }, []);

  useEffect((): any => {
    const socket = getSocket();
    if (!socket) return;

    // ✅ Connect first, then set up listeners inside connect event
    const setupListeners = () => {
      console.log("Admin socket connected:", socket.id);

      socket.on("new-order", handleNewOrder);

      socket.on("order-assigned", ({ orderId, assignedDeliveryBoy }) => {
        setOrders((prev) =>
          prev?.map((o) =>
            o._id == orderId ? { ...o, assignedDeliveryBoy } : o,
          ),
        );
      });
    };

    const handleNewOrder = (newOrder: IOrder) => {
      setOrders((prev) => [newOrder, ...(prev ?? [])]);
    };

    if (socket.connected) {
      setupListeners();
    } else {
      socket.connect();
      socket.on("connect", setupListeners);
    }

    return () => {
      socket.off("new-order", handleNewOrder);
      socket.off("order-assigned");
      socket.off("connect", setupListeners);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="fixed top-0 left-0 w-full backdrop-blur-lg bg-white/76 shadow-sm border-b z-50">
        ···
      </div>
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 space-y-8">
        <div className="space-y-6">
          {orders?.map((order) => (
            <AdminOrderCard key={String(order._id)} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ManageOrders;
