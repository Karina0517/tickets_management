import mongoose, { Schema, Model, Types } from "mongoose";
import * as yup from "yup";

export interface IComment {
  ticketId: Types.ObjectId | string;
  author: Types.ObjectId | string;
  message: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Validación
export const createCommentSchema: yup.ObjectSchema<any> = yup
  .object({
    ticketId: yup.string().required(),
    author: yup.string().required(),
    message: yup.string().trim().required("El mensaje es obligatorio"),
    createdAt: yup.date().nullable(),
    updatedAt: yup.date().nullable(),
  })
  .noUnknown(true);

const commentSchema = new Schema<IComment>(
  {
    ticketId: { type: Schema.Types.ObjectId, required: true, ref: "Ticket" },
    author: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    message: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    collection: "messages", 
    versionKey: false
  }
);

// Índices
commentSchema.index({ ticketId: 1, createdAt: 1 });

const Comment: Model<IComment> =
  mongoose.models.Comment ||
  mongoose.model<IComment>("Comment", commentSchema);

export default Comment;