import nodemailer from "nodemailer";
import {options} from "../config/options.js";

//credenciales de la cuenta de gmail que usamos para enviar y recibir los correos
const adminEmail=options.gmail.adminAccount;
const adminPass=options.gmail.adminPass;


//configuracion del canal de comunicacion entre nodejs y gmail
const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:587,
    auth:{
        user:adminEmail,
        pass:adminPass
    },
    secure:false,
    tls:{
        rejectUnauthorized:false
    }
});

export {transporter}


//funcion para generar el correo de recuperacion de constraseña
export const sendRecoveryPass = async(userEmail,token)=>{
    const link = `http://localhost:8080/reset-password?token=${token}`;//enlace con el token

    //estructura del correo
    await transporter.sendMail({
        from:options.gmail.adminPass,
        to:userEmail,
        subject:"Restore Password",
        html:`
            <div>
                <h2>You have requested a password change</h2>
                <p>Click on the following link to reset your password</p>
                <a href="${link}">
                    <button> Restore Password </button>
                </a>
            </div>
        `
    })
};