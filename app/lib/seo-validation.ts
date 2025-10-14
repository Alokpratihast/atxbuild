import { z } from "zod";

export const seoSchemaValidation = z.object({
  page: z.string().min(1, "Page name is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  keywords: z.array(z.string()).optional().default([]),
  canonical: z.string().url().optional(),
  ogImage: z.string().url().optional(),
  twitterCard: z.string().url().optional(),
  schema: z.any().optional(),
  score: z.number().optional().default(0),
  issues: z.array(z.string()).optional().default([]),
});
