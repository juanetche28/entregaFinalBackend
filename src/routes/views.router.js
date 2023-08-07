import { Router } from "express";
import productModel from "../dao/models/product.model.js"
import { userModel } from "../dao/models/user.model.js"
import { checkRole } from "../middlewares/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  const {page} = req.query;
  const products = await productModel.paginate(
    {},
    {
      limit: 6,
      lean: true,
      page: page ?? 1,
    },
  );
  if (!req.user) {
    const data = {
      userExist: false,
      isAdmin: false,
      isPremium: false,
      products,
    };
    res.render("products", {data});  
  } else {
    const data = {
      userExist: true,
      isAdmin: req.user.rol == "admin",
      isPremium: req.user.rol == "premium",
      products,
    };
    res.render("products", {data});  
  }
});

router.get("/editUsers",checkRole(["admin"]), async (req, res) => {
  const {page} = req.query;
  const users = await userModel.paginate(
    {},
    {
      limit: 3,
      lean: true,
      page: page ?? 1,
    }
    );
    if (!req.user) {
      const data = {
        userExist: false,
        isAdmin: false,
        isPremium: false,
        users,
      };
      res.render("editUsers", {data});  
    } else {
      const data = {
        userExist: true,
        isAdmin: req.user.rol == "admin",
        isPremium: req.user.rol == "premium",
        users,
      };
      res.render("editUsers", {data});  
    }
});

router.get("/chat", async (req, res) => {
    res.render("chat");
  });

router.get("/login",(req,res)=>{
  const data = {
    userExist: req.user
  };
  res.render("login", {data});
});

router.get("/signup",(req,res)=>{
  const data = {userExist: req.user};
  res.render("registro", {data});
});

router.get("/profile",(req,res)=>{
  if (!req.user) {
    const data = {
      message: "Please, you must Log In first",
    };
    return res.status(401).render("error", {data})
  }

  const data = {
    id: req.user._id,
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    userExist: req.user,
    rol: req.user.rol,
    status: req.user.status,
    avatar: req.user.avatar,
    isPending: req.user.status == "pending",
    isAdmin: req.user.rol == "admin",
    isPremium: req.user.rol == "premium",
  };
  res.render("profile", {data});
});

router.get("/message",(req,res)=>{
  res.render("message", {data, message: 'Thanks for your Purchase!'});
});

router.get("/forgot-password",(req,res)=>{
  const data = {userExist: req.user};
  res.render("forgotPassword", {data});
});

router.get("/reset-password",(req,res)=>{
  const token = req.query.token;
  res.render("resetPassword",{token});
});


router.get("/testing",(req,res)=>{
  res.render("testing");
});

router.get("/thanks",(req,res)=>{
  res.render("message", {message: 'Thanks for your Purchase!'});
});

router.get("/editProducts",checkRole(["admin"]), async (req,res)=>{
  const {page} = req.query;
  const products = await productModel.paginate(
    {},
    {
      limit: 6,
      lean: true,
      page: page ?? 1,
    },
  );
  if (!req.user) {
    const data = {
      userExist: false,
      isAdmin: false,
      isPremium: false,
      products,
    };
    res.render("editProducts", {data});  
  } else {
    const data = {
      userExist: true,
      isAdmin: req.user.rol == "admin",
      isPremium: req.user.rol == "premium",
      products,
    };
    res.render("editProducts", {data});  
  }
});


router.get("/addProducts",checkRole(["admin", "premium"]), async (req,res)=>{
  if (!req.user) {
    const data = {
      userExist: false,
      isAdmin: false,
      isPremium: false
    };
    res.render("addProducts", {data});  
  } else {
    const data = {
      userExist: true,
      isAdmin: req.user.rol == "admin",
      isPremium: req.user.rol == "premium"
    };
    res.render("addProducts", {data});  
  }
});

router.get("/deleteInactiveUsers",checkRole(["admin"]), async (req, res) => {
  const {page} = req.query;
  const users = await userModel.paginate(
    {},
    {
      limit: 3,
      lean: true,
      page: page ?? 1,
    }
    );
    if (!req.user) {
      const data = {
        userExist: false,
        isAdmin: false,
        isPremium: false,
        users,
      };
      res.render("deleteInactiveUsers", {data});  
    } else {
      const data = {
        userExist: true,
        isAdmin: req.user.rol == "admin",
        isPremium: req.user.rol == "premium",
        users,
      };
      res.render("deleteInactiveUsers", {data});  
    }
});


export default router;
