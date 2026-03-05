import rateLimit from "express-rate-limit";

export const forgotPasswordLimiter = rateLimit({
 windowMs: 60 * 1000,
  max:3,
  message: {
    message: "Too many reset requests. Please wait 1 minute.",
  },
});