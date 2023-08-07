import dotenv from "dotenv";
dotenv.config();


export const options = {
    fileSystem:{
        usersFileName: 'users.json',
        productsFileName: 'products.json',
    },
    mongoDB:{
        url:process.env.MONGO_URL
    },
    server:{
        port:process.env.PORT,
        secretSession: process.env.SECRET_SESSION
    },
    gmail:{
        emailToken:process.env.SECRET_TOKEN_EMAIL,
        adminAccount:process.env.ADMIN_EMAIL,
        adminPass:process.env.ADMIN_PASS
    },
    entorno:{
        nodeEnv:process.env.NODE_ENV
    },
    stripe: {
        clave_secreta: process.env.STRIPE_KEY,
        clave_react: process.env.REACT_APP_STRIPE_KEY
    }
};  