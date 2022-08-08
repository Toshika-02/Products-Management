const userModel = require('../models/userModel');
const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');
const validation = require('../utils/validation');



//-------------------Create order------------------------------------------------
const orderCreate = async function (req, res) {
    try {
        let data =req.body
        let { cartId, cancellable  }= data

        let userIdInPath =req.params.userId

        if (!validation.isValidObjectId(userIdInPath)) { return res.status(400).send({ status: false, message: "Invalid UserId" }) }
        if (!validation.isValidObjectId(cartId)) { return res.status(400).send({ status: false, message: "Invalid cartId" }) }

        let checkUserId = await userModel.findById({ _id: userIdInPath })
        if (!checkUserId) { return res.status(404).send({ status: false, message: "UserId Do Not Exits" }) }
        
        let cartDetails = await cartModel .findOne({_id:cartId})
        if(!cartDetails){return res.status(404).send({status:false,message:"Cart Do not Exists"})}

        if(cartDetails.items.length ===0 ){return res.status(400).send({status:false,message:"Your Cart is Empty. You can't proceed further"})}

        if(cancellable){
            if(!(cancellable==false || cancellable==true )){return res.status(400).send({status:false,message:"Enter Only true / false in cancellable"})}

        }
        
        let sum = 0;
        for (let i = 0; i < cartDetails.items.length; i++) {
            sum = sum + cartDetails.items[i].quantity
        }
        let totalQuantity = sum

        let dataToBeAdded = {
            userId:cartDetails.userId,
            items:cartDetails.items,
            totalPrice:cartDetails.totalPrice,
            totalItems:cartDetails.totalItems,
            totalQuantity:totalQuantity,
            cancellable:data.cancellable,
        }
        let createdOrder = await orderModel .create(dataToBeAdded)
        res.status(201).send({status: true, message: 'Success', data: createdOrder })

        await cartModel.findOneAndUpdate({ userId: userIdInPath },{ $set: { items: [], totalItems: 0, totalPrice: 0 } })
    }
    catch(err) {
        res.status(500).send({status: false, message:err })
    }
}

//----------------------------Update Order------------------------------------------------
    const orderUpdate = async function (req, res) {
        try {
    
            let data = req.body
            let { orderId, status } = data
    
            let userIdInPath = req.params.userId
            if (!validation.isValid(orderId)) { return res.status(400).send({ status: false, message: "orderId required" }) }

            if (!validation.isValidObjectId(userIdInPath)) { return res.status(400).send({ status: false, message: "Invalid userId" }) }
            if (!validation.isValidObjectId(orderId)) { return res.status(400).send({ status: false, message: "Invalid orderId" }) }
    
            let checkUserId = await userModel.findById({ _id: userIdInPath })
            if (!checkUserId) { return res.status(404).send({ status: false, message: "UserId Do Not Exits" }) }
    
            if (!validation.isValidRequestBody(data)) { return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" }); }
    
            let order = await orderModel.findOne({ _id: orderId })
            if (!order) { return res.status(404).send({ status: false, message: "Order is not exist in DB" }) }
    
            // STATUS VALIDATION
            if(!validation.isValid(status)){ return res.status(400).send({ status: false, message: "Please Provide status" }) }
            if (status || status == "") {
                if (!((status == 'cancelled') || (status == 'completed'))) { return res.status(400).send({ status: false, message: "'canceled', 'completed' are suitable for the status " }) }
            }
    
            // SOME CASES TO BE HANDLED
            if(order.cancellable==false && status == "cancelled"){
                return res.status(400).send({status:false,message:"user can not cancel this order as this order has cancellable - false"})
            }
    
            if(order.status=='completed' && status == "completed"){
                return res.status(400).send({status:false,message:"Your Order is already completed, you can only cancel if order has cancellable - true"})
            }
    
            if(order.status=='cancelled' && status == "completed"){
                return res.status(400).send({status:false,message:"Your Order has cancelled, please order the product again, you can't proceed further"})
            }
    
            if(order.status=='cancelled' && status == "cancelled"){
                return res.status(400).send({status:false,message:"Your Order is already cancelled"})
            }
    
            let updatedOrder = await orderModel.findByIdAndUpdate({ _id: orderId }, data, { new: true })
            res.status(200).send({ status: true, message: 'Success', data: updatedOrder })
    
    
        }
        catch(err) {
            res.status(500).send({status: false, message:err })
        }
    }






    module.exports = {orderCreate,orderUpdate}