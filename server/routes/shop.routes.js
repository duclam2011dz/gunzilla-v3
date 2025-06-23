import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRODUCTS = {
    noads: { name: "Gỡ quảng cáo", price: 500 },
    skin_lava: { name: "Skin Lava", price: 300 },
    skin_neon: { name: "Skin Neon", price: 300 },
    skin_blackhole: { name: "Skin Black Hole", price: 300 },
    skin_galaxy: { name: "Skin Galaxy", price: 300 }
};

router.post("/create-checkout-session", async (req, res) => {
    const { productId } = req.body;
    const product = PRODUCTS[productId];
    if (!product) return res.status(400).json({ error: "Sản phẩm không tồn tại" });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name
                    },
                    unit_amount: product.price
                },
                quantity: 1
            }
        ],
        mode: "payment",
        success_url: `http://localhost:3000/templates/shop.html?success=true&product=${productId}`,
        cancel_url: `http://localhost:3000/templates/shop.html?canceled=true&product=${productId}`
    });

    res.json({ sessionId: session.id, publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

export default router;