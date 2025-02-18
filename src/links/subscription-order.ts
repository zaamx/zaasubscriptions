import { defineLink } from "@medusajs/framework/utils"
import SubscriptionModule from "../modules/zaa-subscriptions"
import OrderModule from "@medusajs/medusa/order"

/**
 * A subscription has multiple orders
 */
export default defineLink(
  SubscriptionModule.linkable.subscription,
  {
    linkable: OrderModule.linkable.order,
    isList: true
  }
)