"use client";

import { createAuthClient } from "better-auth/react";
import { siwsClientPlugin } from "./auth-plugins/siws";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [siwsClientPlugin()],
});
