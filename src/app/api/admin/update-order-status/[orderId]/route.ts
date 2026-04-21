import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{
      orderId: string;
    }>;
  },
) {
  try {
    await connectDb();
    const { orderId } = await context.params;
    const { status } = await req.json();
    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return NextResponse.json({ message: "order not found" }, { status: 400 });
    }
    order.status = status;
    let deliveryBoysPayload: any = [];

    if (status === "out of delivery") {
      // ✅ Check if there's already an active broadcasted/assigned assignment
      const existingAssignment = await DeliveryAssignment.findOne({
        order: order._id,
        status: { $in: ["brodcasted", "assigned"] },
      });

      if (!existingAssignment) {
        const { latitude, longitude } = order.address;

        // ✅ BROADCAST DEBUG LOGS
        console.log("=== BROADCAST DEBUG ===");
        console.log("order coords:", longitude, latitude);
        const allDeliveryBoys = await User.find({ role: "deliveryBoy" });
        console.log(
          "all delivery boys in DB:",
          allDeliveryBoys.map((b) => ({
            id: b._id,
            name: b.name,
            location: b.location,
          })),
        );

        let nearByDeliveryBoys = await User.find({
          role: "deliveryBoy",
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [Number(longitude), Number(latitude)],
              },
              $maxDistance: 10000,
            },
          },
        });

        console.log("nearby found:", nearByDeliveryBoys.length);

        // Fallback: if no nearby boys found, use all delivery boys
        if (nearByDeliveryBoys.length === 0) {
          console.log(
            "No nearby delivery boys — falling back to all delivery boys",
          );
          nearByDeliveryBoys = await User.find({ role: "deliveryBoy" });
        }

        const nearByIds = nearByDeliveryBoys.map((b) => b._id);
        const busyIds = await DeliveryAssignment.find({
          assignedTo: { $in: nearByIds },
          status: "assigned", // ← only "assigned" means truly busy
        }).distinct("assignedTo");
        const busyIdSet = new Set(busyIds.map((b) => String(b)));
        const availableDeliveryBoys = nearByDeliveryBoys.filter(
          (b) => !busyIdSet.has(String(b._id)),
        );
        const candidates = availableDeliveryBoys.map((b) => b._id);

        if (candidates.length === 0) {
          await order.save();
          await emitEventHandler("order-status-update", {
            orderId: order._id,
            status: order.status,
          });
          return NextResponse.json(
            { message: "there is no available Delivery boys" },
            { status: 200 },
          );
        }

        const deliveryAssignment = await DeliveryAssignment.create({
          order: order._id,
          brodcastedTo: candidates,
          status: "brodcasted",
        });

        await deliveryAssignment.populate("order");

        for (const boyId of candidates) {
          const boy = await User.findById(boyId);
          await emitEventHandler(
            "new-assignment",
            deliveryAssignment,
            boy.socketId ?? null,
          );
        }

        order.assignment = deliveryAssignment._id;
        deliveryBoysPayload = availableDeliveryBoys.map((b) => ({
          id: b._id,
          name: b.name,
          mobile: b.mobile,
          latitude: b.location.coordinates[1],
          longitude: b.location.coordinates[0],
        }));

        await deliveryAssignment.populate("order");
        await order.save();
        await order.populate("user");
        await emitEventHandler("order-status-update", {
          orderId: order._id,
          status: order.status,
        });

        return NextResponse.json(
          {
            message: "status updated and delivery broadcasted",
            deliveryBoys: deliveryBoysPayload,
          },
          { status: 200 },
        );
      } else {
        // ✅ Assignment already exists — just save status and emit
        await order.save();
        await emitEventHandler("order-status-update", {
          orderId: order._id,
          status: order.status,
        });
        return NextResponse.json(
          { message: "assignment already exists" },
          { status: 200 },
        );
      }
    }

    await order.save();
    await emitEventHandler("order-status-update", {
      orderId: order._id,
      status: order.status,
    });

    return NextResponse.json(
      { message: "status updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 },
    );
  }
}
