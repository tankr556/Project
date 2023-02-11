const router = require("express").Router()
const User = require("../model/User")
const Category = require("../model/Category")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Product = require("../model/Product")
const Cart = require("../model/Cart")
const uauth = require("../middleware/userauth")

router.get("/", async (req, resp) => {
    try {
        const cat = await Category.find();
        const prod = await Product.find()
        resp.render("index", { cdata: cat, pdata: prod })
    } catch (error) {

    }
})

router.get("/cart", uauth, async (req, resp) => {
    const uid = req.user._id
    try {
        const cartdata = await Cart.aggregate([{ $match: { uid: uid } }, { $lookup: { from: 'products', localField: 'pid', foreignField: '_id', as: 'products' } }])
        //console.log(cartdata);
        // resp.render("cart", { cartd: cartdata })
        let sum = 0;
        for (var i = 0; i < cartdata.length; i++) {
            sum = sum + cartdata[i].total;

        }
        // console.log(sum);
        resp.render("cart", { cartd: cartdata, carttotal: sum })

    } catch (error) {

    }
    //resp.render("cart")
})

router.get("/contact", (req, resp) => {
    resp.render("contact")
})

router.get("/productsingle", (req, resp) => {
    resp.render("product-single")
})

router.get("/shop", async (req, resp) => {
    try {
        const cat = await Category.find();
        const prod = await Product.find()
        resp.render("shop", { cdata: cat, pdata: prod })
    } catch (error) {

    }
})

router.get("/findByCat", async (req, resp) => {
    const catid = req.query.catid
    try {
        const cat = await Category.find();
        const prod = await Product.find({ cid: catid })
        resp.render("shop", { cdata: cat, pdata: prod })
    } catch (error) {

    }
})


router.get("/loginpage", (req, resp) => {
    resp.render("login")
})

router.get("/reg", (req, resp) => {
    resp.render("registration")
})

router.post("/userreg", async (req, resp) => {
    try {
        const user = new User(req.body)
        await user.save();
        resp.render("registration", { msg: "Registation sucess!!!...." })
    } catch (error) {
        console.log(error);
    }
})

router.post("/login", async (req, resp) => {
    try {
        const user = await User.findOne({ email: req.body.email })

        const isvalid = await bcrypt.compare(req.body.password, user.password)
        // console.log(isvalid);
        if (isvalid) {
            const token = await user.generateToken();
            //console.log(token);
            resp.cookie("ujwt", token)
            resp.render("index")
        }
        else {
            resp.render("login", { msg: "Invalid email or password" })
        }
    } catch (error) {
        resp.render("login", { msg: "Invalid email or password" })
    }
})

router.get("/logout", uauth, async (req, resp) => {
    try {
        const user = req.user;
        const token = req.token

        user.Tokens = user.Tokens.filter(ele => {
            return ele.token != token
        })

        await user.save();
        resp.clearCookie("ujwt");
        resp.render("index")
    } catch (error) {
        console.log(error);
    }
})
router.get("/addtocart", uauth, async (req, resp) => {
    const pid = req.query.pid
    //console.log(pid);
    const uid = req.user._id
    //console.log(uid);
    try {
        const allCartProduct = await Cart.find({ uid: uid })
        const productdata = await Product.findOne({ _id: pid });
        const duplicate = allCartProduct.find(ele => {
            return ele.pid == pid
        })
        if (duplicate) {
            resp.send("Product alredy exist in cart !!!")

        }
        else {
            const cart = new Cart({
                pid: pid,
                uid: uid,
                total: productdata.price
            })

            await cart.save();
            resp.send("product added into cart")
        }
    } catch (error) {
        console.log(error);
    }
})
router.get("/deletetocart", uauth, async (req, resp) => {
    try {
        const _id = req.query.cid;
        await Cart.findByIdAndDelete(_id)
        resp.redirect("cart")
    } catch (error) {
        console.log(error);
    }
})

router.get("/changeCartQty", uauth, async (req, resp) => {
    try {
        const cartid = req.query.cartid;
        const cartProduct = await Cart.findOne({ _id: cartid })
        const productdata = await Product.findOne({ _id: cartProduct.pid })
        const newqty = Number(cartProduct.qty) + Number(req.query.qty)
        const newtotal = newqty * productdata.price;
        console.log(newtotal);
        const updatedata = await Cart.findByIdAndUpdate(cartid, { qty: newqty, total: newtotal })
        resp.send("ok")
    } catch (error) {
        console.log(error);
    }
})



module.exports = router