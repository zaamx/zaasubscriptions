# ZAA Subscriptions medusa js v2 modules

This module manages a subscription system for medusajsV2

The core concepts:

A subscription is a data model that represents the required products (medusa product variants) that a user want to be ordered on a regular basis.

The subscription has this characteristics:

Check the types/index.ts for more details.
- status
- interval
- period
- subscription_date
- last_order_date
- next_order_date
- expiration_date
- metadata
  - region_id - related to medusa region
  - currency_code - related to medusa region / currency
  - user_shipping_method_id - related to medusa user shipping method
- items - related to models/subscription-item.ts
- user_id - related to medusa user via link to medusa user -- unique only one subscription per user
  - user_address_id - related to medusa user address
  - user_billing_address_id - related to medusa user billing address
  

- payment_method_id - related to models/payment-method.ts

The items are in the models/subscription-item.ts

- id    
- subscription_id
- variant_id
- title
- quantity
- unit_price
- metadata
- subscription

the payment method is in the models/payment-method.ts

- id
- user_id - related to medusa user
- medusa_payment_method_id - related to medusa payment method
- card_token_id
- metadata


The flow is the following:

1. The user creates a subscription
2. The user selects the products/items to be ordered in the subscription
3. The user registers its user address, billing address and shipping method, region and currency
4. The user selects the payment method via medusa payment flow and the payment method is created
5. the subscription its updated with all the parameters

Whe the date of the next order is reached, the subscription creates a medusa order with the items and the payment method. and auto process the payment with the payment method.

Then executes the update of the subscription with the new status, last_order_date, next_order_date, expiration_date.