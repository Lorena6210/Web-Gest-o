"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventos_1 = require("../controllers/eventos");
const router = (0, express_1.Router)();
router.get("/", eventos_1.getEventos);
router.post("/", (req, res) => {
    try {
        (0, eventos_1.createEvento)(req, res);
    }
    catch (error) {
        console.log(error);
    }
});
exports.default = router;
