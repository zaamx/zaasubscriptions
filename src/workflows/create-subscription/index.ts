import { 
    createWorkflow,
    WorkflowResponse
  } from "@medusajs/framework/workflows-sdk"
  import { 
    createRemoteLinkStep
  } from "@medusajs/medusa/core-flows"
  import { 
    CreateSubscriptionData
  } from "../../modules/zaa-subscriptions/types"
  import createSubscriptionStep from "./steps/create-subscription"
  
  type WorkflowInput = {
    customer_id: string,
    subscription_data: CreateSubscriptionData
  }
  
  const createSubscriptionWorkflow = createWorkflow(
    "create-subscription",
    (input: WorkflowInput) => {
  
      const { subscription, linkDefs } = createSubscriptionStep({
        customer_id: input.customer_id,
        subscription_data: input.subscription_data
      })
  
      createRemoteLinkStep(linkDefs)
  
      return new WorkflowResponse({
        subscription: subscription
      })
    }
  )
  
  export default createSubscriptionWorkflow