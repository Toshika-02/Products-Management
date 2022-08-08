const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, trim: true, unique: true
    },
    items: [
        {productId: {type: mongoose.Schema.Types.ObjectId, trim: true, required: true,ref:'Product_Project5' },
        quantity:{type: Number, trim: true, required: true}}
    ],
    totalPrice: {type: Number, trim: true, required: true},
    totalItems: {type: Number, trim: true, required: true},
},{timestamps: true})



module.exports = mongoose.model('cart',cartSchema);