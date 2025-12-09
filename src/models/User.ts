import mongoose, { Schema, Model } from "mongoose";
import * as yup from "yup";

export type UserRole = "client" | "agent";

export interface IUser {
  name: string;
  email: string;
  password: string;
  cc: string; // Cédula o documento de identidad
  role: UserRole;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Validación para crear usuario
export const createUserSchema: yup.ObjectSchema<any> = yup
  .object({
    name: yup
      .string()
      .trim()
      .required("El nombre es obligatorio")
      .min(2, "Mínimo 2 caracteres")
      .max(100, "Máximo 100 caracteres"),
    email: yup
      .string()
      .trim()
      .required("El email es obligatorio")
      .email("Email inválido")
      .max(150, "Máximo 150 caracteres"),
    password: yup
      .string()
      .required("La contraseña es obligatoria")
      .min(6, "Mínimo 6 caracteres")
      .max(100, "Máximo 100 caracteres"),
    cc: yup
      .string()
      .trim()
      .required("La cédula es obligatoria")
      .min(5, "Mínimo 5 caracteres")
      .max(50, "Máximo 50 caracteres"),
    role: yup
      .string()
      .required("El rol es obligatorio")
      .oneOf(["client", "agent"], "Rol inválido"),
    createdAt: yup.date().nullable().notRequired(),
    updatedAt: yup.date().nullable().notRequired(),
  })
  .noUnknown(true);

// Validación para actualizar usuario
export const updateUserSchema = yup
  .object({
    name: yup
      .string()
      .trim()
      .min(2, "Mínimo 2 caracteres")
      .max(100, "Máximo 100 caracteres")
      .notRequired(),
    email: yup
      .string()
      .trim()
      .email("Email inválido")
      .max(150, "Máximo 150 caracteres")
      .notRequired(),
    password: yup
      .string()
      .min(6, "Mínimo 6 caracteres")
      .max(100, "Máximo 100 caracteres")
      .notRequired(),
    cc: yup
      .string()
      .trim()
      .min(5, "Mínimo 5 caracteres")
      .max(50, "Máximo 50 caracteres")
      .notRequired(),
    role: yup
      .string()
      .oneOf(["client", "agent"], "Rol inválido")
      .notRequired(),
    createdAt: yup.date().nullable().notRequired(),
    updatedAt: yup.date().nullable().notRequired(),
  })
  .noUnknown(true);

// Validación para login
export const loginSchema = yup
  .object({
    email: yup
      .string()
      .trim()
      .required("El email es obligatorio")
      .email("Email inválido"),
    password: yup.string().required("La contraseña es obligatoria"),
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

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    cc: { type: String, required: true, trim: true, unique: true },
    role: { type: String, required: true, enum: ["client", "agent"] },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;