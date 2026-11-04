const { z } = require("zod");

const bangladeshPhone = z
  .string()
  .regex(/^01[3-9]\d{8}$/, "Invalid Bangladesh phone number");
const registerUserSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address").toLowerCase(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: bangladeshPhone.optional(),
    city: z.string().min(1, "City cannot be empty").optional(),
    area: z.string().min(1, "Area cannot be empty").optional(),
    lat: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90").optional(),
    lng: z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180").optional(),
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

const registerDoctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").toLowerCase(),
  phone: bangladeshPhone,
  password: z.string().min(8, "Password must be at least 8 characters"),
  bmdcNumber: z.string().trim().min(1, "BMDC number is required"),
  specialtyId: z.string().uuid("Invalid specialty ID format"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

module.exports = {
  registerUserSchema,
  registerDoctorSchema,
  loginSchema,
};

