const { registerModel, loginModel, accountModel, groupModel, expenseModel, settlementModel, paymentModel, serviceModel, notificationModel } = require('../model/form.model')
const path = require("path")
const bcrypt = require('bcryptjs')
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const PDFDocument = require('pdfkit');

exports.userReg = async (req, res) => {
  try {
    const originalPassword = req.body.password;
    const hashedPassword = await bcrypt.hash(originalPassword, 10);

    const userData = {
      name: req.body.name,
      phone: req.body.phone,
      approval: 0
    };
    const user = new registerModel(userData);
    await user.save();
    const login = {
      email: req.body.email,
      password: hashedPassword,
      regid: user._id,
      regType: 'register',
      usertype: 0,
    }
    await loginModel.create(login);
    res.json("User Registered Successfully")
  } catch (err) {
    console.error("Error", err);
    res.status(500).json("Registration Failed")
  }
}

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user in login collection
    const user = await loginModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password ❌" });
    }

    // compare password
    const pass = await bcrypt.compare(password, user.password);
    if (!pass) {
      return res.status(400).json({ message: "Invalid email or password ❌" });
    }

    // check user type
    if (user.usertype === 0 || user.usertype === 1) {
      return res.json({
        message: "Login successful ✅",
        user: {
          id: user._id,
          email: user.email,
          regType: user.regType,
          usertype: user.usertype,
          regid: user.regid,
        },
      });
    } else {
      return res.status(403).json({ message: "Access denied 🚫" });
    }
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.userProfile = async (req, res) => {
  try {
    const { userid } = req.body;
    // console.log("📥 UserID from request:", userid);

    if (!userid) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Find user and populate register details
    const loginUser = await loginModel.findById(userid).populate("regid");
    // console.log("👤 Login User:", loginUser);

    if (!loginUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Fetch bank accounts safely
    let accounts = [];
    if (loginUser.regid?._id) {
      accounts = await accountModel.find({ userid: loginUser._id });
    }

    res.json({
      success: true,
      user: loginUser,
      accounts: accounts || [], // Ensure always array
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// controllers/bankController.js
exports.verifyAccount = async (req, res) => {
  try {
    const { accountNumber, ifscCode } = req.body;

    // Input validation
    if (!accountNumber || !ifscCode) {
      return res.status(400).json({
        success: false,
        message: "Account number and IFSC code are required",
      });
    }

    // Simulate account verification
    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/; // Example IFSC validation
    if (accountNumber.length >= 9 && ifscPattern.test(ifscCode)) {
      return res.status(200).json({
        success: true,
        message: "Account verified successfully",
        data: {
          accountNumber,
          ifscCode,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid account number or IFSC code",
      });
    }
  } catch (error) {
    console.error("Error verifying account:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying account",
    });
  }
};

// exports.addBankAccount = async (req, res) => {
//   try {
//     const { userid, accountName, accountNumber, ifscCode, bankName, branch } = req.body;

//     const newAccount = new accountModel({
//       userid,
//       accountName,
//       accountNumber,
//       ifscCode,
//       bankName,
//       branch,
//     });

//     await newAccount.save();

//     res.status(201).json({
//       success: true,
//       message: "Bank account added successfully!",
//       data: newAccount,
//     });
//   } catch (error) {
//     console.error("Error adding bank account:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while adding account",
//     });
//   }
// };


exports.addBankAccount = async (req, res) => {
  try {
    const { userid, accountName, accountNumber, ifscCode, bankName, branch, deposit } = req.body;

    // Validate required fields
    if (!userid || !accountName || !accountNumber || !ifscCode || !bankName || !branch || !deposit) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Fetch user
    const loginUser = await loginModel.findById(userid).populate("regid");
    if (!loginUser) return res.status(404).json({ success: false, message: "User not found" });

    // Save bank account
    const newAccount = new accountModel({ userid, accountName, accountNumber, ifscCode, bankName, branch, deposit, status: 1 });
    await newAccount.save();

    // Setup transporter (hardcoded Gmail + App Password)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jobcraft1947@gmail.com",
        pass: "qtdj vhsv ounj xsmd", // App Password
      },
      tls: { rejectUnauthorized: false },
    });

    // Mail options (use same Gmail as sender)
    const mailOptions = {
      from: `"SafePay Team" <jobcraft1947@gmail.com>`,
      to: loginUser.email,
      subject: "Bank Account Added Successfully",
      html: `
        <h3>Hello ${loginUser.regid.name || "User"},</h3>
        <p>Your bank account has been successfully added to your SafePay profile.</p>
        <h4>Account Details:</h4>
        <ul>
          <li><strong>Account Holder:</strong> ${accountName}</li>
          <li><strong>Account Number:</strong> ${accountNumber}</li>
          <li><strong>IFSC Code:</strong> ${ifscCode}</li>
          <li><strong>Bank Name:</strong> ${bankName}</li>
          <li><strong>Branch:</strong> ${branch}</li>
          <li><strong>Deposit:</strong> ₹${deposit}</li>
        </ul>
        <p>If you did not perform this action, please contact support immediately.</p>
        <br>
        <p>Regards,</p>
        <p><strong>SafePay Team</strong></p>
      `,
    };

    // Send email with error logging
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Email sending failed:", err);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(201).json({
      success: true,
      message: "Bank account added and email notification sent (check console for email status).",
      data: newAccount,
    });
  } catch (error) {
    console.error("Error adding bank account:", error);
    res.status(500).json({ success: false, message: "Server error while adding account" });
  }
};

// Create Group
// exports.createGroup = async (req, res) => {
//   try {
//     const { name, description, admin, members } = req.body;

//     // Build members array with both login id and regid
//     const formattedMembers = members.map(m => ({
//       userId: m.userId,       // login table _id
//       profileRef: m.regid     // registration id
//     }));

//     // Admin should also be part of members
//     formattedMembers.push({ userId: admin.userId, profileRef: admin.regid });

//     const group = new groupModel({
//       name,
//       description,
//       admin: admin.userId,
//       members: formattedMembers
//     });

//     await group.save();
//     res.status(201).json({ success: true, group });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// exports.createGroup = async (req, res) => {
//   try {
//     const { name, description, admin, members, initialFeed } = req.body;

//     // Convert member IDs to ObjectId
//     const formattedMembers = members.map(m => ({
//       userId: mongoose.Types.ObjectId(m.userId),
//       profileRef: mongoose.Types.ObjectId(m.regid)
//     }));

//     // Include admin in members
//     formattedMembers.push({
//       userId: mongoose.Types.ObjectId(admin.userId),
//       profileRef: mongoose.Types.ObjectId(admin.regid)
//     });

//     // Format feed if provided
//     const feed = initialFeed
//       ? initialFeed.map(f => ({
//           userId: mongoose.Types.ObjectId(f.userId),
//           message: f.message
//         }))
//       : [];

//     const group = new groupModel({
//       name,
//       description,
//       admin: mongoose.Types.ObjectId(admin.userId),
//       members: formattedMembers,
//       feed
//     });

//     await group.save();
//     res.status(201).json({ success: true, group });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };


// exports.getUserGroups = async (req, res) => {
//   try {
//     const groups = await groupModel.find({ members: req.params.id })
//       .populate("admin", "name email")
//       .populate("members", "name email");
//     res.json(groups);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Get groups for a user
exports.getUserGroups = async (req, res) => {
  try {
    const groups = await groupModel.find({ "members.userId": req.params.userId })
      .populate("members.userId", "email regType")
      .populate("members.profileRef", "name phone"); // adjust fields to your reg model
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Fetch all users for group creation
// exports.getAllUsers = async (req, res) => {
//   try {
//     const users = await loginModel.find({ usertype: 0 }).populate('regid');
//     res.json(users.map(u => ({
//       _id: u._id,
//       email: u.email,
//       regid: u.regid?._id,
//       name: u.regid?.name,
//       phone: u.regid?.phone
//     })));
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.getAllUsers = async (req, res) => {
  try {
    const users = await loginModel
      .find({ usertype: 0 }) // only normal users, not admins
      .populate("regid"); // populate registration details

    res.json(
      users.map((u) => ({
        _id: u._id,
        email: u.email,
        regid: u.regid?._id,
        name: u.regid?.name,
        phone: u.regid?.phone,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// controllers/groupController.js
// exports.getGroupById = async (req, res) => {
//   try {
//     const group = await groupModel
//       .findById(req.params.groupId)
//       .populate("members.userId", "email")       // optional
//       .populate("members.profileRef", "name");  // populate the name

//     if (!group) return res.status(404).json({ error: "Group not found" });

//     res.json(group);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };



// Add Expense

// exports.getGroupById = async (req, res) => {
//   try {
//     const group = await groupModel
//       .findById(req.params.groupId)
//       .populate("members.userId", "email")       // members' emails
//       .populate("members.profileRef", "name")   // members' names
//       .populate("admin", "email");              // populate admin email

//     if (!group) return res.status(404).json({ error: "Group not found" });

//     // Separate admin explicitly
//     const admin = group.admin;  // this is populated now
//     const members = group.members.filter(m => m.userId._id.toString() !== admin._id.toString());

//     res.json({
//       ...group.toObject(),
//       admin,
//       members
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

exports.getGroupById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.groupId)) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    const group = await groupModel
      .findById(req.params.groupId)
      .populate("members.userId", "email")
      .populate("members.profileRef", "name")
      .populate("admin", "email");

    if (!group) return res.status(404).json({ error: "Group not found" });

    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// exports.addExpense = async (req, res) => {
//   try {
//     const { groupId, paidBy, amount, description, splitType, splits } = req.body;

//     // If equal split, auto-calc shares
//     let finalSplits = splits;
//     if (splitType === "equal" && splits.length > 0) {
//       const perHead = amount / splits.length;
//       finalSplits = splits.map(s => ({ ...s, share: perHead }));
//     }

//     const expense = new expenseModel({
//       groupId,
//       paidBy,
//       amount,
//       description,
//       splitType,
//       splits: finalSplits
//     });

//     await expense.save();
//     res.status(201).json({ success: true, expense });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// Get Expenses of a Group

exports.addExpense = async (req, res) => {
  try {
    const { groupId, paidBy, amount, description, splitType, splits } = req.body;

    // Calculate splits as before...
    let finalSplits = splits;
    if (splitType === "equal" && splits.length > 0) {
      const perHead = amount / splits.length;
      finalSplits = splits.map(s => ({ ...s, share: perHead }));
    } else if (splitType === "percentage" && splits.length > 0) {
      finalSplits = splits.map(s => ({
        userId: s.userId,
        share: (amount * (s.percent || 0)) / 100
      }));
    }
    // For custom, frontend must send [{ userId, share }]

    // Save the expense
    const expense = new expenseModel({
      groupId,
      paidBy,
      amount,
      description,
      splitType,
      splits: finalSplits
    });
    await expense.save();

    // Add a feed entry to the group
    let feedMessage = "Expense added";
    if (splitType === "equal") {
      feedMessage = `Expense "${description}" added and split equally.`;
    } else if (splitType === "percentage") {
      feedMessage = `Expense "${description}" added and split by percentage.`;
    } else if (splitType === "custom") {
      feedMessage = `Expense "${description}" added with custom split.`;
    }

    await groupModel.findByIdAndUpdate(
      groupId,
      {
        $push: {
          feed: {
            userId: paidBy,
            message: feedMessage,
            createdAt: new Date()
          }
        }
      }
    );
 // Send notifications to all split users except the payer
    for (const split of finalSplits) {
      if (split.userId.toString() !== paidBy.toString()) {
        await notificationModel.create({
          type: "EXPENSE_ADDED",
          userId: split.userId,
          groupId,
          message: `A new expense "${description}" was added in your group.`,
        });
      }
    }
    res.status(201).json({ success: true, expense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.getGroupExpenses = async (req, res) => {
  try {
    const expenses = await expenseModel.find({ groupId: req.params.groupId })
      .populate("paidBy", "email")
      .populate("splits.userId", "email");
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// controllers/userController.js
// exports.getUserBalances = async (req, res) => {
//   try {
//     const userId = req.params.userId;

//     if (!userId) {
//       return res.status(400).json({ error: "User ID is required" });
//     }
//     const userAccount = await accountModel.findOne({ userid: userId, status: 1 });
//     const expenses = await expenseModel
//       .find({ $or: [{ "splits.userId": userId }, { paidBy: userId }] })
//       .populate({
//         path: "paidBy",
//         select: "email regid",
//         populate: { path: "regid", model: "register", select: "name" }
//       })
//       .populate({
//         path: "splits.userId",
//         select: "email regid",
//         populate: { path: "regid", model: "register", select: "name" }
//       });

//     let balances = {};

//     expenses.forEach(exp => {
//       exp.splits.forEach(split => {
//         const splitUserId = split.userId._id.toString();
//         const paidById = exp.paidBy._id.toString();
//         const share = Number(split.share) || 0;

//         if (splitUserId === userId && paidById !== userId) {
//           // You owe someone
//           balances[paidById] = (balances[paidById] || 0) + share;
//         } else if (paidById === userId && splitUserId !== userId) {
//           // Someone owes you
//           balances[splitUserId] = (balances[splitUserId] || 0) - share;
//         }
//       });
//     });

//     // Convert balances object to array
//     const result = Object.entries(balances).map(([otherUserId, amount]) => {
//       // Find user info
//       const splitUser = expenses
//         .flatMap(e => e.splits)
//         .find(s => s.userId._id.toString() === otherUserId);

//       const paidByUser = expenses.find(e => e.paidBy._id.toString() === otherUserId)?.paidBy;

//       const userInfo = splitUser?.userId || paidByUser || { name: "Unknown", email: "Unknown" };

//       return {
//         userId: otherUserId,
//         name: userInfo.regid?.name || "Unknown",
//         email: userInfo.email || "Unknown",
//         amount: Number(amount)
//       };
//     });

//     res.json({
//       balances: result,
//       deposit: userAccount ? userAccount.deposit : 0
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };

exports.getUserBalances = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const userAccount = await accountModel.findOne({ userid: userId, status: 1 });
    const expenses = await expenseModel
      .find({ $or: [{ "splits.userId": userId }, { paidBy: userId }] })
      .populate({
        path: "paidBy",
        select: "email regid",
        populate: { path: "regid", model: "register", select: "name" }
      })
      .populate({
        path: "splits.userId",
        select: "email regid",
        populate: { path: "regid", model: "register", select: "name" }
      });

    let balances = {};

    expenses.forEach(exp => {
      exp.splits.forEach(split => {
        // Check for null before accessing _id
        if (!split.userId || !exp.paidBy) return;
        const splitUserId = split.userId._id?.toString();
        const paidById = exp.paidBy._id?.toString();
        const share = Number(split.share) || 0;

        if (splitUserId === userId && paidById !== userId) {
          // You owe someone
          balances[paidById] = (balances[paidById] || 0) + share;
        } else if (paidById === userId && splitUserId !== userId) {
          // Someone owes you
          balances[splitUserId] = (balances[splitUserId] || 0) - share;
        }
      });
    });

    // Convert balances object to array
    const result = Object.entries(balances).map(([otherUserId, amount]) => {
      // Find user info
      const splitUser = expenses
        .flatMap(e => e.splits)
        .find(s => s.userId && s.userId._id?.toString() === otherUserId);

      const paidByUser = expenses.find(e => e.paidBy && e.paidBy._id?.toString() === otherUserId)?.paidBy;

      const userInfo = splitUser?.userId || paidByUser || { regid: { name: "Unknown" }, email: "Unknown" };

      return {
        userId: otherUserId,
        name: userInfo.regid?.name || "Unknown",
        email: userInfo.email || "Unknown",
        amount: Number(amount)
      };
    });

    res.json({
      balances: result,
      deposit: userAccount ? userAccount.deposit : 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
exports.deleteAccount = async (req, res) => {
  try {
    const { accId } = req.body; // Get accId from body

    if (!accId) {
      return res.status(400).json({ success: false, message: "Account ID is required" });
    }

    const deletedAccount = await accountModel.findByIdAndDelete(accId);

    if (!deletedAccount) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    return res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting account:", error);
    return res.status(500).json({ success: false, message: "Server error while deleting account" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userid, name, email, phone } = req.body;

    if (!userid) return res.status(400).json({ success: false, message: "User ID is required" });

    const user = await loginModel.findById(userid);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Update login email if changed
    if (email) user.email = email;

    // Update registration info (name & phone)
    if (user.regid) {
      const regUser = await registerModel.findById(user.regid); // always fetch regid document
      if (regUser) {
        if (name) regUser.name = name;
        if (phone) regUser.phone = phone;
        await regUser.save();
      }
    }

    await user.save();

    return res.status(200).json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getGroupBalances = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Fetch group and members
    const group = await groupModel.findById(groupId).populate("members.profileRef");
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Fetch group expenses and settlements
    const expenses = await expenseModel.find({ groupId });
    const settlements = await settlementModel.find({ groupId });

    let memberData = {};

    // Initialize each member
    group.members.forEach(m => {
      memberData[m.userId.toString()] = {
        userId: m.userId,
        name: m.profileRef?.name || "Unknown",
        email: m.profileRef?.email || "",
        paid: 0,
        share: 0,
        balance: 0
      };
    });

    let totalExpense = 0;

    // 1️⃣ Apply Expenses
    expenses.forEach(exp => {
      totalExpense += exp.amount;

      // Who paid the bill
      memberData[exp.paidBy].paid += exp.amount;

      // How the bill is split
      exp.splits.forEach(s => {
        memberData[s.userId].share += s.share;
      });
    });

    // 2️⃣ Calculate Initial Balances (based only on expenses)
    Object.values(memberData).forEach(m => {
      m.balance = m.paid - m.share;
    });

    // 3️⃣ Apply Settlements
    settlements.forEach(s => {
      if (memberData[s.from]) {
        memberData[s.from].balance += s.amount; // payer owes less
      }
      if (memberData[s.to]) {
        memberData[s.to].balance -= s.amount;   // receiver is owed less
      }
    });

    // 4️⃣ Send Final Response
    res.json({
      groupName: group.name,
      totalExpense,
      members: Object.values(memberData)
    });
  } catch (err) {
    console.error("Error in getGroupBalances:", err);
    res.status(500).json({ error: err.message });
  }
};


//  exports.getGroupSettlement = async (req, res) => {
//   try {
//     const { groupId } = req.params;

//     const group = await groupModel.findById(groupId).populate("members.profileRef");
//     if (!group) return res.status(404).json({ message: "Group not found" });

//     const expenses = await expenseModel.find({ groupId });
//     const existingSettlements = await settlementModel.find({ groupId });

//     // Step 1: Build balances
//     let balances = {};
//     group.members.forEach(m => {
//       balances[m.userId.toString()] = {
//         userId: m.userId,
//         name: m.profileRef?.name || "Unknown",
//         email: m.profileRef?.email || "",
//         balance: 0
//       };
//     });

//     // Apply expenses
//     expenses.forEach(exp => {
//       balances[exp.paidBy].balance += exp.amount;
//       exp.splits.forEach(s => {
//         balances[s.userId].balance -= s.share;
//       });
//     });

//     // Apply already completed settlements
//     existingSettlements.forEach(s => {
//       if (balances[s.from]) balances[s.from].balance -= s.amount;
//       if (balances[s.to]) balances[s.to].balance += s.amount;
//     });

//     // Step 2: Greedy settlement suggestions
//     let payers = [], receivers = [];
//     Object.values(balances).forEach(m => {
//       if (m.balance < 0) payers.push({ ...m });
//       else if (m.balance > 0) receivers.push({ ...m });
//     });

//     let suggestedSettlements = [];

//     while (payers.length && receivers.length) {
//       let payer = payers[0];
//       let receiver = receivers[0];

//       let amount = Math.min(Math.abs(payer.balance), receiver.balance);

//       suggestedSettlements.push({
//         from: payer.name,
//         to: receiver.name,
//         amount,
//         fromId: payer.userId,
//         toId: receiver.userId
//       });

//       payer.balance += amount;
//       receiver.balance -= amount;

//       if (Math.abs(payer.balance) < 1e-6) payers.shift();
//       if (Math.abs(receiver.balance) < 1e-6) receivers.shift();
//     }

//     res.json({ groupName: group.name, settlements: suggestedSettlements });
//   } catch (err) {
//     console.error("Error in getGroupSettlement:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

exports.getGroupSettlement = async (req, res) => {
  try {
    const { groupId } = req.params;
    const authUserId = req.query.userid; // Get from query

    if (!authUserId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch group and populate member details
    const group = await groupModel.findById(groupId).populate("members.profileRef");
    if (!group) return res.status(404).json({ message: "Group not found" });

    const expenses = await expenseModel.find({ groupId });
    const existingSettlements = await settlementModel.find({ groupId });

    // Fetch all active bank accounts for group members only
    const memberIds = group.members.map(m => m.userId);
    const activeBanks = await accountModel.find({ userid: { $in: memberIds }, status: 1 });
    const bankMap = {};
    activeBanks.forEach(bank => {
      bankMap[bank.userid.toString()] = bank;
    });

    // Fetch auth user's active account (status: 1)
    const authUserBank = await accountModel.findOne({ userid: authUserId, status: 1 });

    // Step 1: Build balances
    let balances = {};
    group.members.forEach(m => {
      balances[m.userId.toString()] = {
        userId: m.userId,
        name: m.profileRef?.name || "Unknown",
        email: m.profileRef?.email || "",
        balance: 0,
        bank: bankMap[m.userId.toString()] || null,
      };
    });

    // Apply expenses
    expenses.forEach(exp => {
      if (balances[exp.paidBy]) balances[exp.paidBy].balance += exp.amount;
      exp.splits.forEach(s => {
        if (balances[s.userId]) balances[s.userId].balance -= s.share;
      });
    });

    // Apply already completed settlements
    existingSettlements.forEach(s => {
      if (balances[s.from]) balances[s.from].balance += s.amount;
      if (balances[s.to]) balances[s.to].balance -= s.amount;
    });

    // Step 2: Separate payers and receivers
    let payers = [], receivers = [];
    Object.values(balances).forEach(m => {
      if (m.balance < 0) payers.push({ ...m });
      else if (m.balance > 0) receivers.push({ ...m });
    });

    let suggestedSettlements = [];

    while (payers.length && receivers.length) {
      let payer = payers[0];
      let receiver = receivers[0];
      let amount = Math.min(Math.abs(payer.balance), receiver.balance);

      // Use authUserBank for the payer if it's the auth user
      const payerBank = payer.userId.toString() === authUserId ? authUserBank : payer.bank;
      const receiverBank = receiver.bank;

      let canSettle = false;
      let message = "";

      if (payer.userId.toString() === authUserId) {
        if (!payerBank || !receiverBank) {
          message = "Bank account not verified ❌. Please add bank details.";
        } else if ((Number(payerBank.deposit) || 0) < amount) {
          message = "Insufficient funds ❌";
        } else {
          canSettle = true;
          message = "You can settle ✅";
        }
      } else {
        canSettle = false;
        message = "You are not allowed to pay this settlement.";
      }

      suggestedSettlements.push({
        fromId: payer.userId,
        toId: receiver.userId,
        fromName: payer.name,
        toName: receiver.name,
        amount,
        payerBankActive: !!payerBank,
        receiverBankActive: !!receiverBank,
        canSettle,
        message,
      });
      // Send notifications if settlement is possible
      if (canSettle) {
        // Notify payer
        const payerNotification = await notificationModel.create({
          type: "SETTLEMENT_SUGGESTED",
          userId: payer.userId,
          groupId: group._id,
          message: `You can settle ₹${amount} with ${receiver.name} in group "${group.name}".`
        });
        console.log("Notification sent to payer:", payerNotification);

        // Notify receiver
        const receiverNotification = await notificationModel.create({
          type: "SETTLEMENT_SUGGESTED",
          userId: receiver.userId,
          groupId: group._id,
          message: `${payer.name} can settle ₹${amount} with you in group "${group.name}".`
        });
        console.log("Notification sent to receiver:", receiverNotification);
      }

      payer.balance += amount;
      receiver.balance -= amount;

      if (Math.abs(payer.balance) < 1e-6) payers.shift();
      if (Math.abs(receiver.balance) < 1e-6) receivers.shift();
    }

    res.json({ groupName: group.name, settlements: suggestedSettlements });
  } catch (err) {
    console.error("Error in getGroupSettlement:", err);
    res.status(500).json({ error: err.message });
  }
};




// exports.settlePayment = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const { from, to, amount } = req.body;

//     // 1️⃣ Find register docs by name
//     const fromRegister = await registerModel.findOne({ name: from });
//     const toRegister = await registerModel.findOne({ name: to });

//     if (!fromRegister || !toRegister) {
//       return res.status(400).json({ message: "Invalid from/to user name" });
//     }

//     // 2️⃣ Find login docs using regid
//     const fromUser = await loginModel.findOne({ regid: fromRegister._id });
//     const toUser = await loginModel.findOne({ regid: toRegister._id });

//     if (!fromUser || !toUser) {
//       return res.status(400).json({ message: "Could not find login accounts for users" });
//     }

//     // 3️⃣ Save settlement with login ObjectIds
//     const newSettlement = new settlementModel({
//       groupId,
//       from: fromUser._id,
//       to: toUser._id,
//       amount
//     });

//     await newSettlement.save();

//     res.json({
//       message: "Settlement recorded successfully",
//       settlement: newSettlement
//     });
//   } catch (err) {
//     console.error("Error in settlePayment:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

//group delete//

exports.getGroupSettlements = async (req, res) => {
  try {
    const { groupId } = req.params;

    const settlements = await settlementModel
      .find({ groupId })
      .populate("from", "name") // get user name
      .populate("to", "name")
      .lean();

    const formatted = settlements.map(s => ({
      from: s.from._id,   // ObjectId for payment
      to: s.to._id,       // ObjectId for payment
      fromName: s.from.name, // Display name
      toName: s.to.name,
      amount: s.amount
    }));

    res.json({ groupName: "My Group", settlements: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.groupdelete = async (req, res) => {
  try {
    const { groupId, userId } = req.body;  // groupId and logged-in userId will come in body

    // 1. Validate input
    if (!groupId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Group ID and User ID are required"
      });
    }

    // 2. Find the group
    const group = await groupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // 3. Check if the logged-in user is the admin
    if (group.admin.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the group admin can delete this group"
      });
    }

    // 4. Delete the group
    await groupModel.findByIdAndDelete(groupId);

    return res.status(200).json({
      success: true,
      message: "Group deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting group:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

//history //
exports.getAllPayments = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    // ---------------------------
    // 1️⃣ Get service payments
    // ---------------------------
    const servicePayments = await serviceModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "bookingId",
          as: "paymentData"
        }
      },
      { $unwind: { path: "$paymentData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          type: "service",
          serviceType: 1,
          amount: 1,
          status: 1,
          createdAt: 1,
          paymentStatus: "$paymentData.status",
          razorpay_order_id: "$paymentData.razorpay_order_id",
          razorpay_payment_id: "$paymentData.razorpay_payment_id"
        }
      }
    ]);

    // ---------------------------
    // 2️⃣ Get settlement payments (as 'group_payment')
    // ---------------------------
    const settlementPayments = await settlementModel.aggregate([
      {
        $match: {
          $or: [{ from: new mongoose.Types.ObjectId(userId) }, { to: new mongoose.Types.ObjectId(userId) }]
        }
      },
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "bookingId",
          as: "paymentData"
        }
      },
      { $unwind: { path: "$paymentData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "logins",
          localField: "from",
          foreignField: "_id",
          as: "fromUser"
        }
      },
      {
        $lookup: {
          from: "logins",
          localField: "to",
          foreignField: "_id",
          as: "toUser"
        }
      },
      { $unwind: "$fromUser" },
      { $unwind: "$toUser" },
      {
        $project: {
          type: "settlement",
          amount: 1,
          settledAt: 1,
          fromUser: "$fromUser.name",
          toUser: "$toUser.name",
          paymentStatus: "$paymentData.status",
          razorpay_order_id: "$paymentData.razorpay_order_id",
          razorpay_payment_id: "$paymentData.razorpay_payment_id"
        }
      }
    ]);

    // ---------------------------
    // 3️⃣ Combine & Sort by date
    // ---------------------------
    const combined = [
      ...servicePayments.map(s => ({ ...s, date: s.createdAt })),
      ...settlementPayments.map(s => ({ ...s, date: s.settledAt }))
    ];

    combined.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, transactions: combined });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
//invoice pdf//
exports.downloadInvoice = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await serviceModel.findById(serviceId);
    if (!service) return res.status(404).send("Service not found");

    // Create PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${serviceId}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('SafePay Electricity Bill Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice ID: ${serviceId}`);
    doc.text(`Date: ${service.createdAt.toLocaleString()}`);
    doc.text(`User ID: ${service.userId}`);
    doc.text(`Service Details: ${service.serviceDetails}`);
    doc.text(`Amount: Rs.${service.amount}`);
    doc.text(`Status: ${service.status}`);
    doc.moveDown();
    doc.text('Thank you for using SafePay!', { align: 'center' });

    doc.end();
  } catch (err) {
    res.status(500).send("Could not generate invoice");
  }
};

// Create Group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, admin, members } = req.body;

    // Build members array with both login id and regid
    const formattedMembers = members.map(m => ({
      userId: m.userId,
      profileRef: m.regid
    }));

    // Admin should also be part of members (if not already)
    if (!formattedMembers.some(m => m.userId.toString() === admin.userId.toString())) {
      formattedMembers.push({ userId: admin.userId, profileRef: admin.regid });
    }

    const group = new groupModel({
      name,
      description,
      admin: admin.userId,
      members: formattedMembers,
      feed: [
        { message: "Group Created", userId: admin.userId, createdAt: new Date() }
      ]
    });

    await group.save();
    // ✅ Notify members
    for (let member of formattedMembers) {
      if (member.userId.toString() !== admin.userId.toString()) {
        const notification = new notificationModel({
          type: "MEMBER_ADDED",
          userId: member.userId,
          groupId: group._id,
          message: `You have been added to the group "${name}"`,
        });
        await notification.save();
      }
    }

    // ✅ Notify admin
    const adminNotification = new notificationModel({
      type: "GROUP_CREATED",
      userId: admin.userId,
      groupId: group._id,
      message: `Your group "${name}" has been created successfully`,
    });
    await adminNotification.save();
    res.status(201).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all groups of a user


// Add member (only admin)
// exports.addMember = async (req, res) => {
//   try {
//     const { userId, adminId } = req.body;
//     const group = await groupModel.findById(req.params.groupId);

//     if (!group) return res.status(404).json({ error: "Group not found" });

//     if (group.admin.toString() !== adminId) {
//       return res.status(403).json({ error: "Only admin can add members" });
//     }

//     if (!group.members.includes(userId)) {
//       group.members.push(userId);
//       group.activityFeed.push({ action: "Member Added", by: adminId });
//       await group.save();
//     }

//     res.json(group);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Remove member (only admin)
// exports.removeMember = async (req, res) => {
//   try {
//     const { userId, adminId } = req.body;
//     const group = await groupModel.findById(req.params.groupId);

//     if (!group) return res.status(404).json({ error: "Group not found" });

//     if (group.admin.toString() !== adminId) {
//       return res.status(403).json({ error: "Only admin can remove members" });
//     }

//     group.members = group.members.filter(m => m.toString() !== userId);
//     group.activityFeed.push({ action: "Member Removed", by: adminId });
//     await group.save();

//     res.json(group);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.addMember = async (req, res) => {
  try {
    const { userId, adminId } = req.body;
    const group = await groupModel.findById(req.params.groupId);

    if (!group) return res.status(404).json({ error: "Group not found" });

    if (group.admin.toString() !== adminId) {
      return res.status(403).json({ error: "Only admin can add members" });
    }

    // Check if already a member
    if (!group.members.some(m => m.userId.toString() === userId)) {
      group.members.push({ userId });
      group.feed.push({
        userId: adminId,
        message: `Added member`,
      });

      await group.save();
      const notification = new notificationModel({
        userId, // the member who was added
        message: `You have been added to the group "${group.name}"`,
        link: `/group/${group._id}` // optional: link to the group page
      });
      await notification.save();
    }
    await group.populate("members.userId", "email");
    await group.populate("members.profileRef", "name");
    await group.populate("admin", "email");

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { userId, adminId } = req.body;
    const group = await groupModel.findById(req.params.groupId);

    if (!group) return res.status(404).json({ error: "Group not found" });

    if (group.admin.toString() !== adminId) {
      return res.status(403).json({ error: "Only admin can remove members" });
    }

    group.members = group.members.filter(m => m.userId.toString() !== userId);
    group.feed.push({
      userId: adminId,
      message: `Removed member`,
    });
    await group.save();

    await group.populate("members.userId", "email");
    await group.populate("members.profileRef", "name");
    await group.populate("admin", "email");

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get activity feed
exports.getActivityFeed = async (req, res) => {
  try {
    const group = await groupModel.findById(req.params.groupId)
      .populate("feed.userId", "name email");
    if (!group) return res.status(404).json({ error: "Group not found" });

    res.json(group.feed); // <-- use feed
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getAccountInfo = async (req, res) => {
  try {
    const userId = req.params.userId;
    const account = await accountModel.findOne({ userid: userId, status: 1 });
    if (!account) {
      return res.json({ success: false, message: "Account not found" });
    }
    res.json({ success: true, deposit: account.deposit });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Notification System//

exports.createNotification = async (req, res) => {
  try {
    const { type, message, userId, groupId } = req.body;
    const notification = new notificationModel({ type, message, userId, groupId });
    await notification.save();
    res.status(201).json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await notificationModel.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await notificationModel.findByIdAndUpdate(id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
