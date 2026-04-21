import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { userId, location } = await req.json();

    if (!userId || !location) {
      return NextResponse.json(
        { message: "Missing userId or location" },
        { status: 400 },
      );
    }
    const user = await User.findByIdAndUpdate(userId, {
      location: {
        type: "Point",
        coordinates: [location.coordinates[0], location.coordinates[1]],
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Location updated" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `Update location error: ${error}` },
      { status: 500 },
    );
  }
}
