import { z } from "zod";

const publicEnvSchema = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().trim().min(1).optional(),
  })
  .superRefine((environment, context) => {
    const hasUrl = environment.NEXT_PUBLIC_SUPABASE_URL !== undefined;
    const hasKey = environment.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined;

    if (hasUrl !== hasKey) {
      context.addIssue({
        code: "custom",
        message:
          "Set both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or leave both unset.",
        path: ["NEXT_PUBLIC_SUPABASE_URL"],
      });
    }
  });

export function validatePublicEnv(
  environment: Readonly<Record<string, string | undefined>> = process.env,
) {
  return publicEnvSchema.parse(environment);
}
