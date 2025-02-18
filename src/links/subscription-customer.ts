import { defineLink } from "@medusajs/framework/utils"
import SubscriptionModule from "../modules/zaa-subscriptions"
import CustomerModule from "@medusajs/medusa/customer"

/**
 * A user has multiple subscriptions  Only one active for default via the frontend
 */
export default defineLink(
  {
    linkable: SubscriptionModule.linkable.subscription,
    isList: true
  },
  CustomerModule.linkable.customer
)