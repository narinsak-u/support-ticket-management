import { z } from "zod";

function withinCharacterLimit(value: string, max: number): boolean {
  if (value.length <= max) return true;
  let count = 0;
  for (let offset = 0; offset < value.length;) {
    if (++count > max) return false;
    offset += value.codePointAt(offset)! > 0xffff ? 2 : 1;
  }
  return true;
}

export const ticketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Enter a title.")
    .refine((value) => withinCharacterLimit(value, 150), {
      message: "Title must be 150 characters or fewer.",
    }),
  description: z
    .string()
    .trim()
    .refine((value) => withinCharacterLimit(value, 2000), {
      message: "Description must be 2,000 characters or fewer.",
    }),
  category: z.enum(["TECHNICAL", "BILLING", "GENERAL"], {
    message: "Choose a category.",
  }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"], {
    message: "Choose a priority.",
  }),
});

export type TicketInput = z.infer<typeof ticketSchema>;
export type Ticket = TicketInput & {
  id: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  assignedTeamCode: string;
  createdAt: string;
};
