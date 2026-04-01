const { z } = require("zod");

const driverRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number must be valid"),
  formattedAddress: z.string().min(5, "Address must be valid"),
  transportType: z.enum(["BICYCLE", "SCOOTER"], {
    errorMap: () => ({ message: "Transport type must be BICYCLE or SCOOTER" }),
  }),
});

module.exports = {
  driverRegistrationSchema,
};
