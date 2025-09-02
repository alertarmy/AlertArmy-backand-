import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const CASHFREE_API_ID = process.env.CASHFREE_API_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const BASE_URL = "https://sandbox.cashfree.com/pg"; // live ke liye: https://api.cashfree.com/pg

app.post("/create-order", async (req, res) => {
  try {
    const { orderId, orderAmount, customerName, customerEmail, customerPhone } = req.body;

    const response = await axios.post(
      `${BASE_URL}/orders`,
      {
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: "INR",
        customer_details: {
          customer_id: customerPhone,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
      },
      {
        headers: {
          "x-client-id": CASHFREE_API_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Cashfree backend is running");
});

app.listen(10000, () => {
  console.log("✅ Server running on port 10000");
});
