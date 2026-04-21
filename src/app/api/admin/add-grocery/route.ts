import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/cloudinary";
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
        { status: 400 },
      );
    }
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const unit = formData.get("unit") as string;
    const price = formData.get("price") as string;
    const file = formData.get("image") as File | null; // ✅ File not Blob

    let imageUrl: string | null = null;
    if (file && file.size > 0) {
      // ✅ check file.size
      imageUrl = await uploadOnCloudinary(file);
    }

    const parsedPrice = Number(price);

    if (!name || !category || !unit || isNaN(parsedPrice)) {
      return NextResponse.json(
        { message: "Missing or invalid fields" },
        { status: 400 },
      );
    }

    const grocery = await Grocery.create({
      name,
      price: parsedPrice,
      category,
      unit,
      image: imageUrl,
    });
    return NextResponse.json(grocery, { status: 200 });
  } catch (error) {
    console.error("Add grocery error:", error); // ✅ better logging
    return NextResponse.json(
      { message: `add grocery error ${error}` },
      { status: 500 },
    );
  }
}
