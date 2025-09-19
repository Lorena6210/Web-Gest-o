import express from 'express';
import cors from 'cors';
import alunoRoutes from './routes/alunoRoutes';
import gestorRoutes from './routes/gestorRoutes';
import professorRoutes from './routes/professorRoutes';
import responsavelRoutes from './routes/responsavelRoutes';
import notaRoutes from './routes/notaRoutes';
import bimestreRoutes from './routes/bimestreRoutes';
import atividadeRoutes from './routes/atividadeRoutes';
import faltaRoutes from './routes/faltaRoutes';
import turmaRoutes from './routes/turmaRoutes';
import disciplinaRoutes from './routes/disciplinaRoutes';
import historicoMedicoRoutes from './routes/historicoMedicoRoutes';
import loginRoutes from './routes/loginRoutes';
import boletimRoutes from './routes/boletimRoutes';
import eventosRoutes from './routes/eventosRoutes';
import provaRouter from './routes/provaRoutes';
import GradeCurricularRouter from './routes/GradeCurricularRouter';

const app = express();
// const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas
app.use('/alunos', alunoRoutes);
app.use('/gestores', gestorRoutes);
app.use('/professores', professorRoutes);
app.use('/responsaveis', responsavelRoutes);
app.use('/notas', notaRoutes);
app.use('/bimestres', bimestreRoutes);
app.use('/faltas', faltaRoutes);
app.use('/atividades', atividadeRoutes);
app.use('/turmas', turmaRoutes);
app.use('/disciplinas', disciplinaRoutes);
app.use('/historico-medico', historicoMedicoRoutes);
app.use('/login', loginRoutes);
app.use('/boletim', boletimRoutes);
app.use('/eventos', eventosRoutes);
app.use('/provas', provaRouter);
app.use('/grade-curricular', GradeCurricularRouter);


// Iniciar o servidor
app.listen(3001, () => {
  console.log(`Servidor rodando na porta 3001`);
});
