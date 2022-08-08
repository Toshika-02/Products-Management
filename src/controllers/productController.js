const productModel=require("../models/productModel.js")
const config = require('../utils/aws');
const validation = require('../utils/validation');
function isNum(val){
  return !isNaN(val) 
}

//---------------------CreateProduct------------------------------------------
const createProduct = async function (req, res) {
  try{
  let Data = req.body, files = req.files;
  let {title, description, price, currencyId, currencyFormat, productImage, isFreeShipping, style, availableSizes, installments} = Data  
//validation --
if (!validation.isValidRequestBody(Data)) { return res.status(400).send({ status: false, message: "Please enter details"}) } 

if(!validation.isValid(title))  {
  return res.status(400).send({status:false, message: "Title is required"})
}
const titleAlreadyUsed = await productModel.findOne({title})
if(titleAlreadyUsed) { return res.status(400).send({ status:false, message:`${title} is already in use.Enter another title`})}
//description
if(!validation.isValid(description))  {
  return res.status(400).send({status:false, message: "needs a Description"})
}
if(!validation.isValid(price))  {
  return res.status(400).send({status:false, message: "provide product price"})     
}
if (price == 0){
            return res.status(400).send({ status: false, message: "Price of product can't be zero" })}
if (!price.match(/^\d{0,8}(\.\d{1,2})?$/)){
      return res.status(400).send({ status: false, message: "Price  you have set is not valid" })}
if(currencyId){
if(!validation.isValid(currencyId))  {
  return res.status(400).send({status:false, message: "needs currencyId"})
}
if(currencyId != "INR"){
  return res.status(400).send({status:false, message: "needs currencyId in INR"})
}}
if(!currencyId){currencyId = "INR"}

if(currencyFormat){

if(!validation.isValid(currencyFormat))  {
  return res.status(400).send({status:false, message: "need currencyFormat"})
}
if(currencyFormat != "₹"){
  return res.status(400).send({status:false, message: "need currencyFormat in ₹"})
}}
if(!currencyFormat){currencyFormat="₹"}
if(!validation.isValid(style))  {
  return res.status(400).send({status:false, message: "style required"})
}
if(isFreeShipping){
if(!validation.isValid(isFreeShipping))  {
  return res.status(400).send({status:false, message: "isFreeShipping is required"})
}
if((isFreeShipping) != 'true' && isFreeShipping != 'false' ){
  
  return res.status(400).send({status:false, message: "isFreeShipping must be a boolean type"})
}
}
if(installments){
  if (isNum(installments) === true){
     if(installments <= 1 || installments % 1 != 0 ){
         
          return res.status(400).send({status:false, message: "installments number must be more than 1& natural"})}
     }
  else {return res.status(400).send({status:false, message: "installments  be a natural number, more than 1"})}
    }
  
//if(installments % 1 != 0){return res.status(400).send({status:false, message: "installments  be a natural number"})}
///availableSizes-
if(!validation.isValid(availableSizes))  {return res.status(400).send({status:false, message: "required availableSizes "})}

sizes = availableSizes.split(',').map(a => a.trim().toUpperCase())

 for(let i = 0; i < sizes.length; i++) {
    if(!(["S", "XS","M","X", "L","XXL", "XL"] ).includes(sizes[i])){
      return res.send({status: false, message: "sizes should be from S, XS,M,X,L,XXL, XL"})
    }
 }
//availableSizes = sizes
if(!validation.isValidRequestBody(files)){
  return res.status(400).send({status:false, message: "productImage is required"})
}
if(files.length < 0){return res.status(400).send({status:false, message: "productImage needed" })} 
productImage = await config.uploadFile(files[0])
let newData = {title, description, price, currencyId, currencyFormat, productImage: productImage
  , isFreeShipping, style, availableSizes: sizes, installments}



const savedData = await productModel.create(newData);
  return res.status(201).send({ status: true, message: "Success", data: savedData, });
    }catch (error) {
      res.status(500).send({ status: false, message: error.message })
    }
    }  

 //-----------------------GetProducts--------------------------------------------

const getProducts = async function (req, res) {
      try {
          
    const queryData = req.query
          
    /* if (!validation.isValidRequestBody(req.query)) { return res.status(400).send({ status: false, message: "Please enter details"}) } */
    let filter = { isDeleted: false }
    let { size,name,priceGreaterThan,priceLessThan,priceSort} = queryData
    
  if(name){   
    if(!validation.isValid(name)){
      return res.status(400).send({status: false, message: "Please enter name correctly"})
    }
    filter['title'] = {}
    filter['title']['$regex'] = name; 
    filter['title']['$options'] = 'i'
  }
 
  
     if (size) { let size1 = size.split(",").map(x => x.trim().toUpperCase()) 
     if (size1.map(x => validation.isValid(x)).filter(x => x === false).length !== 0) return res.status(400).send({ status: false, message: "Size Should be among S,XS,M,X,L,XXL,XL" }) 
     filter['availableSizes'] = { $in: size1 } } 
  
  if(priceGreaterThan){
    if(!validation.isValid(priceGreaterThan)){return res.status(400).send({ status: false, message: "Please enter a price greater than" }) }
    if(!(isNum(priceGreaterThan))){return res.status(400).send({ status: false, message: "Please enter a number in priceGreaterThan" })}
    if(!(filter.hasOwnProperty('price'))){
      filter['price'] = {}   
    }
    filter['price']['$gt'] = Number(priceGreaterThan)
    
  }
  
  if(priceLessThan){
    if(!validation.isValid(priceLessThan)){return res.status(400).send({ status: false, message: "Please enter a valid priceLessThan" }) }
    if(!(isNum(priceLessThan))){return res.status(400).send({ status: false, message: "Please enter a number in priceGreaterThan"})}
    if(!(filter.hasOwnProperty('price'))){
      filter['price'] = {}
    }
    
  filter['price']['$lt'] = Number(priceLessThan);
  }
  if(priceSort){
  if(!(priceSort == 1  || priceSort == -1)){
    return res.status(404).send({ status: false, message: "Price sort can be only 1 or -1" });
  } }
    
  let Products = await productModel.find(filter).sort({price: priceSort})
  if (Products.length == 0) {
    return res.status(404).send({ status: false, message: "No products found" })
}  
return res.status(200).send({ status: true, message: "Success", data: Products })    
} catch (error) {
  res.status(500).send({ status: false, message: error.message })
}
}    
    
//----------------GetProductById----------------------------------
const productById  = async function(req,res) {
  try{
    let productId = req.params.productId
    if (!(validation.isValidObjectId(productId))){
      return res.status(400).send({status: false, message: "productId not valid"})
    }
    const product = await productModel.findOne({_id: productId, isDeleted: false})
    if(!product){ return res.status(404).send({status: false, message: "Product not found"})  }
    return res.status(200).send({status: true,message: "Success", data: product})
  }catch (error) {
    res.status(500).send({ status: false, message: error.message })
  }
}
//================update product ===============

const updateProduct = async function(req, res) {
  try {
    const productId = req.params.productId
    if (!(validation.isValidObjectId(productId))){
      return res.status(400).send({status: false, message: "productId not valid"})
    }
    let Data = req.body;
  //console.log(Data)
if (!validation.isValidRequestBody(req.body)) 
    { return res.status(400).send({ status: false, message: "Please enter details"}) }

    

    let {title, description, price, currencyId, currencyFormat,  isFreeShipping, style, availableSizes, installments} = Data



    let productUpdate = {}
    
  
  let product = await productModel.findOne({_id: productId,isDeleted: false})
    if(!product){ return res.status(404).send({status: false, message: "Product not found or already deleted"}) }
    
    if(title){
     // console.log(title)
     if(!validation.isValid(title))  {
       return res.status(400).send({status:false, message: "Title is required"})
     }

    
     const titleAlreadyUsed = await productModel.findOne({title: title})
     if(titleAlreadyUsed) {
    return res.status(400).send({ status:false, message:`${title} is already in use.Enter another title`})}
    
    productUpdate.title = title
    }
    if(description){
    if(!validation.isValid(description))  {
      return res.status(400).send({status:false, message: "needs a Description"})
    }
     productUpdate.description= description
  }
    //PRICE VALIDATION 
    
    
  if(price) {
    if(!validation.isValid(price))  {
      return res.status(400).send({status:false, message: "provide product price"})     
    }
    if (price == 0){
                return res.status(400).send({ status: false, message: "Price of product can't be zero" })}
    
    if (!price.match(/^\d{0,8}(\.\d{1,2})?$/)){
    
      return res.status(400).send({ status: false, message: "Price  you have set is not valid" })}
    
      productUpdate.price = price
    }
    if(currencyId){
      //CURRENCYID VALIDATION 
    if(!validation.isValid(currencyId))  {
      return res.status(400).send({status:false, message: "needs currencyId"})
    }
    if(currencyId != "INR"){
      return res.status(400).send({status:false, message: "needs currencyId in INR"})
    }
    productUpdate.currencyId = currencyId
  }
  if(currencyFormat){
    if(!validation.isValid(currencyFormat))  {
      return res.status(400).send({status:false, message: "need currencyFormat"})
    }
    if(currencyFormat != "₹"){
      return res.status(400).send({status:false, message: "need currentFormat in ₹"})
    }
    productUpdate.currencyFormat = currencyFormat
  }
    //if STYLE
  if(style){
    if(!validation.isValid(style))  {
      return res.status(400).send({status:false, message: "style required"})
    }
    productUpdate.style = style
  }
  
    //if ISFREESHIPPING
   if(isFreeShipping) {
    if(!validation.isValid(isFreeShipping))  {
      return res.status(400).send({status:false, message: "isFreeShipping is required"})
    }
    if((isFreeShipping) != 'true' && isFreeShipping != 'false' ){
      
      return res.status(400).send({status:false, message: "isFreeShipping must be a boolean type"})
    }
    productUpdate.isFreeShipping = isFreeShipping
  }
    //INSTALLMENTS VALIDATION
   if(installments){   
    if (isNum(installments) === true){
         if(installments <= 1 || installments % 1 != 0){
        return res.status(400).send({status:false, message: "number must be natural,more than 1"})}
         }
      else {return res.status(400).send({status:false, message: "installments  be a natural number, more than 1"})}

      productUpdate.installments = installments
        }
      //SIZE VALIDATION
      if(availableSizes){
    if(!validation.isValid(availableSizes))  {return res.status(400).send({status:false, message: "required availableSizes "})}
    
    sizes = availableSizes.split(',').map(a => a.trim().toUpperCase())
     let allSige=product.availableSizes 
     for(let i = 0; i < sizes.length; i++) 
     {
       if(!(["S", "XS","M","X", "L","XXL", "XL"] ).includes(sizes[i])){ 
             return res.send({status: false, message: "sizes should be from S,XS,M,X,L,XXL, XL"}) } 
      else if(allSige.includes(sizes[i])){
        continue} 
        else {allSige.push(sizes[i])} } 
        productUpdate.availableSizes = allSige } 


      
    //PRODUCT-IMAGE VALIDATION
   if(req.files && (req.files).length > 0){ 
    if(!validation.isValidRequestBody(req.files)){
      return res.status(400).send({status:false, message: "productImage is required"})
    }
   
    
    
    productImage = await config.uploadFile(req.files[0])
     productUpdate.productImage = productImage
  }
  let update = await productModel.findOneAndUpdate({_id: productId}, {$set:productUpdate}, {new:true}) 
  return res.status(200).send({status: true, message: "Product updated successfully", data: update})


  }catch (error) {
    res.status(500).send({ status: false, message: error.message })
  }
}

    
    
          
//---------------------- delete Product-----------------------

const deleteProduct = async function(req, res) {  
  try{
    let productId = req.params.productId
    if (!(validation.isValidObjectId(productId))){
      return res.status(400).send({status: false, message: "productId not valid"})
    }
    let product = await productModel.findOne({_id: productId, isDeleted: false})
    if(!product) {
      return res.status(404).send({status: false, message: "Product not found or deleted"})
    }
    
   let deleteProduct = await productModel.findOneAndUpdate({_id: productId},
    {$set: {isDeleted: true, deletedAt: Date.now()}},
    {new: true})
  return res.status(200).send({status: true, message: "Product deleted successfully"})

  }catch (error) {
    res.status(500).send({ status: false, message: error.message })
  }
}
          
          
      







module.exports = {createProduct, getProducts, productById, updateProduct, deleteProduct}