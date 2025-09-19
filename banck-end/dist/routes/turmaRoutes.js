"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const turmaController_1 = require("../controllers/turmaController");
const router = (0, express_1.Router)();
// Criar turma
router.post('/', turmaController_1.criarTurma);
// Listar todas as turmas básicas
router.get('/', turmaController_1.listarTurmasComDetalhes);
router.get('/:id', (req, res) => {
    (0, turmaController_1.obterTurmaPorId)(req, res);
});
// 🔹 Buscar uma turma completa por ID (compatível com seu fetchTurmaCompleta)
router.get('/:id/completa', (req, res) => {
    (0, turmaController_1.obterTurmaCompleta)(req, res);
});
// Adicionar/remover aluno
router.post('/:idTurma/alunos/:idAluno', (req, res) => {
    (0, turmaController_1.adicionarAluno)(req, res);
});
router.delete('/:idTurma/alunos/:idAluno', turmaController_1.removerAluno);
// Adicionar professor e disciplina
router.post('/:idTurma/professores/:idProfessor/disciplinas/:idDisciplina', (req, res) => {
    (0, turmaController_1.adicionarProfessorTurmaDisciplina)(req, res);
});
// Adicionar disciplina
router.post('/:idTurma/disciplinas/:idDisciplina', turmaController_1.adicionarDisciplina);
// Adicionar falta
router.post('/:idTurma/alunos/:idAluno/faltas', (req, res) => {
    (0, turmaController_1.adicionarFalta)(req, res);
});
// Adicionar nota
router.post('/:idTurma/alunos/:idAluno/notas', (req, res) => {
    (0, turmaController_1.adicionarNotaItem)(req, res);
});
// Adicionar atividade
router.post('/:idTurma/atividades', (req, res) => {
    (0, turmaController_1.adicionarAtividade)(req, res);
});
// Adicionar Prova
router.post('/:idTurma/provas', (req, res) => {
    (0, turmaController_1.adicionarProva)(req, res);
});
// Adicionar evento
router.post('/:idTurma/eventos', turmaController_1.adicionarEvento);
// Visualizar notas e faltas
router.get('/alunos/:idAluno/notas-faltas', turmaController_1.visualizarNotasItens);
router.post('/:idTurma/alunos/:idAluno/notas', (req, res) => {
    (0, turmaController_1.adicionarNotaItem)(req, res);
});
router.post('/:idTurma/alunos/:idAluno/faltas', (req, res) => {
    (0, turmaController_1.adicionarFalta)(req, res);
});
router.put('/:idTurma', (req, res) => { (0, turmaController_1.editarTurmaParcial)(req, res); });
router.patch("/:id/editar", (req, res) => { (0, turmaController_1.editarTurmaParcial)(req, res); });
router.delete('/:id/excluir', (req, res) => { (0, turmaController_1.excluirTurma)(req, res); });
exports.default = router;
