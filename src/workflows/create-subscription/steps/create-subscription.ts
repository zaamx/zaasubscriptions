import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { LinkDefinition } from "@medusajs/framework/types"
import { CreateSubscriptionData } from "../../../modules/zaa-subscriptions/types"
import SubscriptionModuleService from "../../../modules/zaa-subscriptions/service"
import { SUBSCRIPTION_MODULE } from "../../../modules/zaa-subscriptions"


type StepInput = {
    customer_id: string
    subscription_data: CreateSubscriptionData
}

const createSubscriptionStep = createStep(
    "create-subscription",
    async ({ 
      customer_id,
      subscription_data
    }: StepInput, { container }) => {
      const subscriptionModuleService: SubscriptionModuleService = 
        container.resolve(SUBSCRIPTION_MODULE)
        console.log('subscription_data', JSON.stringify(subscription_data, null, 2))
        console.log('customer_id', customer_id)
      const linkDefs: LinkDefinition[] = []
  
      const subscription = await subscriptionModuleService.createSubscriptions({
        ...subscription_data,
        metadata: {
          ...subscription_data.metadata
        }
      })
  
      //   linkDefs.push({
      //     [SUBSCRIPTION_MODULE]: {
      //       "subscription_id": subscription[0].id
      //     },
      //     [Modules.ORDER]: {
      //       "order_id": order_id
      //     }
      //   })
    
      //   linkDefs.push({
      //     [SUBSCRIPTION_MODULE]: {
      //       "subscription_id": subscription[0].id
      //     },
      //     [Modules.CART]: {
      //       "cart_id": cart_id
      //     }
      //   })
  
      if (customer_id) {
        linkDefs.push({
          [SUBSCRIPTION_MODULE]: {
            "subscription_id": subscription[0].id
          },
          [Modules.CUSTOMER]: {
            "customer_id": customer_id
          }
        })
      } 
  
      return new StepResponse({
        subscription: subscription[0],
        linkDefs
      }, {
        subscription: subscription[0]
      })
    }, async (data, { container }) => {
        if (!data) return
        const subscriptionModuleService: SubscriptionModuleService = 
        container.resolve(SUBSCRIPTION_MODULE)
  
      await subscriptionModuleService.cancelSubscriptions(data.subscription.id)
    }
  )
  
  export default createSubscriptionStep