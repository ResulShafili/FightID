import { ApiError } from "../utils/apiError.js";
export const validate = (schema, source = "body") => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return next(new ApiError(400, "Validation failed", result.error.flatten()));
  }
  if (source === "query") {
    for (const key of Object.keys(req.query)) delete req.query[key];
    Object.assign(req.query, result.data);
  } else {
    req[source] = result.data;
  }
  return next();
};
