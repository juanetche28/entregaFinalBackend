import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {options} from "./config/options.js"
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;

export const createHash = (password) => {
   return bcrypt.hashSync(password, bcrypt.genSaltSync()) // Retorna un Hash
}

export const isValidPassword = (user, loginPassword) => {
    return bcrypt.compareSync(loginPassword,user.password);
}

export const generateEmailToken = (email,expireTime)=>{
    const token = jwt.sign({email},options.gmail.emailToken ,{expiresIn:expireTime});
    return token;
};

export const verifyEmailToken = (token)=>{
    try {
        const info = jwt.verify(token,options.gmail.emailToken);
        const email = info.email
        return email;
    } catch (error) {
        return null;
    }
};


//configuracion para guardar imagenes de usuarios (Para evitar que se cargue la imagen faltando campos)
const validFields = (body)=>{
    const {firstName,email,password} = body;
    if(!firstName || !email || !password){
        return false;
    } else {
        return true
    }
};

//filtro para validar los campos antes de cargar la imagen
const multerFilterProfile = (req,file,cb)=>{
    const isValid = validFields(req.body);
    if(!isValid){
        cb(null, false)
    } else {
        cb(null, true)
    }
};

const profileStorage = multer.diskStorage({
    //donde voy a guardar los archivos
    destination: function(req,file,cb){
        cb(null,(__dirname + "/public/images/usersMulter"))
    },
    //que nombre tendra el archivo que guardamos
    filename: function(req,file,cb){
        cb(null,`${req.params.uid}-profile-${file.originalname}`)
    }
});

//creamos el uploader de multer
export const uploaderProfile = multer({storage:profileStorage}); // No le aplico el filtro multerFilterProfile porque en profile.handlebars no encuentra "req.body"


//configuracion para guardar documentos de los usuarios
const documentStorage = multer.diskStorage({
    //donde voy a guardar los archivos
    destination: function(req,file,cb){
        cb(null,(__dirname + "/multer/users/documents"))
    },
    //que nombre tendra el archivo que guardamos
    filename: function(req,file,cb){
        cb(null,`${req.user.email}-document-${file.originalname}`)
    }
});
//creamos el uploader de multer
export const uploaderDocument = multer({storage:documentStorage});


//configuracion para guardar imagenes de productos
const productStorage = multer.diskStorage({
    //donde voy a guardar los archivos
    destination: function(req,file,cb){
        cb(null,(__dirname + "/public/images/productsMulter"))
    },
    //que nombre tendra el archivo que guardamos
    filename: function(req,file,cb){
        cb(null,`${req.body.code}-image-${file.originalname}`)
    }
});
//creamos el uploader de multer
export const uploaderProduct = multer({storage:productStorage});

//Ejemplo de como utilizar los uploader
// router.post("/user", uploaderProfile.single("avatar") ,(req,res)=>{});
