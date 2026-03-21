import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número"),
  alias: z
    .string()
    .min(3, "El alias debe tener al menos 3 caracteres")
    .max(30, "El alias no puede superar 30 caracteres")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Solo letras, números, guiones y guiones bajos"
    ),
  acceptTerms: z.literal(true, {
    message: "Debes aceptar los términos de servicio",
  }),
  acceptPrivacy: z.literal(true, {
    message: "Debes aceptar la política de privacidad",
  }),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const caseSchema = z.object({
  title: z
    .string()
    .min(10, "El título debe tener al menos 10 caracteres")
    .max(120, "El título no puede superar 120 caracteres"),
  accused_company: z
    .string()
    .min(2, "El nombre de la empresa es requerido")
    .max(100, "Máximo 100 caracteres"),
  description: z
    .string()
    .min(50, "La descripción debe tener al menos 50 caracteres")
    .max(5000, "Máximo 5000 caracteres"),
  category: z.enum([
    "tax_claims",
    "admin_claims",
    "consumer_competition",
  ]),
  is_public: z.boolean(),
});

export const claimSchema = z.object({
  case_id: z.string().uuid("ID de caso inválido"),
  amount_defrauded: z
    .number()
    .positive("El importe debe ser positivo")
    .max(10_000_000, "Importe máximo: 10.000.000 €"),
  testimony: z
    .string()
    .min(20, "El testimonio debe tener al menos 20 caracteres")
    .max(10000, "Máximo 10.000 caracteres"),
  share_with_legal: z.literal(true, {
    message: "Debes autorizar compartir tus datos con el equipo legal para participar",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CaseInput = z.infer<typeof caseSchema>;
export type ClaimInput = z.infer<typeof claimSchema>;
