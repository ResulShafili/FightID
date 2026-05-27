import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";

export const getProfileForUser = async (userId) => {
  const profile = await prisma.fighterProfile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(404, "Fighter profile not found for current user");
  return profile;
};
