import Stripe from "stripe";

// Verifica se a chave existe para não quebrar o build da Vercel
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Aviso: STRIPE_SECRET_KEY não está configurada.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20", // Versão atual da API
  appInfo: {
    name: "SmartRS",
    version: "1.0.0",
  },
});
