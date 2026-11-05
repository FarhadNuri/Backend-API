const { z } = require("zod");

const searchDoctorsSchema = z
  .object({
    disease: z.string().trim().min(1, "Disease cannot be empty").optional(),
    name: z.string().trim().min(1, "Name cannot be empty").optional(),
    area: z.string().trim().min(1, "Area cannot be empty").optional(),
    city: z.string().trim().min(1, "City cannot be empty").optional(),
    specialtyId: z.string().uuid("Invalid specialty ID format").optional(),
    lat: z.coerce
      .number({ invalid_type_error: "Latitude must be a valid number" })
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
      .optional(),
    lng: z.coerce
      .number({ invalid_type_error: "Longitude must be a valid number" })
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
      .optional(),
    radius: z.coerce
      .number({ invalid_type_error: "Radius must be a number" })
      .min(0.5, "Radius must be at least 0.5 km")
      .max(50, "Radius cannot exceed 50 km")
      .default(5),
    maxFee: z.coerce
      .number({ invalid_type_error: "Max fee must be a number" })
      .int("Max fee must be an integer")
      .positive("Max fee must be a positive number")
      .optional(),
    day: z
      .enum(["SAT", "SUN", "MON", "TUE", "WED", "THU", "FRI"], {
        errorMap: () => ({ message: "Day must be one of SAT, SUN, MON, TUE, WED, THU, FRI" }),
      })
      .optional(),
    page: z.coerce
      .number()
      .int("Page must be an integer")
      .min(1, "Page must be at least 1")
      .default(1),
    limit: z.coerce
      .number()
      .int("Limit must be an integer")
      .min(1, "Limit must be at least 1")
      .max(50, "Limit cannot exceed 50")
      .default(10),
  })
  .superRefine((data, ctx) => {
    if (data.lat !== undefined && data.lng === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["lng"],
        message: "Longitude is required when latitude is provided",
      });
    }
    if (data.lat === undefined && data.lng !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["lat"],
        message: "Latitude is required when longitude is provided",
      });
    }
  });

module.exports = {
  searchDoctorsSchema,
};

