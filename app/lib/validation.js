import { z } from "zod";
import { DELIVERY_LOCATIONS, PAYMENT_METHODS } from "./order-options";
import { ORDER_STATUSES } from "./order-status";

export const orderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters."),

  phone: z
    .string()
    .trim()
    .regex(
      /^\d{10}$/,
      "Phone number must contain exactly 10 digits."
    ),

  address: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters.")
    .optional(),
  deliveryLocation: z.enum(DELIVERY_LOCATIONS),
  customDeliveryLocation: z
    .string()
    .trim()
    .max(120, "Custom delivery location must be 120 characters or fewer.")
    .optional(),
  paymentMethod: z.enum(PAYMENT_METHODS),
});

export const orderSubmissionSchema = orderSchema
  .extend({
    items: z
      .array(
        z.object({
          id: z.union([z.string().min(1), z.number().int().positive()]),
          quantity: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
        })
      )
      .min(1, "Your cart is empty."),
    idempotencyKey: z.string().uuid().optional(),
  })
  .superRefine((order, context) => {
    if (
      order.deliveryLocation === "Other" &&
      !order.customDeliveryLocation?.trim()
    ) {
      context.addIssue({
        code: "custom",
        path: ["customDeliveryLocation"],
        message: "Enter your delivery location.",
      });
    }

    if (
      order.deliveryLocation !== "Other" &&
      order.customDeliveryLocation?.trim()
    ) {
      context.addIssue({
        code: "custom",
        path: ["customDeliveryLocation"],
        message: "A custom location is only allowed when Other is selected.",
      });
    }
  });

export const orderManagementUpdateSchema = z
  .object({
    status: z.enum(ORDER_STATUSES).optional(),
    deliveryCoordinates: z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      })
      .strict()
      .nullable()
      .optional(),
    deliveryNote: z
      .string()
      .trim()
      .min(1, "Delivery notes cannot be empty.")
      .max(300, "Delivery notes must be 300 characters or fewer.")
      .optional(),
    deliveryPersonName: z
      .string()
      .trim()
      .max(100, "Delivery person name must be 100 characters or fewer.")
      .optional(),
    deliveryPersonContact: z
      .string()
      .trim()
      .max(30, "Delivery person contact must be 30 characters or fewer.")
      .optional(),
    deliveryPersonShared: z.boolean().optional(),
  })
  .strict()
  .refine(
    (update) => Object.values(update).some((value) => value !== undefined),
    "At least one order update is required."
  );