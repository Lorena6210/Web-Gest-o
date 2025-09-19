"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const alunoRoutes_1 = __importDefault(require("./routes/alunoRoutes"));
const gestorRoutes_1 = __importDefault(require("./routes/gestorRoutes"));
const professorRoutes_1 = __importDefault(require("./routes/professorRoutes"));
const responsavelRoutes_1 = __importDefault(require("./routes/responsavelRoutes"));
const notaRoutes_1 = __importDefault(require("./routes/notaRoutes"));
const bimestreRoutes_1 = __importDefault(require("./routes/bimestreRoutes"));
const atividadeRoutes_1 = __importDefault(require("./routes/atividadeRoutes"));
const faltaRoutes_1 = __importDefault(require("./routes/faltaRoutes"));
const turmaRoutes_1 = __importDefault(require("./routes/turmaRoutes"));
const disciplinaRoutes_1 = __importDefault(require("./routes/disciplinaRoutes"));
const historicoMedicoRoutes_1 = __importDefault(require("./routes/historicoMedicoRoutes"));
const loginRoutes_1 = __importDefault(require("./routes/loginRoutes"));
const boletimRoutes_1 = __importDefault(require("./routes/boletimRoutes"));
const eventosRoutes_1 = __importDefault(require("./routes/eventosRoutes"));
const provaRoutes_1 = __importDefault(require("./routes/provaRoutes"));
const GradeCurricularRouter_1 = __importDefault(require("./routes/GradeCurricularRouter"));
const app = (0, express_1.default)();
// const PORT = 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Rotas
app.use('/alunos', alunoRoutes_1.default);
app.use('/gestores', gestorRoutes_1.default);
app.use('/professores', professorRoutes_1.default);
app.use('/responsaveis', responsavelRoutes_1.default);
app.use('/notas', notaRoutes_1.default);
app.use('/bimestres', bimestreRoutes_1.default);
app.use('/faltas', faltaRoutes_1.default);
app.use('/atividades', atividadeRoutes_1.default);
app.use('/turmas', turmaRoutes_1.default);
app.use('/disciplinas', disciplinaRoutes_1.default);
app.use('/historico-medico', historicoMedicoRoutes_1.default);
app.use('/login', loginRoutes_1.default);
app.use('/boletim', boletimRoutes_1.default);
app.use('/eventos', eventosRoutes_1.default);
app.use('/provas', provaRoutes_1.default);
app.use('/grade-curricular', GradeCurricularRouter_1.default);
// Iniciar o servidor
app.listen(3001, () => {
    console.log(`Servidor rodando na porta 3001`);
});
