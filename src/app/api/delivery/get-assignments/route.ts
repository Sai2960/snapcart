import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextResponse } from "next/server";
import mongoose from "mongoose"; // ← THIS WAS MISSING

export async function GET() {
  try {
    await connectDb();
    const session = await auth();

    console.log("=== GET ASSIGNMENTS ===");
    console.log("deliveryBoyId:", session?.user?.id);

    const all = await DeliveryAssignment.find({ status: "brodcasted" }).lean();
    console.log("total brodcasted count:", all.length);
    console.log(
      "all brodcasted assignments:",
      JSON.stringify(
        all.map((a) => ({
          id: a._id,
          brodcastedTo: a.brodcastedTo,
          status: a.status,
          createdAt: a.createdAt,
        })),
      ),
    );

    const assignments = await DeliveryAssignment.find({
      brodcastedTo: new mongoose.Types.ObjectId(session?.user?.id),
      status: "brodcasted",
    }).populate("order");

    console.log("filtered assignments found:", assignments.length);

    return NextResponse.json({ assignments }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `get assignments error ${error}` },
      { status: 200 },
    );
  }
}