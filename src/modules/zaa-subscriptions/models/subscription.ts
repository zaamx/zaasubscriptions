import { model } from "@medusajs/framework/utils"
import { SubscriptionInterval, SubscriptionStatus } from "../types"
import SubscriptionItem from "./subscription-item"

const Subscription = model.define("subscription", {
  id: model.id().primaryKey(),
  status: model.enum(SubscriptionStatus)
    .default(SubscriptionStatus.ACTIVE),
  interval: model.enum(SubscriptionInterval),
  period: model.number(),
  subscription_date: model.dateTime(),
  last_order_date: model.dateTime(),
  next_order_date: model.dateTime().index().nullable(),
  expiration_date: model.dateTime().index(),
  metadata: model.json().nullable(),
  items: model.hasMany(() => SubscriptionItem)
})

export default Subscription