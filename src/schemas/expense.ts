import { z } from "zod";

export const ExpenseCategorySchema = z.enum([
  "Food",
  "Transport",
  "Transport: Gasoline",
  "Transport: Parking fee",
  "Transport: Public transport",
  "Transport: Taxi/Ojol",
  "Transport: Vehicle maintenance",
  "Shopping",
  "Shopping: Groceries",
  "Shopping: Fashion",
  "Shopping: Gadgets",
  "Bills",
  "Bills: Electricity",
  "Bills: Water",
  "Bills: Internet",
  "Bills: Mobile Data",
  "Bills: Rent",
  "Bills: Subscription",
  "Social",
  "Others",
]);

export const ExpenseSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().min(1).default("IDR"),
  description: z.string().min(1),
  category: ExpenseCategorySchema,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export type ExpenseData = z.infer<typeof ExpenseSchema>;
