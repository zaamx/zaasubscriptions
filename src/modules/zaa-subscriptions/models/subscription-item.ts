import { model } from "@medusajs/framework/utils"
import Subscription from "./subscription"

const SubscriptionItem = model.define("subscription_item", {
  id: model.id().primaryKey(),
  variant_id: model.text(),
  title: model.text(),
  quantity: model.number(),
  unit_price: model.number(),
  metadata: model.json().nullable(),
  subscription: model.belongsTo(() => Subscription, {
    mappedBy: "items"
  })
})

export default SubscriptionItem