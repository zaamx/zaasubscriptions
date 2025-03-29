import { 
    AuthenticatedMedusaRequest, 
    MedusaResponse
  } from "@medusajs/framework";
  import SubscriptionModuleService from "../../../../../../modules/zaa-subscriptions/service";
  import { 
    SUBSCRIPTION_MODULE
  } from "../../../../../../modules/zaa-subscriptions";
  import { CreateSubscriptionData, SubscriptionStatus, SubscriptionInterval, CreateSubscriptionItemData } from "../../../../../../modules/zaa-subscriptions/types";
  import Subscription from "../../../../../../modules/zaa-subscriptions/models/subscription"
  
  interface UpdateSubscriptionInput {
    status?: SubscriptionStatus
    interval?: SubscriptionInterval
    period?: number
    subscription_date?: Date
    last_order_date?: Date
    items?: {
      id: string
      variant_id: string
      title: string
      quantity: number
      unit_price: number
      metadata: Record<string, unknown> | null
      subscription_id: string
      created_at: Date
      updated_at: Date
      deleted_at: Date | null
      subscription: {
        id: string
        status: SubscriptionStatus
        interval: SubscriptionInterval
        period: number
        subscription_date: Date
        last_order_date: Date
        next_order_date: Date
        expiration_date: Date
        metadata: Record<string, unknown> | null
        items: any[] // Using any[] since this could cause circular reference
        created_at: Date
        updated_at: Date
        deleted_at: Date | null
      }
    }[]
  }

  export const DELETE = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
  ) => {
    const subscriptionModuleService: SubscriptionModuleService =
      req.scope.resolve(SUBSCRIPTION_MODULE)
  
    const subscription = await subscriptionModuleService
      .cancelSubscriptions(
        req.params.id
      )
  
    res.json({
      subscription
    })
  }

  export const GET = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
  ) => {
    const subscriptionModuleService: SubscriptionModuleService =
      req.scope.resolve(SUBSCRIPTION_MODULE)

    const subscription = await subscriptionModuleService
      .getSubscription(
        req.params.id
      )
    // console.log('subscription', JSON.stringify(subscription, null, 2))

    res.json({
      subscription
    })
  }

  export const PUT = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
  ) => {
    const subscriptionModuleService: SubscriptionModuleService =
      req.scope.resolve(SUBSCRIPTION_MODULE)
    console.log('initial body', JSON.stringify(req.body, null, 2))
    const subscription = await subscriptionModuleService
      .updateSubscription(
        req.params.id,
        req.body as UpdateSubscriptionInput
      )

    res.json({
      subscription
    })
  }