import { userModel } from "../dao/models/user.model.js";
import { UserManager } from "../dao/index.js";
import passport from "passport";
import { sendRecoveryPass } from "../utils/email.js";
import { generateEmailToken, verifyEmailToken, isValidPassword, createHash } from "../utils.js";
import jwt from 'jsonwebtoken';
import UserDTO from '../dto/User.dto.js';

//rutas de autenticacion "signupStrategy" definida en passport.config
const passportSignupController = passport.authenticate("signupStrategy",{failureRedirect:"/api/sessions/failure-signup"});
const successRegisterController = (req,res)=>{res.send('successfully registered user. <a href="/">Home</a>')};
const failureRegisterController = (req,res)=>{res.send('Could not register the user. <a href="/">Home</a>')};

//rutas de autenticacion "githubSignup" definida en passport.config
const passportGithubSignupController = passport.authenticate("githubSignup");
const failureSignupGihubController = passport.authenticate("githubSignup",{failureRedirect:"/api/sessions/failure-signup"})
const successSignupGihubController = (req,res)=>{res.send('Authenticated user. <a href="/">Home</a>')};
   
//rutas de autenticacion "login" definida en passport.config

const passportLoginController =  passport.authenticate("login", {failureRedirect: "/api/sessions/login-failed",});
const checkCredentials = async (req, res) => {
    if (!req.user) {
        return res.status(401).send('Invalid Credentials. <a href="/">Home</a>');
    }
    req.session.userId = req.user._id;
    const userDto = UserDTO.getUserTokenFrom(req.user);
    const token = jwt.sign(userDto,'tokenSecretJWT',{expiresIn:"1h"});   // Genero un token JWT que luego lo uso para verificar con la clave secreta "tokenSecretJWT"
    res.cookie('backendCookie',token,{maxAge:3600000}).redirect("/profile"); // Guardo el token en la cookie "backendCookie". La veo con req.cookies['backendCookie']
};

const loginFailController = (req,res)=>{
    req.logger.error("failed");
    res.send('Failed Login. <a href="/">Home</a>')};

const forgotPasswordController = async (req,res) =>{
    try {
        const {email} = req.body;
        //verificamos que el usuario exista
        const user = await userModel.findOne({email:email});
        if(!user){
            return res.send(`<div>Error, <a href="/forgot-password">Please try again</a></div>`);
        }
        //si el usuario existe, generamos el token del enlace
        const token = generateEmailToken(email,1*60); // 1 minuto pide el enunciado. 
        await sendRecoveryPass(email,token);
        res.send("Successful sending of email to reset password. Return <a href='/login'>To login</a>");
    } catch (error) {
        res.send(`<div>Error, <a href="/forgot-password">Please try again</a></div>`)
    }
};

const resetPasswordController = async (req,res) => {
    try {
        const token = req.query.token;
        const {newPassword} = req.body;
        //validamos el token
        const validEmail = verifyEmailToken(token);
        if(!validEmail){
            return res.send(`Link expired. Please Generate a new link to restore your password <a href="/forgot-password" >Restore Password</a>`)
        }
        const user = await userModel.findOne({email:validEmail});
        if(!user){
            return res.send("User didn't register")
        }
        if(isValidPassword(user,newPassword)){
            return res.send("Please use a previously unused password.");
        }
        const userData = {
            ...user._doc,
            password:createHash(newPassword)
        }
        const userUpdate = await userModel.findOneAndUpdate({email:validEmail},userData);
        res.render("login",{message:"Updated Password"});
    } catch (error) {
        res.send(error.message);
    }
};

const logoutSessionController = (req,res)=>{
    //rq.logOut elimina la propiedad req.user y limpia la sesion de autenticacion actual
    req.logOut(error=>{
        if(error){
            return res.send("The session could not be closed.");
        }else {
            //req.session.detroy elimina la sesion del usuario de la memoria del servidor y de la base de datos
            const user = {...req.user}; // Duplico el req.user 
            user.last_connection = new Date();
            req.session.destroy (async(err)=>{
                if(err) return res.send("The session could not be closed.");
                const userUpdated = await userModel.findByIdAndUpdate(user._id,user);
                const data = {userExist: false};
                res.render("message", {data, message: 'Goodbye! I hope to see you later.'});
            })
        }
    })
};

const current = async(req,res) =>{
    const cookie = req.cookies['backendCookie']  // Recupero mi token guardado en la cookie "backenCookie"
    const user = jwt.verify(cookie,'tokenSecretJWT');
    if(user)
        return res.send({status:"success",payload:user})
    }

export default{
    passportSignupController, 
    successRegisterController, 
    failureRegisterController, 
    passportGithubSignupController, 
    failureSignupGihubController, 
    successSignupGihubController, 
    passportLoginController, 
    checkCredentials, 
    loginFailController, 
    forgotPasswordController,
    resetPasswordController, 
    logoutSessionController,
    current
}



