import { MedusaService } from "@medusajs/framework/utils"
import Subscription from "./models/subscription";
import SubscriptionItem from "./models/subscription-item";
import { 
  CreateSubscriptionData, 
  SubscriptionData, 
  SubscriptionInterval, 
  SubscriptionStatus,
  CreateSubscriptionItemData
} from "./types";
import moment from "moment";

class SubscriptionModuleService extends MedusaService({
  Subscription,
  SubscriptionItem,
}) {
  // @ts-expect-error
  async createSubscriptions(
    data: CreateSubscriptionData | CreateSubscriptionData[]
  ): Promise<SubscriptionData[]> {
    const input = Array.isArray(data) ? data : [data]

    const subscriptions = await Promise.all(
      input.map(async (subscription) => {
        const subscriptionDate = subscription.subscription_date || new Date()
        const expirationDate = this.getExpirationDate({
          subscription_date: subscriptionDate,
          interval: subscription.interval,
          period: subscription.period
        })

        // Create the subscription first
        const createdSubscription = await super.createSubscriptions({
          ...subscription,
          subscription_date: subscriptionDate,
          last_order_date: subscriptionDate,
          next_order_date: this.getNextOrderDate({
            last_order_date: subscriptionDate,
            expiration_date: expirationDate,
            interval: subscription.interval,
            period: subscription.period
          }),
          expiration_date: expirationDate,
          metadata: subscription.metadata || {}
        })
        // console.log('createdSubscription', JSON.stringify(createdSubscription, null, 2))

        // If subscription items are provided, create them
        if (subscription.items && subscription.items.length > 0) {
          try {
            // First remove any existing items to avoid conflicts
            // await this.removeSubscriptionItems(createdSubscription.id)
            
            const subscriptionItems = await Promise.all(
              subscription.items.map(async (item) => {
                return await this.createSubscriptionItem({
                  subscription: createdSubscription.id,
                  variant_id: item.variant_id,
                  title: item.title,
                  quantity: item.quantity,
                  unit_price: item.unit_price,
                  metadata: item.metadata || {}
                })
              })
            )

            // Attach items to the subscription
            // await this.updateSubscription(createdSubscription.id, {
            //   items: subscriptionItems
            // })
          } catch (error) {
            // If there's an error creating items, cancel the subscription
            await this.cancelSubscriptions(createdSubscription.id)
            throw error
          }
        }

        return createdSubscription
      })
    )
    
    return subscriptions
  }

  async createSubscriptionItem(data: CreateSubscriptionItemData) {
    return await super.createSubscriptionItems({
      ...data,
      metadata: data.metadata || {}
    })
  }

  async recordNewSubscriptionOrder(id: string): Promise<SubscriptionData[]> {
    const subscription = await this.retrieveSubscription(id)

    const orderDate = new Date()

    return await this.updateSubscriptions({
      id,
      last_order_date: orderDate,
      next_order_date: this.getNextOrderDate({
        last_order_date: orderDate,
        expiration_date: subscription.expiration_date,
        interval: subscription.interval,
        period: subscription.period
      })
    })
  }

  async expireSubscription(id: string | string[]): Promise<SubscriptionData[]> {
    const input = Array.isArray(id) ? id : [id]

    return await this.updateSubscriptions({
      selector: {
        id: input
      },
      data: {
        next_order_date: null,
        status: SubscriptionStatus.EXPIRED
      }
    })
  }

  async cancelSubscriptions(
    id: string | string[]): Promise<SubscriptionData[]> {
    const input = Array.isArray(id) ? id : [id]

    return await this.updateSubscriptions({
      selector: {
        id: input
      },
      data: {
        next_order_date: null,
        status: SubscriptionStatus.CANCELED
      }
    })
  }

  getNextOrderDate({
    last_order_date,
    expiration_date,
    interval,
    period
  }: {
    last_order_date: Date
    expiration_date: Date
    interval: SubscriptionInterval,
    period: number
  }): Date | null {
    const nextOrderDate = moment(last_order_date)
      .add(
        period, 
        interval === SubscriptionInterval.WEEKLY ? 
          "week" : "month"
      )
    const expirationMomentDate = moment(expiration_date)

    // if next order date is after the expiration date, return
    // null. Otherwise, return the next order date.
    return nextOrderDate.isAfter(expirationMomentDate) ? 
      null : nextOrderDate.toDate()
  }

  getExpirationDate({
    subscription_date,
    interval,
    period
  }: {
    subscription_date: Date,
    interval: SubscriptionInterval,
    period: number
  }) {
    return moment(subscription_date)
      .add(
        period,
        interval === SubscriptionInterval.WEEKLY ?
          "week" : "month"
      ).toDate()
  }

  async updateSubscription(
    id: string,
    data: Partial<SubscriptionData>
  ): Promise<SubscriptionData> {
    // If we're updating items, we need to handle it specially
    console.log('data', JSON.stringify(data, null, 2))
    
    // Get current subscription to check for interval/period changes
    const currentSubscription = await this.getSubscription(id)
    
    // If interval or period is changing, recalculate dates
    if (data.interval || data.period) {
      const subscriptionDate = currentSubscription.subscription_date
      const lastOrderDate = currentSubscription.last_order_date
      
      // Calculate new expiration date
      const expirationDate = this.getExpirationDate({
        subscription_date: subscriptionDate,
        interval: data.interval || currentSubscription.interval,
        period: data.period || currentSubscription.period
      })

      // Calculate new next order date
      const nextOrderDate = this.getNextOrderDate({
        last_order_date: lastOrderDate,
        expiration_date: expirationDate,
        interval: data.interval || currentSubscription.interval,
        period: data.period || currentSubscription.period
      })

      // Add these to the update data
      data.expiration_date = expirationDate
      data.next_order_date = nextOrderDate
    }
    
    if (data.items) {
      try {
        // First remove existing items
        await this.removeSubscriptionItems(id)
        console.log('removed items')
        
        // Then create new items
        const subscriptionItems = await Promise.all(
          data.items.map(async (item) => {
            return await this.createSubscriptionItem({
              subscription: id,
              variant_id: item.variant_id,
              title: item.title,
              quantity: item.quantity,
              unit_price: item.unit_price,
              metadata: item.metadata || {}
            })
          })
        )
        console.log('subscriptionItems', JSON.stringify(subscriptionItems, null, 2))

        // Update the subscription with the new items
        const result = await this.updateSubscriptions({
          id,
          interval: data.interval,
          period: data.period,
          expiration_date: data.expiration_date,
          next_order_date: data.next_order_date,
          metadata: data.metadata || currentSubscription.metadata
        })
        console.log('result', JSON.stringify(result, null, 2))
        return result[0]
      } catch (error) {
        // If we get an error about item already existing, it might be because
        // the item was actually created successfully but the update failed
        // In this case, we can try to retrieve the subscription
        if (error.message?.includes('already exists')) {
          return await this.getSubscription(id)
        }
        throw error
      }
    }

    // For non-items updates, proceed as normal
    const result = await this.updateSubscriptions({
      id,
      interval: data.interval,
      period: data.period,
      expiration_date: data.expiration_date,
      next_order_date: data.next_order_date,
      metadata: data.metadata || currentSubscription.metadata
    })
    console.log('result', JSON.stringify(result, null, 2))
    return result[0]
  }

  async replaceSubscriptionItems(
    subscriptionId: string, 
    items: CreateSubscriptionItemData[]
  ): Promise<SubscriptionData> {
    // Delete existing items
    await this.removeSubscriptionItems(subscriptionId)
    
    // Create new items
    const subscriptionItems = await Promise.all(
      items.map(async (item) => {
        return await this.createSubscriptionItem({
          subscription: subscriptionId,
          variant_id: item.variant_id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          metadata: item.metadata || {}
        })
      })
    )

    // Update subscription with new items
    return await this.updateSubscription(subscriptionId, {
      items: subscriptionItems
    })
  }

  async removeSubscriptionItems(
    subscriptionId: string
  ): Promise<void> {
    console.log('removing items')
    await super.deleteSubscriptionItems({
      subscription: subscriptionId
    })
    
    // Update subscription to reflect empty items directly using updateSubscriptions
    await this.updateSubscriptions({
      selector: { id: subscriptionId },
      data: {
        items: []
      }
    })
  }

  async getSubscription(id: string): Promise<SubscriptionData> {
    return await this.retrieveSubscription(id, {
      relations: ["items"]
    })
  }

}

export default SubscriptionModuleService