const { z } = require("zod");

const bangladeshPhone = z
  .string()
  .regex(/^01[3-9]\d{8}$/, "Invalid Bangladesh phone number");

const updateDoctorProfileSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    phone: bangladeshPhone.optional(),
    specialtyId: z.string().uuid("Invalid specialty ID format").optional(),
    degrees: z
      .array(z.string().trim().min(1, "Degree name cannot be empty"))
      .optional(),
    experienceYears: z
      .number()
      .int("Experience years must be an integer")
      .min(0, "Experience years must be at least 0")
      .max(70, "Experience years cannot exceed 70")
      .optional(),
    bio: z.string().max(1000, "Bio cannot exceed 1000 characters").optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field is required to update" }
  );

const doctorIdParamSchema = z.object({
  id: z.string().uuid("Invalid doctor ID format"),
});

module.exports = {
  updateDoctorProfileSchema,
  doctorIdParamSchema,
};

