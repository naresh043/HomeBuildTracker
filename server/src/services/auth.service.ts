import bcrypt from "bcrypt";

import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";

export const loginUser = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+passwordHash");

  if (!user) {
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw new ApiError(
      403,
      "Your account has been disabled",
      "ACCOUNT_DISABLED",
    );
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  return user;
};
