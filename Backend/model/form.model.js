const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  approval: {
    type: Number
  }
});

const registerModel = mongoose.model('register', userSchema); 

const loginSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  regid: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "regType", 
    required: true
  },
  regType: {
    type: String,
    enum: ["register"], 
    required: true
  },
  status: {
    type: Number
  },
  usertype: {
    type: Number,
    required: true
  }
});

const loginModel = mongoose.model('login', loginSchema);

const accountSchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: "register", required: true },
  accountName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  bankName: { type: String, required: true },
  branch: { type: String, required: true },
  deposit: { type: Number, default: 0 },
  status: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
const accountModel = mongoose.model('Account', accountSchema);

// const groupSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: { type: String },

//   admin: { type: mongoose.Schema.Types.ObjectId, ref: "login", required: true },

//   members: [
//     {
//       userId: { type: mongoose.Schema.Types.ObjectId, ref: "login" },
//       profileRef: { type: mongoose.Schema.Types.ObjectId, ref: "register" } // ✅ fixed
//     }
//   ],

//   createdAt: { type: Date, default: Date.now }
// });

// const groupModel = mongoose.model("group", groupSchema);

// const groupSchema = new mongoose.Schema({
//   name: {type:String, required:true},
//   description: {type:String},
//   admin: { type: mongoose.Schema.Types.ObjectId, ref: "register" },
//   members: [{ type: mongoose.Schema.Types.ObjectId, ref: "register" }],
//   activityFeed: [
//     {
//       action: String,   // e.g. "Expense Added", "Member Joined"
//       by: { type: mongoose.Schema.Types.ObjectId, ref: "register" },
//       date: { type: Date, default: Date.now }
//     }
//   ]
// });

// const groupModel = mongoose.model("group", groupSchema);


const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,

  admin: { type: mongoose.Schema.Types.ObjectId, ref: "login", required: true },

  // Members of the group
  members: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "login", // reference the loginModel
        required: true
      },
      profileRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "register" // reference the registerModel for profile details
      }
    }
  ],

  // Active feed for the group
  feed: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "login",
        required: true
      },
      message: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const groupModel = mongoose.model("group", groupSchema);

const expenseSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "group", required: true },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "login", required: true }, // who paid
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  splitType: { type: String, enum: ["equal", "percentage", "custom"], default: "equal" },
  splits: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "login" },
      share: { type: Number } // share in amount or %
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const expenseModel = mongoose.model("expense", expenseSchema);

const settlementSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "group", required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: "login", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "login", required: true },
  amount: { type: Number, required: true },
  settledAt: { type: Date, default: Date.now }
});

const settlementModel = mongoose.model("settlement", settlementSchema);

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "settlement" }, // optional now
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  },
  { timestamps: true }
);

const paymentModel=mongoose.model("payment",paymentSchema)
// serviceModel//
const serviceSchema = new mongoose.Schema({
  serviceType: {
    type: String,
    required: true,
    enum: [
      'electricity_bill',
      'water_bill', 
      'mobile_recharge',
      'wifi_bill',
      'gas_bill',
      'dth_payment',
      'credit_card_payment',
      'loan_emi',
      'education_fee',
      'hospital_bill',
      'bus_booking',
      'flight_booking',
      'google_pay',
      'house_rent',
      'paytm',
      'amazon_pay',
      'online_shopping',
      'gaming',
      'movie_tickets',
      'music_streaming',
      'book_store',
      'food_delivery',
      'cab_booking'
    ]
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous payments
  },

  serviceDetails: {
    type: mongoose.Schema.Types.Mixed, // Flexible schema for different service types
    required: true
    // Examples:
    // For electricity: { state, board, consumerNumber, amount }
    // For mobile: { operator, mobileNumber, amount, rechargeType }
    // For water: { authority, connectionId, amount }
  },

  amount: {
    type: Number,
    required: true,
    min: [1, 'Amount must be greater than 0']
  },

  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },

  transactionId: {
    type: String,
    unique: true,
    sparse: true // Allow null values but ensure uniqueness when present
  },

  paymentMethod: {
    type: String,
    enum: ['razorpay', 'upi', 'netbanking', 'credit_card', 'debit_card', 'wallet'],
    default: 'razorpay'
  },

  razorpayOrderId: {
    type: String,
    required: false
  },

  razorpayPaymentId: {
    type: String,
    required: false
  },

  razorpaySignature: {
    type: String,
    required: false
  },

  failureReason: {
    type: String,
    required: false
  },

  refundAmount: {
    type: Number,
    default: 0
  },

  refundReason: {
    type: String,
    required: false
  },

  serviceFee: {
    type: Number,
    default: 0,
    min: 0
  },

  discount: {
    type: Number,
    default: 0,
    min: 0
  },

  couponCode: {
    type: String,
    required: false
  },

  receipt: {
    receiptNumber: {
      type: String,
      required: false
    },
    receiptUrl: {
      type: String,
      required: false
    }
  },

  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
    // Store additional service-specific data
    // For example: plan details for mobile recharge, validity dates, etc.
  }

}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});
const serviceModel = mongoose.model('Service', serviceSchema);

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["GROUP_CREATED", "EXPENSE_ADDED", "SERVICE_PAID", "MEMBER_ADDED","SETTLEMENT_SUGGESTED"],
    required: true
  },
  message: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "login", required: true }, // receiver
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "group" },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const notificationModel = mongoose.model("notification", notificationSchema);

module.exports = { registerModel, loginModel,accountModel,groupModel,expenseModel,settlementModel,paymentModel,serviceModel,notificationModel };
