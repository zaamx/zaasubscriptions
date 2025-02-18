import { InferTypeOf } from "@medusajs/framework/types"
import Subscription from "../models/subscription"

export enum SubscriptionStatus {
  ACTIVE = "active",
  CANCELED = "canceled",
  EXPIRED = "expired",
  FAILED = "failed"
}

export enum SubscriptionInterval {
  MONTHLY = "monthly",
  YEARLY = "yearly"
}

export type CartSubscriptionMetadata = {
  subscription_items: {
    cart_item_id: string;
    start_date?: Date;  // If not provided, starts from next period
  }[];
  interval: SubscriptionInterval;
  period: number;
}

// Add this to track subscription items
export type CreateSubscriptionItemData = {
  subscription: string;
  variant_id: string;
  title: string;
  quantity: number;
  unit_price: number;
  metadata?: Record<string, unknown>;
}

export type CreateSubscriptionData = {
  interval: SubscriptionInterval
  period: number
  status?: SubscriptionStatus
  subscription_date?: Date
  last_order_date?: Date
  next_order_date?: Date
  expiration_date?: Date
  items: CreateSubscriptionItemData[]
  metadata?: Record<string, unknown>
}


export type SubscriptionData = InferTypeOf<typeof Subscription>