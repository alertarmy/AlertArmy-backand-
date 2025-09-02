const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const PG_CLIENT_ID = process.env.CF_CLIENT_ID;
const PG_CLIENT_SECRET = process.env.CF_CLIENT_SECRET;
const PAYOUT_CLIENT_ID = process.env.CF_PAYOUT_CLIENT_ID;
const PAYOUT_CLIENT_SECRET = process.env.CF_PAYOUT_CLIENT_SECRET;

app.post("/create-order", async (req, res) => {
  try {
    const { amount, customerId, email, phone } = req.body;
    const orderId = "order_" + Date.now();

    const response = await axios.post(
      "https://api.cashfree.com/pg/orders",
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: customerId,
          customer_email: email,
          customer_phone: phone,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2022-09-01",
          "x-client-id": PG_CLIENT_ID,
          "x-client-secret": PG_CLIENT_SECRET,
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).send("Order creation failed");
  }
});

app.post("/withdraw", async (req, res) => {
  try {
    const { transferId, amount, upiId } = req.body;

    const authResp = await axios.post(
      "https://payout-api.cashfree.com/payout/v1/authorize",
      {},
      {
        headers: {
          "X-Client-Id": PAYOUT_CLIENT_ID,
          "X-Client-Secret": PAYOUT_CLIENT_SECRET,
        },
      }
    );
    const token = authResp.data.data.token;

    const response = await axios.post(
      "https://payout-api.cashfree.com/payout/v1/requestTransfer",
      {
        beneId: "user_" + transferId,
        transferId: transferId,
        amount: String(amount),
        transferMode: "upi",
        remarks: "Tournament winnings",
        upi: { vpa: upiId },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).send("Withdrawal failed");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
