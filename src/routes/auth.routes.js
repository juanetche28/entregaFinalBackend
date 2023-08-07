import {Router} from "express";
import authController from "../controllers/auth.controller.js"
import { uploaderProfile } from "../utils.js";

const router = Router();

//rutas de autenticacion "signupStrategy" definida en passport.config
router.post("/signup",uploaderProfile.single("avatar"), authController.passportSignupController, authController.successRegisterController);
router.get("/failure-signup",authController.failureRegisterController);

//rutas de autenticacion "githubSignup" definida en passport.config
router.get("/github", authController.passportGithubSignupController);
router.get("/github-callback", authController.failureSignupGihubController, authController.successSignupGihubController)
   
//rutas de autenticacion "login" definida en passport.config
router.post("/login", authController.passportLoginController, authController.checkCredentials);
router.get("/login-failed",authController.loginFailController);


//rutas de Olvido de contraseña definidas en controllers -> auth.controllers.js
router.post("/forgot-password", authController.forgotPasswordController);
router.post("/reset-password", authController.resetPasswordController);

//Borrar toda la sesion del usuario loggeado 
router.get("/logout", authController.logoutSessionController)

router.get('/current', authController.current);

export {router as AuthRouter};