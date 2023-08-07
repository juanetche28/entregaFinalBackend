import { UserManager } from "../dao/index.js";
import { userModel } from "../dao/models/user.model.js"
import {transporter} from "../utils/email.js"
import __dirname from "../utils.js";

const userManager = new UserManager();

// GetUserController deberá listar todos los usuaros de la base en La ruta raíz GET /users

const GetUser = async (req, res) => {
    const users = await userManager.getUsers();
      res.status(201).send({status: "Ok", payload: users})
    // }
};


// GetUserByIdController deberá traer sólo el usuario con el id proporcionado en La ruta GET /:uid


const GetUserById = async (req, res) => {
    const uid = JSON.stringify(req.params.uid);
    const user = await userModel.find().lean()
    const userWithSameId = user.some((u) => {
      return JSON.stringify(u._id) === uid;
    });
    if (userWithSameId) {
      const userFind = await userManager.getUserById(JSON.parse(uid));
      res.status(201).send({status: "Ok", payload: userFind});
    } else {
      res.status(404).send({status: "Error", payload: `User with id ${uid} not found`});
    }
};

// changeName debera cambiar el nombre del usuario con id uid

const changeName = async (req, res) => {
  const uid = JSON.stringify(req.params.uid);
  const dataToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName
  }
  if (!dataToUpdate.firstName || !dataToUpdate.lastName) {
    res.status(404).send({status: "Error", payload: `Please don't leave fields blank.`});
  } else {
    const user = await userModel.find().lean()
    const userWithSameId = user.some((u) => {
      return JSON.stringify(u._id) === uid;
    });
    if (userWithSameId) {
      userManager.updateUser(JSON.parse(uid), dataToUpdate); 
      res.status(201).redirect("/profile") 
      // res.status(201).send({status: "Ok", payload:  `User with id ${uid} updated`});
    } else {
      res.status(404).send({status: "Error", payload: `User with id ${uid} not found`});
    } 
  }
};

// changeAvatar debera cambiar la foto de perfil del usuario uid

const changeAvatar = async (req, res) => {
  try {
    const userId = req.params.uid;
    const user = await userModel.findById(userId);
    if(user){
      const profile = req.file || null;
      if(profile){
        user.avatar = ("http://localhost:8080/images/usersMulter/" + profile.filename);
        const userUpdated = await userModel.findByIdAndUpdate(user._id,user);
        res.status(201).redirect("/profile") 
        // res.json({status:"success", message:"Updated avatar"});
      } else {res.json({status:"error", message:"It isn't possible to upload the avatar. profile image wasn't found "})}
    } else {
      res.json({status:"error", message:"It isn't possible to upload the avatar. User wasn't found "})
    }
  } catch (error) {
      res.json({status:"error", message:"Error loading pictures."})
  }
}


// DeleteUserController deberá eliminar el usuario con el uid indicado en La ruta DELETE /:uid 

const DeleteUser = async (req, res) => {
    const uid = JSON.stringify(req.params.uid);
    const user = await userModel.find().lean()
    const userWithSameId = user.some((u) => {
      return JSON.stringify(u._id) === uid;
    });
    if (userWithSameId) {
      userManager.deleteUser(JSON.parse(uid))
      res.status(201).send({status: "Ok", payload: `The User with id ${uid} was successfully Deleted`});
    } else {
      res.status(404).send({status: "Error", payload: `User with id ${uid} not found`});
    }
};

const changeRol = async (req, res) => {
  const uid = JSON.stringify(req.params.uid);
  const userFind = await userManager.getUserById(JSON.parse(uid));
  var user = await userModel.find().lean()
  console.log("user Find: ",userFind)
  const userExist = user.some((u) => {
    return JSON.stringify(u._id) === uid;
  });
  if (userExist) {
    const rol = userFind.rol;
    const email = userFind.email;
    const status = userFind.status;
    if (rol === "premium") {
      const dataToUpdate = {rol: "user"};
      userManager.updateUser(JSON.parse(uid), dataToUpdate);  
      res.status(201).send({status: "Ok", payload: `The User with email ${email}, now has rol: ${dataToUpdate.rol}`});
    } else if (rol === "user") {
      const dataToUpdate = {rol: "premium"};
      // if(user.documents.length<3 && user.status !== "complete")
      if(status !== "complete"){
        return res.json({status:"error", message:"The user hasn't uploaded all the documents"});
      } else {
        userManager.updateUser(JSON.parse(uid), dataToUpdate);  
        res.status(201).send({status: "Ok", payload: `The User with email ${email}, now has rol: ${dataToUpdate.rol}`});
      }
    } else {
      res.status(404).send({status: "Error", payload: `You cannot change the role of an admin user.`});
    }
  } else { 
    res.status(404).send({status: "Error", payload: `User with id ${uid} not found`});
  }
}


const uploaderDocuments = async (req, res) => {
  try {
    const userId = req.params.uid;
    const user = await userModel.findById(userId);
    if(user){
        const identificacion = req.files['identificacion']?.[0] || null;
        const domicilio = req.files['domicilio']?.[0] || null;
        const estadoDeCuenta = req.files['estadoDeCuenta']?.[0] || null;
        const docs = [];
        if(identificacion){
            docs.push({name:"identificacion",reference:identificacion.filename});
        }
        if(domicilio){
            docs.push({name:"domicilio",reference:domicilio.filename});
        }
        if(estadoDeCuenta){
            docs.push({name:"estadoDeCuenta",reference:estadoDeCuenta.filename});
        }
        if(docs.length === 3){
            user.status = "complete";
        } else {
            user.status = "incomplete";
        }
        user.documents = docs;
        const userUpdated = await userModel.findByIdAndUpdate(user._id,user);
        res.json({status:"success", message:"Updated documents"});

    } else {
        res.json({status:"error", message:"It isn't possible to upload the documents."})
    }
  } catch (error) {
      res.json({status:"error", message:"Error loading documents."})
  }
}

const deleteInactiveUsers = async (req, res) => {
  const users = await userModel.find().lean()
  const usersLenght = users.length;
  const dateToday = new Date();
  for (let step = 0; step < usersLenght; step++) {
    if (users[step].last_connection === null) {
      return res.status(404).send({status: "Error", payload: `User Number: ${step} and mail: ${users[step].email} Never LogIn`});
    } else {
      let inactiveDays = Math.floor((dateToday.getTime() - users[step].last_connection.getTime())/1000/60/60);  // Obtenego los dias y lo redondeo para abajo
      if (inactiveDays < 1) {
        const emailTemplate = `<div> 
        <h1>Account terminated!</h1>
        <p>Mail: <b>${users[step].email}</b></p>
        <p>We are very sorry that you have left us.</p>
        <a href="http://localhost:8080/">Home</a>
        <br>
        <img src="cid:goodBye"/>
        </div>`;
        const contenido = await transporter.sendMail({
        //estructura del correo
        from:"ecommerce Aromas en el Alma",
        to: users[step].email,
        subject:"Account closed due to inactivity.",
        html:emailTemplate,
        attachments: [
          {
            filename:"goodBye.png",
            path:(__dirname+"/public/images/goodBye.png"),
            cid:"goodBye" // Definido en el template
          }
        ]
        });
        await userModel.deleteOne({"email": users[step].email});
      }  
    }
  }
  res.send("Inactive Users deleted");
}


export default {
  GetUser,
  GetUserById,
  DeleteUser, 
  changeRol, 
  uploaderDocuments,
  deleteInactiveUsers,
  changeName,
  changeAvatar
}