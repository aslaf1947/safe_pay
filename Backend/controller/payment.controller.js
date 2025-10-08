const {settlementModel,paymentModel,accountModel,loginModel} = require('../model/form.model');
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const {serviceId}=req.params;
    const options = {
      amount, // Razorpay expects paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { fromId, toId, amount } = req.body;

    const payerAccount = await accountModel.findOne({ userid: fromId, status: 1 });
    const receiverAccount = await accountModel.findOne({ userid: toId, status: 1 });

    if (!payerAccount || !receiverAccount) {
      return res.status(400).json({ success: false, message: "Both accounts must be verified." });
    }

    if (payerAccount.deposit < amount) {
      return res.status(400).json({ success: false, message: "Insufficient funds ❌" });
    }

    // Deduct & Add
    payerAccount.deposit -= amount;
    receiverAccount.deposit += amount;

    await payerAccount.save();
    await receiverAccount.save();

    const settlement = await settlementModel.create({
  groupId: req.params.groupId,
  from: fromId,
  to: toId,
  amount
});

await paymentModel.create({
  bookingId: settlement._id,
  razorpay_order_id: req.body.razorpay_order_id,
  razorpay_payment_id: req.body.razorpay_payment_id,
  razorpay_signature: req.body.razorpay_signature,
  status: "success"
});

    // Send email to payer
    const payerUser = await loginModel.findById(fromId).populate("regid");
    if (payerUser && payerUser.email) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "jobcraft1947@gmail.com",
          pass: "qtdj vhsv ounj xsmd", // App Password
        },
        tls: { rejectUnauthorized: false },
      });

      const mailOptions = {
        from: `"SafePay Team" <jobcraft1947@gmail.com>`,
        to: payerUser.email,
        subject: "Payment Successful - SafePay",
        html: `
          <h3>Hello ${payerUser.regid?.name || "User"},</h3>
          <p>Your payment of <strong>₹${amount}</strong> to settle up in group has been <b>successful</b>.</p>
          <ul>
            <li>Receiver User ID: ${toId}</li>
            <li>New Deposit Balance: ₹${payerAccount.deposit}</li>
          </ul>
          <p>Thank you for using SafePay!</p>
        `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Email sending failed:", err);
        } else {
          console.log("Payment success email sent:", info.response);
        }
      });
    }

    res.json({ success: true, message: "Settlement completed successfully ✅" });
  } catch (err) {
    console.error("❌ Error in verifyPayment:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
