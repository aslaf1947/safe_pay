const {registerModel,loginModel,accountModel,groupModel,expenseModel,settlementModel,paymentModel,serviceModel}=require('../model/form.model')
const path=require("path")
const bcrypt=require('bcryptjs')
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const PDFDocument = require('pdfkit');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await loginModel
      .find({ usertype: 0 }) // only fetch usertype 0
      .populate("regid"); // populate details from register model

    const formattedUsers = users.map((user) => ({
      _id: user._id,
      name: user.regid?.name,
      phone: user.regid?.phone,
      createdAt: user.regid?.createdAt,
      approval: user.regid?.approval,
      status: user.status,
      usertype: user.usertype,
    }));

    res.status(200).json(formattedUsers);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the login entry
    const user = await loginModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send email before deleting
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // or your SMTP host
      port: 465,
      secure: true,
      auth: {
        user: "jobcraft1947@gmail.com",
        pass: "qtdj vhsv ounj xsmd", 
      }
    });

    const mailOptions = {
      from: `"SafePay Team" <jobcraft1947@gmail.com>`,
      to: user.email, // user's email
      subject: "Account Deleted",
      html: `<p>Hi ${user.name},</p>
             <p>Your account has been deleted by the admin.</p>
             <p>If you think this is a mistake, please contact support.</p>
             <br/>
             <p>SafePay Team</p>`
    };

    await transporter.sendMail(mailOptions);

    // Delete from registerModel as well
    await registerModel.findByIdAndDelete(user.regid);

    // Delete from loginModel
    await loginModel.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully and email sent" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllGroups = async (req, res) => {
  try {
    const groups = await groupModel
      .find()
      .populate("admin", "email") // Populate admin details from loginModel
      .populate("members.userId", "email") // Populate member login data
      .populate("members.profileRef", "name phone"); // Populate member profile details

    res.status(200).json(groups);
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get specific group members by groupId
exports.getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await groupModel
      .findById(groupId)
      .populate("members.userId", "email") // member login details
      .populate("members.profileRef", "name phone"); // member profile details

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(group.members);
  } catch (err) {
    console.error("Error fetching group members:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Find all groups where the user is a member
    const userGroups = await groupModel.find({ "members.userId": userId }).select("_id").lean();
    const groupIds = userGroups.map(g => g._id);

    // 2. Get settlements for these groups
    const settlements = await settlementModel.find({ groupId: { $in: groupIds } }).select("_id").lean();
    const settlementIds = settlements.map(s => s._id);

    // 3. Get payments for these settlements
    const payments = await paymentModel.find({ bookingId: { $in: settlementIds } })
      .sort({ createdAt: -1 })
      .lean();

    // 4. Get service usage by user
    const services = await serviceModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // 5. Merge both histories
    const combinedHistory = [
      ...payments.map(p => ({ ...p, type: "Payment" })),
      ...services.map(s => ({ ...s, type: "Service" }))
    ];

    // 6. Sort by most recent
    combinedHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(combinedHistory);
  } catch (err) {
    console.error("Error fetching user activity:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const totalUsers = await loginModel.countDocuments();
    const totalGroups = await groupModel.countDocuments();
    const totalSettlements = await settlementModel.countDocuments();

    const payments = await paymentModel.aggregate([
      { 
        $group: { 
          _id: "$status", 
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" } 
        } 
      }
    ]);

    const analytics = {
      totalUsers,
      totalGroups,
      totalSettlements,
      payments
    };

    res.status(200).json(analytics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};