var express = require('express');
var router =express.Router();

const formController = require('../controller/form.controller')
const paymentController=require('../controller/payment.controller')
const serviceController=require('../controller/service.controller')
const adminController=require('../controller/admin.controller')
router.post('/register',formController.userReg)
router.post('/login',formController.userLogin)
router.post('/profile',formController.userProfile)
router.post('/verify',formController.verifyAccount)
router.post('/add',formController.addBankAccount)
router.post('/creategroup',formController.createGroup);
// router.get("/user/:id", GroupController.getUserGroups);
router.post("/:groupId/add-member", formController.addMember);
router.post("/:groupId/remove-member", formController.removeMember);
router.get("/:groupId/feed", formController.getActivityFeed);
router.get('/groups/:userId',formController.getUserGroups);
router.get('/users', formController.getAllUsers);
router.get('/group/:groupId', formController.getGroupById);
router.post('/addexpense',formController.addExpense)
router.get('/expenses/:groupId',formController.getGroupExpenses);
router.get('/user-balances/:userId',formController.getUserBalances)
router.post('/delete',formController.deleteAccount)
router.post('/update-profile',formController.updateProfile)
router.get("/group-balances/:groupId", formController.getGroupBalances);
router.get("/group-settlement/:groupId",formController.getGroupSettlement);
router.get('/account/:userId', formController.getAccountInfo);
// router.post("/group-settle/:groupId",formController.settlePayment);
router.post('/groupdelete',formController.groupdelete)
router.get('/history/:userId',formController.getAllPayments)
router.get('/invoice/:serviceId',formController.downloadInvoice)
//payement//
router.post('/create-order',paymentController.createOrder)
router.post('/verify-payment/:groupId',paymentController.verifyPayment)
//service//
router.post('/create-service',serviceController.createServicePayment)
router.post('/verify-service',serviceController.verifyServicePayment)
// admin//
router.get('/adminusers',adminController.getAllUsers)
router.delete('/adminusers/:id',adminController.deleteUser)
router.get('/admingroups',adminController.getAllGroups)
router.get('/admingroups/:groupId/members',adminController.getGroupMembers)
router.get('/userhistory/:userId/activity',adminController.getUserActivity)
router.get('/admindashboard',adminController.getDashboardAnalytics)

//notifications//
router.post("/usernotification", formController.createNotification);

// Get notifications for a user
router.get("/usernotification/:userId", formController.getUserNotifications);

// Mark notification as read
router.put("/usernotification/:id/read", formController.markAsRead);
module.exports=router