import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .regex(/[A-Za-z]/, "A senha deve conter pelo menos uma letra.")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número.");
