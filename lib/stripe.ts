import Stripe from "stripe";

// Verifica se a chave existe para não quebrar o build da Vercel
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Aviso: STRIPE_SECRET_KEY não está configurada.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia", // Versão exata exigida pela biblioteca v17
  appInfo: {
    name: "SmartRS",
    version: "1.0.0",
  },
});
