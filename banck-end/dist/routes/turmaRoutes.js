"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const turmaController_1 = require("../controllers/turmaController");
const router = (0, express_1.Router)();
// Criar turma
router.post('/', turmaController_1.criarTurma);
// Listar todas as turmas básicas
router.get('/', turmaController_1.listarTurmas);
// 🔹 Buscar uma turma completa por ID (compatível com seu fetchTurmaCompleta)
router.get('/:id/completa', turmaController_1.obterTurmaCompleta);
// Adicionar/remover aluno
router.post('/:idTurma/alunos/:idAluno', turmaController_1.adicionarAluno);
router.delete('/:idTurma/alunos/:idAluno', turmaController_1.removerAluno);
// Adicionar professor e disciplina
router.post('/:idTurma/professores/:idProfessor/disciplinas/:idDisciplina', turmaController_1.adicionarProfessorTurmaDisciplina);
// Adicionar disciplina
router.post('/:idTurma/disciplinas/:idDisciplina', turmaController_1.adicionarDisciplina);
// Adicionar falta
router.post('/:idTurma/alunos/:idAluno/faltas', (req, res) => {
    (0, turmaController_1.adicionarFalta)(req, res);
});
// Adicionar nota
router.post('/:idTurma/alunos/:idAluno/notas', turmaController_1.adicionarNota);
// Adicionar atividade
router.post('/:idTurma/atividades', turmaController_1.adicionarAtividade);
// Adicionar evento
router.post('/:idTurma/eventos', turmaController_1.adicionarEvento);
// Visualizar notas e faltas
router.get('/alunos/:idAluno/notas-faltas', turmaController_1.visualizarNotasEFaltas);
exports.default = router;
