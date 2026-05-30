import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/apiError.js";

export const errorHandler = (error, _req, res, _next) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "A record with this unique value already exists" });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Resource not found" });
    }
    if (error.code === "P2023") {
      return res.status(400).json({ message: "Invalid identifier format" });
    }
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
};
