import passport from "passport"
import LocalStrategy from "passport-local"
import GithubStrategy from "passport-github2";
import { userModel } from "../dao/models/user.model.js"
import { createHash, isValidPassword } from "../utils.js"

const initializedPassport = () => {

    // Estrategia para el Registro
    passport.use("signupStrategy", new LocalStrategy(
        {
            usernameField:"email",
            passReqToCallback:true
        },
        async (req, username, password, done)=>{
            try {
                const {firstName, lastName, age} = req.body;
                const user = await userModel.findOne({email:username});
                if(user){
                    return done(null, false)
                }
                //crear el usuario
                let rol='user';
                if (username.endsWith('@coder.com')) {
                    rol = "admin";
                }
                //si no existe en la db
                const path = req.file;
                if (path === undefined){
                    const newUser = {
                        firstName,
                        lastName,
                        age,
                        email:username,
                        password:createHash(password),
                        rol
                    };
                    const userCreated = await userModel.create(newUser);
                    return done(null,userCreated);
                } else {
                    const newUser = {
                        firstName,
                        lastName,
                        age,
                        email:username,
                        password:createHash(password),
                        rol,
                        avatar: req.file.path 
                    };
                    const userCreated = await userModel.create(newUser);
                    return done(null,userCreated);
                }
            } catch (error) {
                return done(error);
            }
        }
    ));


    // Estrategia para autentificar usuarios mediante GitHub
    passport.use("githubSignup", new GithubStrategy(
        {   // Datos de mi propia APP Github
            clientID: "Iv1.0973c48ea89f70ab",  
            clientSecret: "6a55f4aab4d307903beebaa260e6176da4f59181",
            callbackURL: "https://entregafinalbackend-production-7c5b.up.railway.app/api/sessions/github-callback"
        },
        async(accessToken, refreshToken, profile, done)=>{
            try {
                const userExists = await userModel.findOne({email:profile.username});
                if(userExists){
                    return done(null,userExists)
                }
                const newUser = {
                    firstName:profile.username,
                    lastName:profile.username,
                    age:null,
                    email:profile.username,
                    password:createHash(profile.id)
                };
                const userCreated = await userModel.create(newUser);
                return done(null,userCreated)
            } catch (error) {
                return done(error)
            }
        }
    ))


    // Estrategia para el Login
    passport.use("login", new LocalStrategy({usernameField: "email"}, async(username, password, done) => {
        try {
            const user = await userModel.findOne({email: username});
            if(!user){
                // req.logger.error(`User With email ${username} not Found`);
                return done(null, false); 
                // return res.status(401).send(`User With email ${username} not Found. <a href="/">Home</a>`);
            }
            if(!isValidPassword(user, password)) 
            return done(null, false);
            //modificar last_connection del usuario que se loguea (Tmb lo hacemos para cuando se desloguea en el router auth - logout)
            user.last_connection = new Date();
            const userUpdated = await userModel.findByIdAndUpdate(user._id,user)          
            return done(null, userUpdated);    
        } catch (error) {
            return(error);
        }
    }));


    // Serializar y Deserializar Usuarios con Passport
    passport.serializeUser((user,done)=> {
        done(null, user._id);
    });

    passport.deserializeUser(async(id,done) =>{
        const user = await userModel.findById(id);
        return done(null, user); //req.user = user
    });
}

export {initializedPassport}

