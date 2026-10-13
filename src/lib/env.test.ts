import { describe, expect, it } from "vitest";
import { validatePublicEnv } from "./env";

describe("public environment validation", () => {
  it("allows local app use before Supabase is configured", () => {
    expect(validatePublicEnv({})).toEqual({});
  });

  it("rejects partial Supabase configuration", () => {
    expect(() =>
      validatePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      }),
    ).toThrow(/Set both NEXT_PUBLIC_SUPABASE_URL/);
  });
});
