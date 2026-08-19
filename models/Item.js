const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ["producto", "persona", "usuario", "casa", "servicio", "otro"],
      default: "otro",
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ""
    },
    price: {
      type: Number,
      min: 0,
      default: 0
    },
    imageUrl: {
      type: String,
      trim: true,
      default: ""
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Item", itemSchema);
