"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export type LoginState = { error: string | null };

export async function authenticate(_prev: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/home",
    });
    return { error: null };
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Correo o contraseña incorrectos." };
    }
    throw err;
  }
}
