const { z } = require("zod");

const timeRegex = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:mm (e.g. 17:00)");

const scheduleSchema = z.object({
  day: z.enum(["SAT", "SUN", "MON", "TUE", "WED", "THU", "FRI"], {
    errorMap: () => ({ message: "Day must be one of: SAT, SUN, MON, TUE, WED, THU, FRI" }),
  }),
  startTime: timeRegex,
  endTime: timeRegex,
});


const schedulesSchema = z
  .array(scheduleSchema)
  .min(1, "At least one schedule is required")
  .superRefine((schedules, ctx) => {
    const days = schedules.map((s) => s.day);
    if (new Set(days).size !== days.length) {
      ctx.addIssue({
        code: "custom",
        message: "Each weekday can only appear once in schedules",
      });
    }

    schedules.forEach((s, index) => {
      if (s.startTime >= s.endTime) {
        ctx.addIssue({
          code: "custom",
          path: [index, "endTime"],
          message: "endTime must be after startTime",
        });
      }
    });
  });

const chamberInputSchema = z.object({
  name: z.string().min(2, "Chamber name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  area: z.string().min(2, "Area must be at least 2 characters"),
  lat: z
    .number({ required_error: "Latitude is required" })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  lng: z
    .number({ required_error: "Longitude is required" })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Invalid Bangladesh phone number")
    .optional(),
  fee: z
    .number({ required_error: "Fee is required" })
    .int("Fee must be an integer")
    .positive("Fee must be a positive number"),
  schedules: schedulesSchema,
});

const createChamberSchema = chamberInputSchema;

const updateChamberSchema = chamberInputSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field is required to update" }
  );

const chamberIdParamSchema = z.object({
  chamberId: z.string().uuid("Invalid chamber ID format"),
});

module.exports = {
  scheduleSchema,
  schedulesSchema,
  chamberInputSchema,
  createChamberSchema,
  updateChamberSchema,
  chamberIdParamSchema,
};

