import { Schema, model } from "mongoose";

const QADataSchema = new Schema(
  {
    dataId: { type: String, required: true },
    datasetId: { type: String, required: true },
    collectionId: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { timestamps: true }
);
export const QAData = model("qadata", QADataSchema);
