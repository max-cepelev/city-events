import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";

import { accessControl, roles } from "./permissions.js";

export const auth = betterAuth({
  baseURL: "http://localhost:3000",
  emailAndPassword: {
    autoSignIn: false,
    disableSignUp: true,
    enabled: true
  },
  plugins: [
    admin({
      ac: accessControl,
      defaultRole: "user",
      roles
    })
  ]
});
