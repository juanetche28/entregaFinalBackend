import { Router, json } from "express";
import {createdMockingProducts} from "../controllers/mocking-products.controller.js"

const router = Router();
router.use(json());

// Creo todas mis rutas de Products

router.get("/", createdMockingProducts); // La ruta raíz GET /mockingProducts deberá listar todos los productos generados de forma aleatoria con Fake.js.

export default router;