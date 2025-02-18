import { Module } from "@medusajs/framework/utils"
import SubscriptionModuleService from "./service"

export const SUBSCRIPTION_MODULE = "SubscriptionModuleService"

export default Module(SUBSCRIPTION_MODULE, {
  service: SubscriptionModuleService
})