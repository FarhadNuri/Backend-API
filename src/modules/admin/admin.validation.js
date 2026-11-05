const { z } = require("zod");
const { chamberInputSchema } = require("../chamber/chamber.validation");

const bangladeshPhone = z
  .string()
  .regex(/^01[3-9]\d{8}$/, "Invalid Bangladesh phone number");

const listDoctorsQuerySchema = z.object({
  status: z
    .enum(["PENDING", "VERIFIED", "REJECTED"], {
      errorMap: () => ({ message: "Status must be PENDING, VERIFIED, or REJECTED" }),
    })
    .default("PENDING"),
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .default(10),
});

const doctorIdParamSchema = z.object({
  id: z.string().uuid("Invalid doctor ID format"),
});

const addDoctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").toLowerCase(),
  phone: bangladeshPhone,
  tempPassword: z.string().min(8, "Temporary password must be at least 8 characters"),
  bmdcNumber: z.string().trim().min(1, "BMDC number is required"),
  specialtyId: z.string().uuid("Invalid specialty ID format"),
  degrees: z
    .array(z.string().trim().min(1, "Degree name cannot be empty"))
    .optional()
    .default([]),
  experienceYears: z
    .number()
    .int("Experience years must be an integer")
    .min(0, "Experience years must be at least 0")
    .max(70, "Experience years cannot exceed 70")
    .optional()
    .default(0),
  bio: z.string().max(1000, "Bio cannot exceed 1000 characters").optional(),
  chambers: z.array(chamberInputSchema).optional().default([]),
});

module.exports = {
  listDoctorsQuerySchema,
  doctorIdParamSchema,
  addDoctorSchema,
};

