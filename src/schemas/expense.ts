import { z } from "zod";

export const ExpenseCategorySchema = z.enum([
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Others",
]);

export const ExpenseSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1),
  description: z.string().min(1),
  category: ExpenseCategorySchema,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export type ExpenseData = z.infer<typeof ExpenseSchema>;
