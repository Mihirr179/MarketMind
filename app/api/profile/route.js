import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { getBearerToken, verifyToken } from "@/lib/auth";
import User from "@/models/User";

const PROFILE_FIELDS = ["name", "email", "phone", "bio"];

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    bio: user.bio || "",
    country: user.country,
    investmentGoal: user.investmentGoal,
    riskLevel: user.riskLevel,
    sector: user.sector,
  };
}

function authenticate(req) {
  return verifyToken(getBearerToken(req));
}

export async function GET(req) {
  try {
    await connectDB();
    const verified = authenticate(req);

    if (!verified.ok) {
      return Response.json(
        { success: false, message: verified.message },
        { status: 401 }
      );
    }

    const user = await User.findById(verified.userId).select("-password");

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, user: serializeUser(user) });
  } catch (error) {
    console.error("Profile GET error:", error);
    return Response.json(
      { success: false, message: "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const verified = authenticate(req);

    if (!verified.ok) {
      return Response.json(
        { success: false, message: verified.message },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const update = {};

    for (const field of PROFILE_FIELDS) {
      if (typeof body[field] === "string") {
        update[field] = body[field].trim();
      }
    }

    if (!update.name || !update.email) {
      return Response.json(
        { success: false, message: "Name and email are required" },
        { status: 400 }
      );
    }

    const emailOwner = await User.findOne({
      email: update.email.toLowerCase(),
      _id: { $ne: verified.userId },
    });

    if (emailOwner) {
      return Response.json(
        { success: false, message: "Email is already in use" },
        { status: 409 }
      );
    }

    update.email = update.email.toLowerCase();

    const user = await User.findByIdAndUpdate(verified.userId, update, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, user: serializeUser(user) });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return Response.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const verified = authenticate(req);

    if (!verified.ok) {
      return Response.json(
        { success: false, message: verified.message },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json().catch(() => ({}));

    if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
      return Response.json(
        { success: false, message: "Both password fields are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return Response.json(
        { success: false, message: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const user = await User.findById(verified.userId);
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return Response.json(
        { success: false, message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return Response.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return Response.json(
      { success: false, message: "Failed to update password" },
      { status: 500 }
    );
  }
}
