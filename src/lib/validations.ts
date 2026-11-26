import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  campusHub: z.string().optional(),
});

export const registerFormSchema = registerSchema.extend({
  confirmPassword: z.string().min(8, "Password confirmation is required"),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the Terms of Service and Privacy Policy" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  token: z.string().min(4, "Reset code or token is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(100),
  confirmNewPassword: z.string().min(8, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
});

export const createProductSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(120),
  description: z.string().min(5, "Description must be at least 5 characters"),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().optional().nullable(),
  conditionGrade: z.string().min(1, "Condition grade is required"),
  rentalPriceHourly: z.number().min(0).optional().nullable(),
  rentalPriceDaily: z.number().min(1, "Daily rate must be at least ₹1"),
  rentalPriceWeekly: z.number().min(1, "Weekly rate must be at least ₹1"),
  rentalPriceMonthly: z.number().min(0).optional().nullable(),
  rentalPriceSemester: z.number().min(0).optional().nullable(),
  buyPrice: z.number().min(0).optional().nullable(),
  mrpReference: z.number().min(1, "Reference MRP is required"),
  deposit: z.number().min(0, "Security deposit must be >= 0"),
  isRentable: z.boolean().default(true),
  isPurchasable: z.boolean().default(false),
  pickupAvailable: z.boolean().default(true),
  deliveryAvailable: z.boolean().default(true),
  campusHub: z.string().min(1, "Campus hub or collection point is required"),
  pickupAddress: z.string().optional().nullable(),
  images: z
    .array(
      z.string().refine(
        (val) =>
          val.startsWith("http://") ||
          val.startsWith("https://") ||
          val.startsWith("/") ||
          val.startsWith("data:"),
        { message: "Must be a valid image URL or image path" }
      )
    )
    .min(1, "At least 1 product image is required"),
  specs: z.record(z.string()).optional(),
});

export const createBookingSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  durationTier: z.enum(["hourly", "daily", "weekly", "monthly", "semester"]),
  durationUnits: z.number().int().min(1).default(1),
  deliveryMethod: z.enum(["PICKUP", "DELIVERY"]).default("PICKUP"),
  deliveryAddress: z.string().optional().nullable(),
});

export const purchaseOrderSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  deliveryAddress: z.string().min(10, "Full delivery address is required"),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
  bookingId: z.string().optional().nullable(),
  orderId: z.string().optional().nullable(),
});

export const createReviewSchema = z.object({
  productId: z.string().min(1),
  bookingId: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
});

export const relayMessageSchema = z.object({
  receiverId: z.string().min(1),
  bookingId: z.string().optional().nullable(),
  content: z.string().min(1).max(2000),
});

export const returnInspectionSchema = z.object({
  bookingId: z.string().min(1),
  returnOtp: z.string().length(6, "Return OTP must be 6 digits"),
  conditionPhotos: z.array(z.string().url()).min(4, "4-angle condition photos are required"),
  refundUpiId: z.string().min(3, "UPI ID is required for escrow deposit refund"),
  damageReported: z.boolean().default(false),
  damageNotes: z.string().optional(),
});

export const pickupHandoverSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  pickupOtp: z.string().length(6, "Pickup OTP must be 6 digits"),
  conditionBeforePhotos: z.array(z.string().url()).optional(),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  reason: z.string().min(3, "Cancellation reason is required"),
});

export const createDisputeSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  reason: z.string().min(3, "Reason is required"),
  description: z.string().min(10, "Detailed description is required"),
  evidencePhotos: z.array(z.string().url()).optional(),
});
