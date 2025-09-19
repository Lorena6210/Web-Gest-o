import { Router } from "express";
import { getEventos, createEvento } from "../controllers/eventos";

const router = Router();

router.get("/", getEventos);
router.post("/", (req, res) => {
try {
    createEvento(req, res);
} catch (error) {
    console.log(error);
}
});

export default router;
