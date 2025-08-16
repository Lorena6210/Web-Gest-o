"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loginController_1 = require("../controllers/loginController");
const router = (0, express_1.Router)();
// Rota para login de Aluno
router.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, loginController_1.login)(req, res);
        res.json(response);
    }
    catch (error) {
        next(error);
    }
}));
// Rota para login de Professor
router.post('/loginProfessor', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, loginController_1.loginProfessor)(req, res);
        res.json(response);
    }
    catch (error) {
        next(error);
    }
}));
// Rota para login de Gestor
router.post('/loginGestor', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, loginController_1.loginGestor)(req, res);
        res.json(response);
    }
    catch (error) {
        next(error);
    }
}));
// Rota para buscar Responsável por Email
router.get('/responsavel', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, loginController_1.buscarResponsavelPorEmail)(req, res);
        res.json(response);
    }
    catch (error) {
        next(error);
    }
}));
// Rota para criar Gestor
router.post('/criarGestor', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, loginController_1.criarGestor)(req, res);
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
}));
// Rota para criar Aluno
router.post('/criarAluno', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, loginController_1.criarAluno)(req, res);
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
}));
// Rota para criar Professor
router.post('/criarProfessor', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, loginController_1.criarProfessor)(req, res);
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
}));
// Rota para buscar todos os registros
router.get('/todos', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, loginController_1.buscarTodos)(req, res);
        res.json(response);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
