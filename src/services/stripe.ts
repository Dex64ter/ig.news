// Parte do Stripe voltada para o Back-end

import Stripe from 'stripe';
import { version } from "../../package.json";

export const stripe = new Stripe(
  process.env.STRIPE_API_KEY || "",
  {
    apiVersion: "2023-08-16",
    appInfo: {
      name: "Ignews",
      version,
    },
  }
)