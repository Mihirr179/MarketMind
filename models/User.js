import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  country: String,
  investmentGoal: String,
  riskLevel: String,
  sector: String,
  phone: {
    type: String,
    trim: true,
    maxlength: 30,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
  },
});

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
