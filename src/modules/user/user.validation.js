const { z } = require("zod");

const updateLocationSchema = z.object({
  lat: z
    .number({ required_error: "Latitude is required" })
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  lng: z
    .number({ required_error: "Longitude is required" })
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  city: z.string().min(1, "City cannot be empty").optional(),
  area: z.string().min(1, "Area cannot be empty").optional(),
});

module.exports = {
  updateLocationSchema,
};

