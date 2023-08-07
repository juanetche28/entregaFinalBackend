import { Router, json } from "express";
import { checkRole, checkAuthenticated} from "../middlewares/auth.js";
import usersControll from "../controllers/user.controller.js"
import { uploaderDocument, uploaderProfile } from "../utils.js";

const router = Router();

router.use(json());

// Creo todas mis rutas de Usuarios

router.get("/", checkRole(["admin"]), usersControll.GetUser); // La ruta raíz GET /api/users deberá listar todos los usuarios de la base. (solo para rol admin)

router.get("/:uid", usersControll.GetUserById); // La ruta GET /:uid deberá traer sólo el usuario con el id proporcionado

router.delete("/:uid", checkRole(["admin"]), usersControll.DeleteUser); // La ruta DELETE /uid deberá eliminar el usuario con el uid indicado.

router.get("/delete/:uid", checkRole(["admin"]), usersControll.DeleteUser); // misma funcionalidad que la anterior, uso get porque html no me acepta el method "delete"

router.put("/premium/:uid", checkRole(["admin"]), usersControll.changeRol);  // Debera cambiar de rol "user" a "premium" y viceversa

router.post("/premium/:uid", checkRole(["admin"]), usersControll.changeRol);  // misma funcion que la anterior. Uso post porque en html el form no reconoce el method "put"

router.post("/editName/:uid", checkAuthenticated, usersControll.changeName); // Cambio el Nombre y Apellido del usuario con ID uid

router.post("/changeAvatar/:uid", checkAuthenticated, uploaderProfile.single("profile"), usersControll.changeAvatar); // Cambio la foto de perfil del usuario uid

router.put("/:uid/documents", checkAuthenticated , uploaderDocument.fields([{name:"identificacion",maxCount:1}, {name:"domicilio",maxCount:1},{name:"estadoDeCuenta",maxCount:1}]), usersControll.uploaderDocuments)

router.delete("/", usersControll.deleteInactiveUsers); // La ruta DELETE /uid deberá eliminar todos los usuarios con mas de 30 dias de inactividad

export default router;
