const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  passwordHash: { type: String, required: true, select: false },
  birthdate: Date,
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  avatarUrl: String,
});

module.exports = mongoose.model("User", UserSchema);
