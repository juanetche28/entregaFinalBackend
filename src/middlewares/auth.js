export const checkRole = (roles)=>{
    return (req,res,next)=>{
        if(!req.user){
            return res.json({status:"error", message:"You need to be authenticated"});
        }
        if(!roles.includes(req.user.rol)){
            return res.json({status:"error", message:"You are not authorized. Check your rol"});
        }
        next();
    }
}

// Funcion para chequear que el usuario "premium" solo pueda borrar sus productos. Toma de parametros el rol del usuario, su email y compara con el campo owner del producto que sea el mismo mail

export const verifyPremiumUser = (rol, email, owner) => {
    if (rol === "premium") {
        if (email === owner) {
            return true
        } else {
            return null
        }
    } else {
        return true // Si llego hasta aca quiere decir que es admin (user no es posibilidad xq lo filtra el checkrole)
    }
}


export const checkAuthenticated = (req,res,next)=>{
    if(req.user){
        next();
    } else {
        return res.json({status:"error", message:"You need to be authenticated"});
    }
};