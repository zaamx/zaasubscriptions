import { 
    AuthenticatedMedusaRequest, 
    MedusaResponse
  } from "@medusajs/framework";
  import SubscriptionModuleService from "../../../../../modules/zaa-subscriptions/service";
  import { 
    SUBSCRIPTION_MODULE
  } from "../../../../../modules/zaa-subscriptions";
  import { CreateSubscriptionData } from "../../../../../modules/zaa-subscriptions/types";
  import createSubscriptionWorkflow from "../../../../../workflows/create-subscription"
import { json } from "stream/consumers";
  
  export const POST = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
  ) => {

    const body = req.body as CreateSubscriptionData
    const customer_id = req.auth_context?.actor_id

    const { result } = await createSubscriptionWorkflow(
        req.scope
    ).run({
        input: {
            customer_id,
            subscription_data: body
        }
    })

    res.json(result)
  }

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve("query")
  const customer_id = req.auth_context?.actor_id

  const { data: [customer] } = await query.graph({
    entity: "customer",
    fields: [
      "subscriptions.*",
    ],
    filters: {
      id: [customer_id],
    },
  })
  // console.log('customer', JSON.stringify(customer, null, 2))

  res.json(customer)
}