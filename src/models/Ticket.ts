import mongoose, { Schema, Model, Types } from "mongoose";
import * as yup from "yup";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high";

export interface ITicket {
  title: string;
  description: string;
  createdBy: Types.ObjectId | string;
  createdByCC: string; 
  createdByName: string; 
  createdByEmail: string;
  assignedTo?: Types.ObjectId | string | null;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Validación para crear ticket
export const createTicketSchema: yup.ObjectSchema<any> = yup
  .object({
    title: yup
      .string()
      .trim()
      .required("El título es obligatorio")
      .min(5, "Mínimo 5 caracteres")
      .max(200, "Máximo 200 caracteres"),
    description: yup
      .string()
      .trim()
      .required("La descripción es obligatoria")
      .min(10, "Mínimo 10 caracteres")
      .max(2000, "Máximo 2000 caracteres"),
    createdBy: yup
      .string()
      .required("El usuario creador es obligatorio")
      .test("is-objectid", "ID de usuario inválido", (value) => {
        return mongoose.Types.ObjectId.isValid(value);
      }),
    createdByCC: yup
      .string()
      .trim()
      .required("La cédula del usuario es obligatoria")
      .min(5, "Mínimo 5 caracteres")
      .max(50, "Máximo 50 caracteres"),
    createdByName: yup
      .string()
      .trim()
      .required("El nombre del usuario es obligatorio")
      .min(2, "Mínimo 2 caracteres")
      .max(100, "Máximo 100 caracteres"),
    createdByEmail: yup
      .string()
      .trim()
      .required("El email del usuario es obligatorio")
      .email("Email inválido")
      .max(150, "Máximo 150 caracteres"),
    assignedTo: yup
      .string()
      .nullable()
      .notRequired()
      .test("is-objectid", "ID de agente inválido", (value) => {
        if (!value) return true;
        return mongoose.Types.ObjectId.isValid(value);
      }),
    status: yup
      .string()
      .required("El estado es obligatorio")
      .oneOf(
        ["open", "in_progress", "resolved", "closed"],
        "Estado inválido"
      ),
    priority: yup
      .string()
      .required("La prioridad es obligatoria")
      .oneOf(["low", "medium", "high"], "Prioridad inválida"),
    createdAt: yup.date().nullable().notRequired(),
    updatedAt: yup.date().nullable().notRequired(),
  })
  .noUnknown(true);

// Validación para actualizar ticket
export const updateTicketSchema = yup
  .object({
    title: yup
      .string()
      .trim()
      .min(5, "Mínimo 5 caracteres")
      .max(200, "Máximo 200 caracteres")
      .notRequired(),
    description: yup
      .string()
      .trim()
      .min(10, "Mínimo 10 caracteres")
      .max(2000, "Máximo 2000 caracteres")
      .notRequired(),
    assignedTo: yup
      .string()
      .nullable()
      .notRequired()
      .test("is-objectid", "ID de agente inválido", (value) => {
        if (!value) return true;
        return mongoose.Types.ObjectId.isValid(value);
      }),
    status: yup
      .string()
      .oneOf(
        ["open", "in_progress", "resolved", "closed"],
        "Estado inválido"
      )
      .notRequired(),
    priority: yup
      .string()
      .oneOf(["low", "medium", "high"], "Prioridad inválida")
      .notRequired(),
    createdAt: yup.date().nullable().notRequired(),
    updatedAt: yup.date().nullable().notRequired(),
  })
  .noUnknown(true);

export function formatYupErrors(err: yup.ValidationError) {
  const errors: Record<string, string[]> = {};
  err.inner.forEach((e) => {
    const key = e.path || "_error";
    if (!errors[key]) errors[key] = [];
    errors[key].push(e.message);
  });
  return errors;
}

const ticketSchema = new Schema<ITicket>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    createdByCC: { type: String, required: true, trim: true },
    createdByName: { type: String, required: true, trim: true },
    createdByEmail: { type: String, required: true, trim: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      required: true,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.index({ createdBy: 1, status: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ createdAt: -1 });

const Ticket: Model<ITicket> =
  mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", ticketSchema);

export default Ticket;