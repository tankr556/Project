const router = require("express").Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../model/User")
const Admin = require("../model/admin")
const auth = require("../middleware/auth")
const Category = require("../model/Category");
const Product = require("../model/Product")
const multer = require("multer")
const Cart = require("../model/Cart")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/productimg")
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '.jpg')
    }

})
const upload = multer({ storage: storage })


router.get("/dashboard", auth, (req, resp) => {
    resp.render("dashboard")
})

router.get("/calendar", auth, (req, resp) => {
    resp.render("calendar")
})

router.get("/profile", auth, (req, resp) => {
    resp.render("profile")
})
router.get("/icons", auth, (req, resp) => {
    resp.render("icons")
})
router.get("/adminlogin", (req, resp) => {
    resp.render("adminlogin")
})

router.post("/alogin", async (req, resp) => {
    try {
        const admin = await Admin.findOne({ email: req.body.email })
        if (admin.password == req.body.password) {
            const token = await jwt.sign({ _id: admin._id }, process.env.SKEY)
            console.log(token);
            resp.cookie("jwt", token)
            resp.redirect("dashboard")
        }
        else {
            resp.render("adminlogin", { msg: "Invalid Email or Password" })
        }
    } catch (error) {
        resp.render("adminlogin", { msg: "Invalid Email or Password" })

    }
})

router.get("/alogout", auth, (req, resp) => {
    resp.clearCookie("jwt")
    resp.redirect("adminlogin");
})

// ************************Product Category************************
router.get("/productcategory", (req, resp) => {
    resp.render("productcategory")
})
router.get("/category", auth, async (req, resp) => {
    try {
        const cat = await Category.find();
        resp.render("productcategory", { cdata: cat })
    } catch (error) {

    }

})

router.post("/addcategory", async (req, resp) => {
    try {
        const cat = new Category(req.body)
        await cat.save()
        resp.redirect("/category")
    } catch (error) {
        console.log(error);
    }
})
router.get("/deletecat", auth, async (req, resp) => {
    try {
        const _id = req.query.did;
        await Category.findByIdAndDelete(_id)
        resp.redirect("category")
    } catch (error) {
        console.log(error);
    }
})

//**********************Product********************** */

router.get("/products", async (req, resp) => {
    try {
        // resp.render("products")
        const cat = await Category.find();
        const prod = await Product.find();
        resp.render("products", { cdata: cat, pdata: prod })
    } catch (error) {
        console.log(error);
    }
})

router.post("/addproduct", upload.single("file"), async (req, resp) => {
    try {
        const prod = new Product({
            cid: req.body.cid,
            pname: req.body.pname,
            price: req.body.price,
            qty: req.body.qty,
            imgname: req.file.filename
        })
        await prod.save();
        resp.redirect("products")
    } catch (error) {
        console.log(error);
    }
})

router.get("/deleteprod", auth, async (req, resp) => {
    try {
        const _id = req.query.did;
        await Product.findByIdAndDelete(_id)
        resp.redirect("products")
    } catch (error) {
        console.log(error);
    }
})
//********************User*******************************/
router.get("/viewuser", async (req, resp) => {
    try {
        const user = await User.find();
        resp.render("userdetail", { udata: user })
    } catch (error) {
        console.log(error);
    }
})

router.get("/deleteuser", auth, async (req, resp) => {
    try {
        const _id = req.query.did;
        await User.findByIdAndDelete(_id)
        resp.redirect("viewuser")
    } catch (error) {
        console.log(error);
    }
})

//******************Order*********************/
const Order = require("../model/Order")
router.get("/vieworder", async (req, resp) => {
    try {
        const order = await Order.find();
        resp.render("orderdetail", { odata: order })
    } catch (error) {

    }
})
router.get("/deleteorder", auth, async (req, resp) => {
    try {
        const _id = req.query.did;
        await User.findByIdAndDelete(_id)
        resp.redirect("vieworder")
    } catch (error) {
        console.log(error);
    }
})
module.exports = router