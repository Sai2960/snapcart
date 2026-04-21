import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { message: "you are not admin" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const groceryId = body?.groceryId;

    if (!groceryId) {
      return NextResponse.json(
        { message: "groceryId is required" },
        { status: 400 },
      );
    }

    const grocery = await Grocery.findByIdAndDelete(groceryId);

    if (!grocery) {
      return NextResponse.json(
        { message: "Grocery not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Grocery deleted successfully", grocery },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: `delete grocery error ${error}` },
      { status: 500 },
    );
  }
}