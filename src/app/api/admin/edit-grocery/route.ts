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
    const groceryId = formData.get("groceryId") as string;
    const category = formData.get("category") as string;
    const unit = formData.get("unit") as string;
    const price = formData.get("price") as string;
    const file = formData.get("image") as File | null;

    const parsedPrice = Number(price);

    if (!name || !category || !unit || isNaN(parsedPrice)) {
      return NextResponse.json(
        { message: "Missing or invalid fields" },
        { status: 400 },
      );
    }

    const updateData: any = { name, price: parsedPrice, category, unit };

    if (file && file.size > 0) {
      const imageUrl = await uploadOnCloudinary(file);
      updateData.image = imageUrl;
    }
    // if no new image, don't touch the existing image field

    const grocery = await Grocery.findByIdAndUpdate(groceryId, updateData, { new: true });
    return NextResponse.json(grocery, { status: 200 });
  } catch (error) {
    console.error("Edit grocery error:", error);
    return NextResponse.json(
      { message: `edit grocery error ${error}` },
      { status: 500 },
    );
  }
}