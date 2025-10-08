const {registerModel,loginModel,accountModel,groupModel,expenseModel,settlementModel,serviceModel, notificationModel}=require('../model/form.model')
const path=require("path")
const nodemailer = require("nodemailer");


const Razorpay = require("razorpay");
const crypto = require("crypto");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Utility: Generate unique transaction ID
const generateTransactionId = () => {
  return "TXN-" + crypto.randomBytes(8).toString("hex").toUpperCase();
};

/**
 * Create Razorpay order
 */
exports.createServicePayment = async (req, res) => {
  try {
    const { serviceType, serviceDetails, amount, userId } = req.body;
    console.log("Request body:", req.body);

    if (!serviceType || !serviceDetails || !amount) {
      return res.status(400).json({
        success: false,
        message: "Service type, details, and amount are required",
      });
    }

    const amountInPaise = Number(amount) * 100;

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: generateTransactionId(),
      notes: { serviceType, userId: userId || "Guest" },
    });

    const newService = new serviceModel({
      serviceType,
      userId: userId || null,
      serviceDetails,
      amount,
      paymentMethod: "razorpay",
      transactionId: razorpayOrder.receipt,
      razorpayOrderId: razorpayOrder.id,
      status: "pending",
    });
   
     if (userId) {
      const notification = new notificationModel({
        type: "SERVICE_PAID",
        userId,
        message: `Your payment for "${serviceType}" of ₹${amount} is pending.`,
        link: `/service/${newService._id}`
      });
      await notification.save();
    }
    await newService.save();

    return res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",
      order: razorpayOrder,
      serviceId: newService._id,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

/**
 * Verify Razorpay payment
 */
// exports.verifyServicePayment = async (req, res) => {
//   try {
//     const { razorpayOrderId, razorpayPaymentId, razorpaySignature, serviceId } = req.body;

//     if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required Razorpay payment fields",
//       });
//     }

//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(razorpayOrderId + "|" + razorpayPaymentId)
//       .digest("hex");

//     if (generatedSignature !== razorpaySignature) {
//       return res.status(400).json({
//         success: false,
//         message: "Payment signature verification failed",
//       });
//     }

//     const updatedService = await serviceModel.findByIdAndUpdate(
//       serviceId,
//       {
//         status: "completed",
//         razorpayPaymentId,
//         razorpaySignature,
//       },
//       { new: true }
//     );

//     if (!updatedService) {
//       return res.status(404).json({
//         success: false,
//         message: "Service not found for updating payment",
//       });
//     }

//     return res.json({
//       success: true,
//       message: "Payment verified and service marked as completed",
//       data: updatedService,
//     });
//   } catch (error) {
//     console.error("Error verifying Razorpay payment:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to verify payment",
//       error: error.message,
//     });
//   }
// };
exports.verifyServicePayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, serviceId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !serviceId) {
      return res.status(400).json({
        success: false,
        message: "Missing required Razorpay payment fields",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    // Find the service and user account
    const service = await serviceModel.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found for updating payment",
      });
    }

    const account = await accountModel.findOne({ userid: service.userId, status: 1 });
    if (!account) {
      return res.status(400).json({
        success: false,
        message: "User account not found or not active",
      });
    }

    // Check deposit
    if (account.deposit < service.amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient deposit balance",
      });
    }

    // Deduct bill amount from deposit
    account.deposit -= service.amount;
    await account.save();

    // Mark service as completed
    const updatedService = await serviceModel.findByIdAndUpdate(
      serviceId,
      {
        status: "completed",
        razorpayPaymentId,
        razorpaySignature,
      },
      { new: true }
    );
      if (service.userId) {
      const notification = new notificationModel({
        type: "SERVICE_PAID",
        userId: service.userId,
        message: `Your payment for "${service.serviceType}" of ₹${service.amount} was successful.`,
        link: `/service/${service._id}`
      });
      await notification.save();
    }

    return res.json({
      success: true,
      message: "Payment verified, deposit deducted, and service marked as completed",
      data: updatedService,
      deposit: account.deposit
    });
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message,
    });
  }
};
/**
 * Get all services/payments for a user
 */
exports.getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;

    const services = await serviceModel.find({ userId }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user payments",
      error: error.message,
    });
  }
};
