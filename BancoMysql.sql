-- Criação do novo banco de dados
CREATE DATABASE IF NOT EXISTS ControlHub;
USE ControlHub;

	-- Tabela: Gestor
	CREATE TABLE Gestor (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Nome VARCHAR(100) NOT NULL,
		CPF VARCHAR(14) UNIQUE,
		Email VARCHAR(100) NOT NULL UNIQUE,
		Senha VARCHAR(100) NOT NULL,
		Telefone VARCHAR(20),
		DataNascimento DATE,
		Genero ENUM('Masculino', 'Feminino', 'Outro'),
		FotoPerfil VARCHAR(255),
		Cargo VARCHAR(100),
		Status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo',
		TokenRecuperacaoSenha VARCHAR(100),
		ValidadeToken DATETIME
	);

	-- Tabela: Disciplina
	CREATE TABLE Disciplina (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Nome VARCHAR(100) NOT NULL,
		Codigo VARCHAR(10) NOT NULL UNIQUE,
		Ementa TEXT,
		CargaHoraria INT,
		PreRequisitos TEXT
	);

	-- Tabela: Professor
	CREATE TABLE Professor (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Nome VARCHAR(100) NOT NULL,
		CPF VARCHAR(14) UNIQUE,
		Email VARCHAR(100) NOT NULL UNIQUE,
		Senha VARCHAR(100) NOT NULL,
		Telefone VARCHAR(20),
		Endereco TEXT,
		DataNascimento DATE,
		Genero ENUM('Masculino', 'Feminino', 'Outro'),
		FotoPerfil VARCHAR(255),
		FormacaoAcademica TEXT,
		DataContratacao DATE,
		Status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo',
		TokenRecuperacaoSenha VARCHAR(100),
		ValidadeToken DATETIME
	);

	-- Tabela: Turma
	CREATE TABLE Turma (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Nome VARCHAR(100) NOT NULL,
		Serie VARCHAR(20),
		AnoLetivo YEAR,
		Turno ENUM('Manhã', 'Tarde', 'Noite'),
		Sala VARCHAR(20),
		CapacidadeMaxima INT,
		Status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo'
	);

	CREATE TABLE Serie (
	  Id INT PRIMARY KEY AUTO_INCREMENT,
	  Nome VARCHAR(50) NOT NULL UNIQUE
	);

	CREATE TABLE Turno (
	  Id INT PRIMARY KEY AUTO_INCREMENT,
	  Nome VARCHAR(50) NOT NULL UNIQUE
	);

	CREATE TABLE Sala (
	  Id INT PRIMARY KEY AUTO_INCREMENT,
	  Nome VARCHAR(50) NOT NULL UNIQUE
	);

	ALTER TABLE Turma
	ADD COLUMN Id_Serie INT,
	ADD COLUMN Id_Turno INT,
	ADD COLUMN Id_Sala INT;

	-- Tabela de associação (many-to-many): Professor_Turma
	CREATE TABLE Professor_Turma (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Id_Professor INT NOT NULL,
		Id_Turma INT NOT NULL,
		Status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo',
		FOREIGN KEY (Id_Professor) REFERENCES Professor(Id) ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Turma) REFERENCES Turma(Id) ON DELETE CASCADE ON UPDATE CASCADE,
		UNIQUE (Id_Professor, Id_Turma)
	);

	-- Tabela: Responsavel
	CREATE TABLE Responsavel (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Nome VARCHAR(100) NOT NULL,
		Email VARCHAR(100) UNIQUE NOT NULL,
		Senha VARCHAR(255) NOT NULL DEFAULT 'senha_padrao',
		Telefone VARCHAR(20),
		Endereco TEXT,
		DataNascimento DATE,
		Genero ENUM('Masculino', 'Feminino', 'Outro'),
		FotoPerfil VARCHAR(255),
		Parentesco VARCHAR(50),
		Status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo'
	);

	ALTER TABLE Responsavel
	ADD COLUMN CPF VARCHAR(14) UNIQUE;

	-- Tabela: Aluno
	CREATE TABLE Aluno (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		CPF VARCHAR(14) NOT NULL UNIQUE,
		Historico_Medico TEXT,
		Contato_de_Emergencia VARCHAR(100),
		Nome VARCHAR(100) NOT NULL,
		Senha VARCHAR(100) NOT NULL,
		Telefone VARCHAR(100) NOT NULL,
		Endereco TEXT,
		DataNascimento DATE,
		Genero ENUM('Masculino', 'Feminino', 'Outro'),
		FotoPerfil VARCHAR(255),
		Status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo',
		RA VARCHAR(20) UNIQUE,
		TokenRecuperacaoSenha VARCHAR(100),
		ValidadeToken DATETIME,
		Id_Responsavel INT,
		FOREIGN KEY (Id_Responsavel) REFERENCES Responsavel(Id)
			ON DELETE SET NULL ON UPDATE CASCADE
	);

	-- Tabela de associação: Aluno_Responsavel
	CREATE TABLE Aluno_Responsavel (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Id_Aluno INT NOT NULL,
		Id_Responsavel INT NOT NULL,
		Status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo',
		FOREIGN KEY (Id_Aluno) REFERENCES Aluno(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Responsavel) REFERENCES Responsavel(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		UNIQUE (Id_Aluno, Id_Responsavel)
	);

	-- Tabela de associação: Aluno_Turma
	CREATE TABLE Aluno_Turma (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Id_Aluno INT NOT NULL,
		Id_Turma INT NOT NULL,
		DataEntrada DATE,
		DataSaida DATE,
		Status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo',
		FOREIGN KEY (Id_Aluno) REFERENCES Aluno(Id) ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Turma) REFERENCES Turma(Id) ON DELETE CASCADE ON UPDATE CASCADE,
		UNIQUE (Id_Aluno, Id_Turma)
	);

	-- Tabela: Usuaria
	CREATE TABLE Usuaria (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		RA VARCHAR(20) UNIQUE,
		CPF VARCHAR(14) UNIQUE,
		Nome VARCHAR(100) NOT NULL,
		Email VARCHAR(100) NOT NULL UNIQUE,
		Senha VARCHAR(100) NOT NULL,
		Telefone VARCHAR(20),
		Endereco TEXT,
		DataNascimento DATE,
		Genero ENUM('Masculino', 'Feminino', 'Outro'),
		FotoPerfil VARCHAR(255),
		Id_Aluno INT,
		Id_Responsavel INT,
		Id_Professor INT,
		Id_Gestor INT,
		FOREIGN KEY (Id_Aluno) REFERENCES Aluno(Id)
			ON DELETE SET NULL ON UPDATE CASCADE,
		FOREIGN KEY (Id_Responsavel) REFERENCES Responsavel(Id)
			ON DELETE SET NULL ON UPDATE CASCADE,
		FOREIGN KEY (Id_Professor) REFERENCES Professor(Id)
			ON DELETE SET NULL ON UPDATE CASCADE,
		FOREIGN KEY (Id_Gestor) REFERENCES Gestor(Id)
			ON DELETE SET NULL ON UPDATE CASCADE
	);

CREATE TABLE Atividade (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Titulo VARCHAR(100) NOT NULL,
    Descricao TEXT,
    DataCriacao DATE NOT NULL,
    DataEntrega DATE,
    Id_Professor INT NOT NULL,
    Id_Turma INT NOT NULL,
    Id_Disciplina INT NOT NULL,  -- Adicionando a coluna para a disciplina
    FOREIGN KEY (Id_Professor) REFERENCES Professor(Id) ON DELETE CASCADE,
    FOREIGN KEY (Id_Turma) REFERENCES Turma(Id) ON DELETE CASCADE,
    FOREIGN KEY (Id_Disciplina) REFERENCES Disciplina(Id) ON DELETE CASCADE  -- Chave estrangeira para Disciplina
);

	-- Tabela: EntregaAtividade
	CREATE TABLE EntregaAtividade (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Id_Atividade INT NOT NULL,
		Id_Aluno INT NOT NULL,
		DataEntrega DATE,
		Resposta TEXT,
		FOREIGN KEY (Id_Atividade) REFERENCES Atividade(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Aluno) REFERENCES Aluno(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		UNIQUE (Id_Atividade, Id_Aluno)
	);

	CREATE TABLE Bimestre (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Nome VARCHAR(50) NOT NULL,
		DataInicio DATE,
		DataFim DATE,
		Status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo'
	);


	-- Tabela: Nota
	CREATE TABLE Nota (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Id_Aluno INT NOT NULL,
		Id_Turma INT NOT NULL,
		Id_Bimestre INT NOT NULL,
		Valor DECIMAL(5,2) NOT NULL,
		FOREIGN KEY (Id_Aluno) REFERENCES Aluno(Id) ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Turma) REFERENCES Turma(Id) ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Bimestre) REFERENCES Bimestre(Id) ON DELETE CASCADE ON UPDATE CASCADE
	);

	-- Tabela: Falta
	CREATE TABLE Falta (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Id_Aluno INT NOT NULL,
		Id_Turma INT NOT NULL,
		Id_Disciplina INT NOT NULL,
		DataFalta DATE NOT NULL,
		Justificada BOOLEAN DEFAULT FALSE,
		FOREIGN KEY (Id_Aluno) REFERENCES Aluno(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Turma) REFERENCES Turma(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Disciplina) REFERENCES Disciplina(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		UNIQUE (Id_Aluno, Id_Turma, DataFalta)
	);

	-- Tabela: FeedbackPedagogico
	CREATE TABLE FeedbackPedagogico (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Id_Aluno INT NOT NULL,
		Id_Professor INT NOT NULL,
		DataLancamento DATETIME DEFAULT CURRENT_TIMESTAMP,
		Conteudo TEXT NOT NULL,
		FOREIGN KEY (Id_Aluno) REFERENCES Aluno(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Professor) REFERENCES Professor(Id)
			ON DELETE CASCADE ON UPDATE CASCADE
	);

	-- Relação: Atividade por Bimestre
	CREATE TABLE Bimestre_Atividade (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Id_Atividade INT NOT NULL,
		Id_Bimestre INT NOT NULL,
		FOREIGN KEY (Id_Atividade) REFERENCES Atividade(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Bimestre) REFERENCES Bimestre(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		UNIQUE (Id_Atividade, Id_Bimestre)
	);

	-- Relação: Nota por Bimestre
	CREATE TABLE Bimestre_Nota (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Id_Nota INT NOT NULL,
		Id_Bimestre INT NOT NULL,
		FOREIGN KEY (Id_Nota) REFERENCES Nota(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Bimestre) REFERENCES Bimestre(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		UNIQUE (Id_Nota, Id_Bimestre)
	);

	-- Relação: Falta por Bimestre
	CREATE TABLE Bimestre_Falta (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Id_Falta INT NOT NULL,
		Id_Bimestre INT NOT NULL,
		FOREIGN KEY (Id_Falta) REFERENCES Falta(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Bimestre) REFERENCES Bimestre(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		UNIQUE (Id_Falta, Id_Bimestre)
	);


	-- Tabela: EventoEscolar
	CREATE TABLE EventoEscolar (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Titulo VARCHAR(100) NOT NULL,
		Descricao TEXT,
		DataInicio DATETIME NOT NULL,
		DataFim DATETIME,
		Local VARCHAR(100),
		PublicoAlvo ENUM('Todos', 'Alunos', 'Professores', 'Responsaveis', 'Gestores') DEFAULT 'Todos'
	);

	-- Tabela: Boletim
	CREATE TABLE Boletim (
		Id INT AUTO_INCREMENT PRIMARY KEY,
		Id_Aluno INT NOT NULL,
		Id_Disciplina INT NOT NULL,
		Id_Bimestre INT NOT NULL,
		MediaFinal DECIMAL(5,2),
		Situacao ENUM('Aprovado', 'Reprovado', 'Recuperacao') DEFAULT NULL,
		Observacoes TEXT,
		FOREIGN KEY (Id_Aluno) REFERENCES Aluno(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Disciplina) REFERENCES Disciplina(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Bimestre) REFERENCES Bimestre(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		UNIQUE (Id_Aluno, Id_Disciplina, Id_Bimestre)
	);

	-- Tabela: LogAcesso
	CREATE TABLE LogAcesso (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Id_Usuario INT NOT NULL,
		Acao VARCHAR(100) NOT NULL,
		DataHora DATETIME DEFAULT CURRENT_TIMESTAMP,
		IP VARCHAR(45),
		Dispositivo VARCHAR(100),
		FOREIGN KEY (Id_Usuario) REFERENCES Usuaria(Id)
			ON DELETE CASCADE ON UPDATE CASCADE
	);

	-- Tabela: Notificacao
	CREATE TABLE Notificacao (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Id_Usuario INT NOT NULL,
		Titulo VARCHAR(100) NOT NULL,
		Mensagem TEXT NOT NULL,
		Visualizado BOOLEAN DEFAULT FALSE,
		DataEnvio DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (Id_Usuario) REFERENCES Usuaria(Id)
			ON DELETE CASCADE ON UPDATE CASCADE
	);

	-- Tabela: RecuperacaoSenha
	DROP TABLE IF EXISTS RecuperacaoSenha;

	CREATE TABLE RecuperacaoSenha (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Id_Aluno INT,
		Id_Professor INT,
		Id_Gestor INT,
		Email VARCHAR(100) NOT NULL,
		Token VARCHAR(255) NOT NULL UNIQUE,
		DataSolicitacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		DataExpiracao DATETIME NOT NULL,
		TipoUsuario ENUM('Aluno', 'Professor', 'Gestor', 'Responsavel') NOT NULL,
		Usado BOOLEAN DEFAULT FALSE,
		FOREIGN KEY (Id_Aluno) REFERENCES Aluno(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Professor) REFERENCES Professor(Id)
			ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Gestor) REFERENCES Gestor(Id)
			ON DELETE CASCADE ON UPDATE CASCADE
	);

	-- Tabela: Cadastro_de_Usuario_nova
	DROP TABLE IF EXISTS Cadastro_de_Usuario_nova;

	CREATE TABLE Cadastro_de_Usuario_nova (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		CPF VARCHAR(14) NOT NULL UNIQUE,
		Nome VARCHAR(100) NOT NULL,
		Ano YEAR,
		Tipo ENUM('Aluno', 'Responsavel', 'Professor', 'Gestor') NOT NULL,
		CriadoPorGestor BOOLEAN DEFAULT FALSE,
		NivelAcesso ENUM('Leitura', 'Escrita', 'Administrador') DEFAULT 'Leitura',
		CHECK (
			((Tipo IN ('Aluno', 'Professor', 'Responsavel')) AND CriadoPorGestor = TRUE)
			OR Tipo = 'Gestor'
		)
	);

	-- Trigger para restrição de criação de usuários
	DELIMITER $$

	CREATE TRIGGER trg_CadastroUsuario_SomenteGestor
	BEFORE INSERT ON Cadastro_de_Usuario_nova
	FOR EACH ROW
	BEGIN
	  IF NEW.CriadoPorGestor = FALSE AND NEW.Tipo != 'Gestor' THEN
		SIGNAL SQLSTATE '45000' 
		SET MESSAGE_TEXT = 'Apenas gestores podem criar cadastros de outros usuários.';
	  END IF;
	END$$

	DELIMITER ;

	-- Procedimentos para ativar e desativar usuários
	DROP PROCEDURE IF EXISTS Desativar_Aluno;

	DELIMITER $$

	CREATE PROCEDURE Desativar_Aluno (IN alunoId INT)
	BEGIN
	  UPDATE Aluno 
		SET Status = 'Inativo' 
		WHERE Id = alunoId;

	  UPDATE Aluno_Turma 
		SET DataSaida = CURDATE(), Status = 'Inativo' 
		WHERE Id_Aluno = alunoId AND DataSaida IS NULL;
	END$$

	DELIMITER ;

	DROP PROCEDURE IF EXISTS Ativar_Aluno;

	DELIMITER $$

	CREATE PROCEDURE Ativar_Aluno (IN alunoId INT)
	BEGIN
		UPDATE Aluno 
		SET Status = 'Ativo' 
		WHERE Id = alunoId;

		UPDATE Aluno_Turma 
		SET Status = 'Ativo', DataSaida = NULL 
		WHERE Id_Aluno = alunoId;
	END$$

	DELIMITER ;

	DROP PROCEDURE IF EXISTS Desativar_Professor;

	DELIMITER $$

	CREATE PROCEDURE Desativar_Professor (IN professorId INT) 
	BEGIN
		UPDATE Professor 
		SET Status = 'Inativo' 
		WHERE Id = professorId;

		UPDATE Professor_Turma 
		SET Status = 'Inativo' 
		WHERE Id_Professor = professorId;

		UPDATE Atividade 
		SET DataEntrega = NULL 
		WHERE Id_Professor = professorId AND DataEntrega > NOW();
	END$$

	DELIMITER ;

	DROP PROCEDURE IF EXISTS Ativar_Professor;

	DELIMITER $$

	CREATE PROCEDURE Ativar_Professor (IN professorId INT)
	BEGIN
		UPDATE Professor 
		SET Status = 'Ativo' 
		WHERE Id = professorId;

		UPDATE Professor_Turma 
		SET Status = 'Ativo' 
		WHERE Id_Professor = professorId;
	END$$

	DELIMITER ;

	DROP PROCEDURE IF EXISTS Desativar_Responsavel;

	DELIMITER $$

	CREATE PROCEDURE Desativar_Responsavel (IN responsavelId INT)
	BEGIN
		UPDATE Responsavel 
		SET Status = 'Inativo' 
		WHERE Id = responsavelId;

		UPDATE Aluno_Responsavel 
		SET Status = 'Inativo' 
		WHERE Id_Responsavel = responsavelId;
	END$$

	DELIMITER ;

	DROP PROCEDURE IF EXISTS Ativar_Responsavel;

	DELIMITER $$

	CREATE PROCEDURE Ativar_Responsavel (IN responsavelId INT)
	BEGIN
		UPDATE Responsavel 
		SET Status = 'Ativo' 
		WHERE Id = responsavelId;

		UPDATE Aluno_Responsavel 
		SET Status = 'Ativo' 
		WHERE Id_Responsavel = responsavelId;
	END$$

	DELIMITER ;

	DROP PROCEDURE IF EXISTS Desativar_Gestor;

	DELIMITER $$

	CREATE PROCEDURE Desativar_Gestor (IN gestorId INT)
	BEGIN
		UPDATE Gestor 
		SET Status = 'Inativo' 
		WHERE Id = gestorId;
	END$$

	DELIMITER ;

	DROP PROCEDURE IF EXISTS Ativar_Gestor;

	DELIMITER $$

	CREATE PROCEDURE Ativar_Gestor (IN gestorId INT)
	BEGIN
		UPDATE Gestor 
		SET Status = 'Ativo' 
		WHERE Id = gestorId;
	END$$

	DELIMITER ;

	-- Inserindo dados na tabela Gestor
	INSERT IGNORE INTO Gestor (Nome, CPF, Email, Senha, Telefone, DataNascimento, Genero, Cargo, Status) VALUES
	('Sandra Martins', '12345678901', 'sandra.martins@example.com', 'gestor123', '912345678', '1975-12-25', 'Feminino', 'Diretora', 'Ativo'),
	('João Silva', '23456789012', 'joao.silva@example.com', 'gestor456', '919876543', '1980-01-01', 'Masculino', 'Coordenador', 'Ativo'),
	('Ana Costa', '34567890123', 'ana.costa@example.com', 'gestor789', '918765432', '1985-02-02', 'Feminino', 'Coordenadora', 'Ativo'),
	('Pedro Almeida', '45678901234', 'pedro.almeida@example.com', 'gestor321', '917654321', '1982-03-03', 'Masculino', 'Diretor', 'Ativo'),
	('Mariana Lima', '56789012345', 'mariana.lima@example.com', 'gestor654', '916543210', '1988-04-04', 'Feminino', 'Gestora', 'Ativo'),
	('Carlos Pereira', '67890123456', 'carlos.pereira@example.com', 'gestor987', '915432109', '1983-05-05', 'Masculino', 'Diretor', 'Ativo'),
	('Fernanda Rocha', '78901234567', 'fernanda.rocha@example.com', 'gestor321x', '914321098', '1990-06-06', 'Feminino', 'Coordenadora', 'Ativo'),
	('Roberto Santos', '89012345678', 'roberto.santos@example.com', 'gestor321y', '913210987', '1981-07-07', 'Masculino', 'Diretor', 'Ativo'),
	('Juliana Martins', '90123456789', 'juliana.martins@example.com', 'gestor654x', '912109876', '1995-08-08', 'Feminino', 'Gestora', 'Ativo'),
	('Ricardo Ferreira', '01234567890', 'ricardo.ferreira@example.com', 'gestor987x', '911098765', '1984-09-09', 'Masculino', 'Coordenador', 'Ativo'),
	('Lucas Mendes', '12345678902', 'lucas.mendes@example.com', 'gestor111', '910987654', '1989-10-10', 'Masculino', 'Coordenador', 'Ativo');

	-- Inserindo dados na tabela Disciplina
	INSERT IGNORE INTO Disciplina (Nome, Codigo, Ementa, CargaHoraria, PreRequisitos) 
	VALUES 
	('Matemática', 'MAT101', 'Introdução à Matemática', 60, NULL),
	('Português', 'POR101', 'Língua Portuguesa', 60, NULL),
	('História', 'HIS101', 'História do Brasil', 60, NULL),
	('Geografia', 'GEO101', 'Geografia Geral', 60, NULL),
	('Ciências', 'CIE101', 'Ciências Naturais', 60, NULL),
	('Educação Física', 'EF101', 'Atividades Físicas', 60, NULL),
	('Artes', 'ART101', 'Educação Artística', 60, NULL),
	('Inglês', 'ING101', 'Língua Inglesa', 60, NULL),
	('Física', 'FIS101', 'Física Básica', 60, NULL),
	('Química', 'QUI101', 'Química Geral', 60, NULL),
	('Biologia', 'BIO101', 'Biologia Geral', 60, NULL);

	ALTER TABLE Responsavel;
	INSERT IGNORE INTO Responsavel (Nome, Email, Senha, Telefone, Endereco, DataNascimento, Genero, Parentesco, Status, CPF)
	VALUES 
	('Joana da Silva', 'joana.silva@example.com', 'resp123', '99887766', 'Rua A, 123', '1975-03-10', 'Feminino', 'Mãe', 'Ativo', '123.456.789-00'),
	('Carlos Souza', 'carlos.souza@example.com', 'resp456', '98776655', 'Rua B, 456', '1970-05-22', 'Masculino', 'Pai', 'Ativo', '987.654.321-00'),
	('Mara Sartori', 'marasartori.souza@example.com', 'resp467', '998167733', 'Rua Limoeiro', '1980-02-04', 'Feminino', 'Mãe', 'Ativo', '111.222.333-44'),
	('Nilva Maria', 'nilvamaria.neves@example.com', 'resp468', '9977284672', 'Rua Macieira', '1980-02-18', 'Feminino', 'Mãe', 'Ativo', '555.666.777-88'),
	('Roberto Lima', 'roberto.lima@example.com', 'resp469', '9966775544', 'Rua das Flores', '1975-04-20', 'Masculino', 'Pai', 'Ativo', '444.333.222-11'),
	('Fernanda Alves', 'fernanda.alves@example.com', 'resp470', '9955664433', 'Rua dos Lírios', '1985-05-25', 'Feminino', 'Mãe', 'Ativo', '888.999.000-12'),
	('Cláudio Santos', 'claudio.santos@example.com', 'resp471', '9944553322', 'Rua das Acácias', '1980-06-30', 'Masculino', 'Pai', 'Ativo', '333.444.555-66'),
	('Patrícia Gomes', 'patricia.gomes@example.com', 'resp472', '9933442211', 'Rua das Palmeiras', '1982-07-15', 'Feminino', 'Mãe', 'Ativo', '222.333.444-77'),
	('Eduardo Ferreira', 'eduardo.ferreira@example.com', 'resp473', '9922331100', 'Rua das Rosas', '1978-08-10', 'Masculino', 'Pai', 'Ativo', '666.777.888-99'),
	('Sílvia Martins', 'silvia.martins@example.com', 'resp474', '9911220099', 'Rua dos Girassóis', '1985-09-05', 'Feminino', 'Mãe', 'Ativo', '999.888.777-66');


	-- Inserindo dados na tabela Turma
	INSERT INTO Turma (Nome, Serie, AnoLetivo, Turno, Sala, CapacidadeMaxima, Status) 
	VALUES 
	('Turma A', '1º Ano', 2023, 'Manhã', 'Sala 101', 30, 'Ativo'), 
	('Turma B', '1º Ano', 2023, 'Tarde', 'Sala 102', 30, 'Ativo'), 
	('Turma C', '2º Ano', 2023, 'Manhã', 'Sala 201', 30, 'Ativo'), 
	('Turma D', '2º Ano', 2023, 'Tarde', 'Sala 202', 30, 'Ativo'), 
	('Turma E', '3º Ano', 2023, 'Manhã', 'Sala 301', 30, 'Ativo'), 
	('Turma F', '3º Ano', 2023, 'Tarde', 'Sala 302', 30, 'Ativo'), 
	('Turma G', '4º Ano', 2023, 'Manhã', 'Sala 401', 30, 'Ativo'), 
	('Turma H', '4º Ano', 2023, 'Tarde', 'Sala 402', 30, 'Ativo'),  -- Corrigido aqui
	('Turma I', '5º Ano', 2023, 'Manhã', 'Sala 501', 30, 'Ativo'), 
	('Turma J', '5º Ano', 2023, 'Tarde', 'Sala 502', 30, 'Ativo'), 
	('Turma K', '6º Ano', 2023, 'Manhã', 'Sala 601', 30, 'Ativo');

	-- Inserindo dados na tabela Responsavel
	INSERT IGNORE INTO Responsavel (Nome, Email, Senha, Telefone, Endereco, DataNascimento, Genero, Parentesco, Status, CPF)
	VALUES 
	('Joana da Silva', 'joana.silva@example.com', 'resp123', '99887766', 'Rua A, 123', '1975-03-10', 'Feminino', 'Mãe', 'Ativo', '123.456.789-00'),
	('Carlos Souza', 'carlos.souza@example.com', 'resp456', '98776655', 'Rua B, 456', '1970-05-22', 'Masculino', 'Pai', 'Ativo', '987.654.321-00'),
	('Mara Sartori', 'marasartori.souza@example.com', 'resp467', '998167733', 'Rua Limoeiro', '1980-02-04', 'Feminino', 'Mãe', 'Ativo', '111.222.333-44'),
	('Nilva Maria', 'nilvamaria.neves@example.com', 'resp468', '9977284672', 'Rua Macieira', '1980-02-18', 'Feminino', 'Mãe', 'Ativo', '555.666.777-88'),
	('Roberto Lima', 'roberto.lima@example.com', 'resp469', '9966775544', 'Rua das Flores', '1975-04-20', 'Masculino', 'Pai', 'Ativo', '444.333.222-11'),
	('Fernanda Alves', 'fernanda.alves@example.com', 'resp470', '9955664433', 'Rua dos Lírios', '1985-05-25', 'Feminino', 'Mãe', 'Ativo', '888.999.000-12'),
	('Cláudio Santos', 'claudio.santos@example.com', 'resp471', '9944553322', 'Rua das Acácias', '1980-06-30', 'Masculino', 'Pai', 'Ativo', '333.444.555-66'),
	('Patrícia Gomes', 'patricia.gomes@example.com', 'resp472', '9933442211', 'Rua das Palmeiras', '1982-07-15', 'Feminino', 'Mãe', 'Ativo', '222.333.444-77'),
	('Eduardo Ferreira', 'eduardo.ferreira@example.com', 'resp473', '9922331100', 'Rua das Rosas', '1978-08-10', 'Masculino', 'Pai', 'Ativo', '666.777.888-99'),
	('Sílvia Martins', 'silvia.martins@example.com', 'resp474', '9911220099', 'Rua dos Girassóis', '1985-09-05', 'Feminino', 'Mãe', 'Ativo', '999.888.777-66');

	-- Inserindo dados na tabela Aluno
	INSERT INTO Aluno (CPF, Historico_Medico, Contato_de_Emergencia, Nome, Senha, Telefone, Endereco, DataNascimento, Genero, Status, RA) 
	VALUES 
	('44455566677', 'Nenhuma', '999001122', 'Lucas Silva', 'aluno123', '999001122', 'Rua Azul, 321', '2012-06-10', 'Masculino', 'Ativo', 'RA1001'),
	('55566677788', 'Nenhuma', '998112233', 'Marina Souza', 'aluno456', '998112233', 'Rua Verde, 654', '2011-07-12', 'Feminino', 'Ativo', 'RA1002'),
	('66677788899', 'Nenhuma', '998112255', 'Raquel Sartori', 'aluno26', '998112255', 'Rua Limoeiro', '2013-08-13', 'Feminino', 'Ativo', 'RA1003'),
	('77788899911', 'Nenhuma', '998234567', 'Camila Eduarda', 'aluno307', '998234567', 'Rua Macieira', '2014-08-13', 'Feminino', 'Ativo', 'RA1004'),
	('88899900022', 'Nenhuma', '998345678', 'Felipe Oliveira', 'aluno789', '998345678', 'Rua das Palmeiras', '2010-09-15', 'Masculino', 'Ativo', 'RA1005'),  -- Corrigido aqui
	('99900011133', 'Nenhuma', '998456789', 'Juliana Costa', 'aluno654', '998456789', 'Rua das Acácias', '2011-10-20', 'Feminino', 'Ativo', 'RA1006'),
	('00011122244', 'Nenhuma', '998567890', 'Ricardo Almeida', 'aluno321', '998567890', 'Rua das Orquídeas', '2012-11-25', 'Masculino', 'Ativo', 'RA1007'),
	('11122233355', 'Nenhuma', '998678901', 'Sofia Ribeiro', 'aluno987', '998678901', 'Rua das Rosas', '2013-12-30', 'Feminino', 'Ativo', 'RA1008'),
	('22233344466', 'Nenhuma', '998789012', 'André Martins', 'aluno456', '998789012', 'Rua dos Girassóis', '2014-01-05', 'Masculino', 'Ativo', 'RA1009'),
	('33344455577', 'Nenhuma', '998890123', 'Patrícia Mendes', 'aluno654', '998890123', 'Rua dos Ipês', '2015-02-10', 'Feminino', 'Ativo', 'RA1010'),
	('44455566688', 'Nenhuma', '998901234', 'Gustavo Ferreira', 'aluno1234', '998901234', 'Rua das Flores', '2016-03-15', 'Masculino', 'Ativo', 'RA1011');

	SELECT Id FROM Aluno;
	-- Inserindo dados na tabela Aluno_Responsavel
	UPDATE Aluno SET Id_Responsavel = 1 WHERE Id = 1; -- Supondo que o Id de Lucas Silva seja 1
	UPDATE Aluno SET Id_Responsavel = 2 WHERE Id = 2;
	UPDATE Aluno SET Id_Responsavel = 3 WHERE Id = 3;
	UPDATE Aluno SET Id_Responsavel = 4 WHERE Id = 4;
	UPDATE Aluno SET Id_Responsavel = 5 WHERE Id = 5;
	UPDATE Aluno SET Id_Responsavel = 6 WHERE Id = 6;
	UPDATE Aluno SET Id_Responsavel = 7 WHERE Id = 7;
	UPDATE Aluno SET Id_Responsavel = 8 WHERE Id = 8;
	UPDATE Aluno SET Id_Responsavel = 9 WHERE Id = 9;
	UPDATE Aluno SET Id_Responsavel = 10 WHERE Id = 10;
	UPDATE Aluno SET Id_Responsavel = 1 WHERE Id = 11; -- Substitua 1 pelo ID válido

	-- Inserindo dados na tabela Aluno_Turma
	INSERT INTO Aluno_Turma (Id_Aluno, Id_Turma, DataEntrada, DataSaida, Status)
	SELECT a.Id, t.Id, CURDATE(), NULL, 'Ativo'
	FROM Aluno a
	JOIN Turma t ON t.Id IN (1, 2, 3, 4, 5)  -- IDs de turma que você deseja usar
	WHERE a.Id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);  -- IDs de alunos que você deseja usar

	-- Inserindo dados na tabela Atividade
	INSERT INTO Atividade (Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma)
	SELECT 'Prova de Matemática', 'Prova sobre adição e subtração', CURDATE(), '2023-12-01', p.Id, t.Id
	FROM Professor p, Turma t
	WHERE p.Id = 1 AND t.Id = 1
	UNION ALL
	SELECT 'Trabalho de História', 'Trabalho sobre Brasil Colonial', CURDATE(), '2023-12-05', p.Id, t.Id
	FROM Professor p, Turma t
	WHERE p.Id = 1 AND t.Id = 1
	UNION ALL
	SELECT 'Redação em Português', 'Redação sobre cidadania', CURDATE(), '2023-12-10', p.Id, t.Id
	FROM Professor p, Turma t
	WHERE p.Id = 1 AND t.Id = 1
	UNION ALL
	SELECT 'Experimento de Ciências', 'Relatório sobre plantas', CURDATE(), '2023-12-15', p.Id, t.Id
	FROM Professor p, Turma t
	WHERE p.Id = 1 AND t.Id = 1
	UNION ALL
	SELECT 'Projeto de Artes', 'Pintura em tela', CURDATE(), '2023-12-20', p.Id, t.Id
	FROM Professor p, Turma t
	WHERE p.Id = 1 AND t.Id = 1
	UNION ALL
	SELECT 'Exercícios de Física', 'Cinemática básica', CURDATE(), '2023-12-25', p.Id, t.Id
	FROM Professor p, Turma t
	WHERE p.Id = 1 AND t.Id = 1
	UNION ALL
	SELECT 'Trabalho em Grupo de Geografia', 'Climas do mundo', CURDATE(), '2023-12-30', p.Id, t.Id
	FROM Professor p, Turma t
	WHERE p.Id = 1 AND t.Id = 1
	UNION ALL
	SELECT 'Prova de Inglês', 'Verbos no passado', CURDATE(), '2023-12-31', p.Id, t.Id
	FROM Professor p, Turma t
	WHERE p.Id = 1 AND t.Id = 1
	UNION ALL
	SELECT 'Seminário de Filosofia', 'Ética na sociedade', CURDATE(), '2023-12-31', p.Id, t.Id
	FROM Professor p, Turma t
	WHERE p.Id = 1 AND t.Id = 1
	UNION ALL
	SELECT 'Exercícios de Química', 'Tabela periódica', CURDATE(), '2023-12-31', p.Id, t.Id
	FROM Professor p, Turma t
	WHERE p.Id = 1 AND t.Id = 1;

	-- Inserindo dados na tabela EntregaAtividade
	INSERT INTO EntregaAtividade (Id_Atividade, Id_Aluno, DataEntrega, Resposta)
	SELECT a.Id, al.Id, CURDATE(), CONCAT('Resposta do aluno ', al.Nome)
	FROM Atividade a
	JOIN Aluno al ON al.Id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)  -- IDs de alunos que você deseja usar
	WHERE a.Id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);  -- IDs de atividades que você deseja usar

	INSERT INTO bimestre (Nome, DataInicio, DataFim) VALUES
	('1º Bimestre', '2025-01-01', '2025-03-31'),
	('2º Bimestre', '2025-04-01', '2025-06-30'),
	('3º Bimestre', '2025-07-01', '2025-09-30'),
	('4º Bimestre', '2025-10-01', '2025-12-31');

	-- Inserindo dados na tabela Nota
	INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Valor)
	VALUES
	  (1, 2, 1, 8.5),
	  (1, 2, 1, 9.0),
	  (2, 2, 1, 7.5),
	  (3, 2, 1, 8.0),
	  (4, 2, 1, 9.5),
	  (5, 3, 2, 8.0),
	  (6, 3, 2, 7.0),
	  (7, 3, 2, 9.0),
	  (8, 3, 2, 8.5),
	  (9, 3, 2, 9.0);

	-- Inserindo dados na tabela FeedbackPedagogico
	INSERT INTO FeedbackPedagogico (Id_Aluno, Id_Professor, DataLancamento, Conteudo)
	SELECT a.Id, p.Id, CURDATE(), f.Conteudo
	FROM Aluno a
	JOIN Professor p ON p.Id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)  -- IDs de professores que você deseja usar
	JOIN (SELECT 'Bom desempenho na prova.' AS Conteudo UNION ALL
		  SELECT 'Excelente trabalho em grupo.' UNION ALL
		  SELECT 'Precisa melhorar a participação em sala.' UNION ALL
		  SELECT 'Muito bem na apresentação do projeto.' UNION ALL
		  SELECT 'Precisa estudar mais para a próxima prova.' UNION ALL
		  SELECT 'Bom trabalho na resolução de problemas.' UNION ALL
		  SELECT 'Precisa melhorar a organização do material.' UNION ALL
		  SELECT 'Muito bem na apresentação do trabalho.' UNION ALL
		  SELECT 'Precisa estudar mais para a próxima prova.' UNION ALL
		  SELECT 'Bom trabalho na resolução de problemas.') f
	WHERE a.Id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);  -- IDs de alunos que você deseja usar

	-- Verifique se as notas existem
SELECT * FROM Nota WHERE Id IN (1, 2, 3, 4, 5, 6, 7, 8);

-- Verifique se as faltas existem
SELECT * FROM Falta WHERE Id IN (1, 2, 3, 4, 5, 6, 7, 8);

-- Verifique se os bimestres existem
SELECT * FROM Bimestre WHERE Id IN (1, 2, 3, 4);

-- Inserindo dados na tabela Bimestre_Nota
INSERT INTO Bimestre_Nota (Id_Nota, Id_Bimestre)
SELECT n.Id, b.Id 
FROM Nota n
JOIN Bimestre b ON b.Id IN (1, 2, 3, 4)
WHERE n.Id IN (1, 2) AND b.Id = 1
ON DUPLICATE KEY UPDATE Id_Bimestre = b.Id;  -- Atualiza se já existir

-- Inserindo dados na tabela Bimestre_Falta
INSERT INTO Bimestre_Falta (Id_Falta, Id_Bimestre)
SELECT f.Id, b.Id 
FROM Falta f
JOIN Bimestre b ON b.Id IN (1, 2, 3, 4)
WHERE f.Id IN (1, 2) AND b.Id = 1
ON DUPLICATE KEY UPDATE Id_Bimestre = b.Id;  -- Atualiza se já existir
    
	DESCRIBE EventoEscolar;
	ALTER TABLE EventoEscolar MODIFY PublicoAlvo VARCHAR(50);
	-- Inserindo dados na tabela EventoEscolar
	INSERT INTO EventoEscolar (Titulo, Descricao, DataInicio, DataFim, Local, PublicoAlvo) 
	VALUES 
	('Festa de Fim de Ano', 'Celebração de fim de ano escolar', '2023-12-15 18:00:00', '2023-12-15 22:00:00', 'Quadra da Escola', 'Todos'),
	('Dia do Professor', 'Comemoração do dia do professor', '2023-10-15 09:00:00', '2023-10-15 12:00:00', 'Sala de Aula', 'Professores'),
	('Dia do Aluno', 'Comemoração do dia do aluno', '2023-11-15 09:00:00', '2023-11-15 12:00:00', 'Sala de Aula', 'Alunos'),
	('Reunião de Pais e Mestres', 'Reunião para discutir o desempenho dos alunos', '2023-09-15 19:00:00', '2023-09-15 21:00:00', 'Sala de Reunião', 'Pais e Mestres'),
	('Festa de Natal', 'Celebração de Natal', '2023-12-20 18:00:00', '2023-12-20 22:00:00', 'Quadra da Escola', 'Todos'),
	('Dia da Independência', 'Comemoração da independência do Brasil', '2023-09-07 09:00:00', '2023-09-07 12:00:00', 'Sala de Aula', 'Todos'),
	('Festa de Aniversário da Escola', 'Celebração do aniversário da escola', '2023-08-15 18:00:00', '2023-08-15 22:00:00', 'Quadra da Escola', 'Todos'),
	('Dia do Trabalho', 'Comemoração do dia do trabalho', '2023-05-01 09:00:00', '2023-05-01 12:00:00', 'Sala de Aula', 'Todos'),
	('Festa de Fim de Semestre', 'Celebração de fim de semestre', '2023-06-15 18:00:00', '2023-06-15 22:00:00', 'Quadra da Escola', 'Todos'),
	('Dia da Mulher', 'Comemoração do dia da mulher', '2023-03-08 09:00:00', '2023-03-08 12:00:00', 'Sala de Aula', 'Mulheres'),
	('Festa de Carnaval', 'Celebração de Carnaval', '2023-02-20 18:00:00', '2023-02-20 22:00:00', 'Quadra da Escola', 'Todos');

	SELECT Id FROM Usuaria;
	-- Inserindo dados na tabela LogAcesso
	INSERT INTO LogAcesso (Id_Usuario, Acao, IP, Dispositivo)
	SELECT u.Id, a.Acao, a.IP, a.Dispositivo
	FROM Usuaria u
	JOIN (SELECT 'Login' AS Acao, '192.168.1.1' AS IP, 'Desktop' AS Dispositivo UNION ALL
		  SELECT 'Logout', '192.168.1.2', 'Laptop' UNION ALL
		  SELECT 'Acesso a página de perfil', '192.168.1.3', 'Tablet' UNION ALL
		  SELECT 'Acesso a página de notas', '192.168.1.4', 'Smartphone' UNION ALL
		  SELECT 'Acesso a página de faltas', '192.168.1.5', 'Desktop' UNION ALL
		  SELECT 'Acesso a página de feedback', '192.168.1.6', 'Laptop' UNION ALL
		  SELECT 'Acesso a página de eventos', '192.168.1.7', 'Tablet' UNION ALL
		  SELECT 'Acesso a página de configurações', '192.168.1.8', 'Smartphone' UNION ALL
		  SELECT 'Acesso a página de ajuda', '192.168.1.9', 'Desktop' UNION ALL
		  SELECT 'Acesso a página de contato', '192.168.1.10', 'Laptop') a
	WHERE u.Id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);  -- IDs de usuários que você deseja usar

	-- Inserindo dados na tabela Notificacao
	INSERT INTO Notificacao (Id_Usuario, Titulo, Mensagem, Visualizado)
	SELECT u.Id, n.Titulo, n.Mensagem, n.Visualizado
	FROM Usuaria u
	JOIN (SELECT 1 AS Id_Usuario, 'Nova nota' AS Titulo, 'Você recebeu uma nova nota em Matemática.' AS Mensagem, FALSE AS Visualizado UNION ALL
		  SELECT 2, 'Nova falta', 'Você recebeu uma nova falta em Português.', FALSE UNION ALL
		  SELECT 3, 'Nova mensagem', 'Você recebeu uma nova mensagem de um professor.', FALSE UNION ALL
		  SELECT 4, 'Nova nota', 'Você recebeu uma nova nova nota em Ciências.', FALSE UNION ALL
		  SELECT 5, 'Nova falta', 'Você recebeu uma nova falta em História.', FALSE UNION ALL
		  SELECT 6, 'Nova mensagem', 'Você recebeu uma nova mensagem de um professor.', FALSE UNION ALL
		  SELECT 7, 'Nova nota', 'Você recebeu uma nova nota em Geografia.', FALSE UNION ALL
		  SELECT 8, 'Nova falta', 'Você recebeu uma nova falta em Inglês.', FALSE UNION ALL
		  SELECT 9, 'Nova mensagem', 'Você recebeu uma nova mensagem de um professor.', FALSE UNION ALL
		  SELECT 10, 'Nova nota', 'Você recebeu uma nova nota em Física.', FALSE) n
	ON u.Id = n.Id_Usuario
	WHERE u.Id IN (SELECT Id FROM Usuaria);  -- Garante que apenas usuários existentes sejam inseridos

	-- Inserindo dados na tabela Cadastro_de_Usuario_nova
	INSERT INTO Cadastro_de_Usuario_nova (CPF, Nome, Ano, Tipo, CriadoPorGestor, NivelAcesso) 
	VALUES  
	('44455566677', 'Lucas Silva', 2023, 'Aluno', TRUE, 'Leitura'), 
	('55566677788', 'Marina Souza', 2023, 'Aluno', TRUE, 'Leitura'), 
	('66677788899', 'Raquel Sartori', 2023, 'Aluno', TRUE, 'Leitura'), 
	('77788899911', 'Camila Eduarda', 2023, 'Aluno', TRUE, 'Leitura'), 
	('88899900022', 'Felipe Oliveira', 2023, 'Aluno', TRUE, 'Leitura'), 
	('99900011133', 'Juliana Costa', 2023, 'Aluno', TRUE, 'Leitura'), 
	('00011122244', 'Ricardo Almeida', 2023, 'Aluno', TRUE, 'Leitura'), 
	('11122233355', 'Sofia Ribeiro', 2023, 'Aluno', TRUE, 'Leitura'), 
	('22233344466', 'André Martins', 2023, 'Aluno', TRUE, 'Leitura'), 
	('33344455577', 'Patrícia Mendes', 2023, 'Aluno', TRUE, 'Leitura');

	-- Inserindo dados na tabela Usuaria
	INSERT INTO Usuaria (Nome, Email, Senha, Telefone, Endereco, DataNascimento, Genero, FotoPerfil, Id_Aluno, Id_Responsavel, Id_Professor, Id_Gestor, RA, CPF)
	SELECT n.Nome, n.Email, n.Senha, n.Telefone, n.Endereco, n.DataNascimento, n.Genero, n.FotoPerfil, n.Id_Aluno, n.Id_Responsavel, n.Id_Professor, n.Id_Gestor, n.RA, n.CPF
	FROM (SELECT 'Lucas Silva' AS Nome, 'lucas.silva@example.com' AS Email, 'aluno123' AS Senha, '999001122' AS Telefone, 'Rua Azul, 321' AS Endereco, '2012-06-10' AS DataNascimento, 'Masculino' AS Genero, NULL AS FotoPerfil, 1 AS Id_Aluno, 1 AS Id_Responsavel, NULL AS Id_Professor, NULL AS Id_Gestor, 'RA1001' AS RA, '44455566677' AS CPF UNION ALL
		  SELECT 'Marina Souza', 'marina.souza@example.com', 'aluno456', '998112233', 'Rua Verde, 654', '2011-07-12', 'Feminino', NULL, 2, 1, NULL, NULL, 'RA1002', '55566677788' UNION ALL
		  SELECT 'Raquel Sartori', 'raquel.sartori@example.com', 'aluno26', '998112255', 'Rua Limoeiro', '2013-08-13', 'Feminino', NULL, 3, 2, NULL, NULL, 'RA1003', '66677788899' UNION ALL
		  SELECT 'Camila Eduarda', 'camila.eduarda@example.com', 'aluno307', '998234567', 'Rua Macieira', '2014-08-13', 'Feminino', NULL, 4, 2, NULL, NULL, 'RA1004', '77788899911' UNION ALL
		  SELECT 'Felipe Oliveira', 'felipe.oliveira@example.com', 'aluno789', '998345678', 'Rua das Palmeiras', '2010-09-15', 'Masculino', NULL, 5, 3, NULL, NULL, 'RA1005', '88899900022' UNION ALL
		  SELECT 'Juliana Costa', 'juliana.costa@example.com', 'aluno654', '998456789', 'Rua das Acácias', '2011-10-20', 'Feminino', NULL, 6, 3, NULL, NULL, 'RA1006', '99900011133' UNION ALL
		  SELECT 'Ricardo Almeida', 'ricardo.almeida@example.com', 'aluno321', '998567890', 'Rua das Orquídeas', '2012-11-25', 'Masculino', NULL, 7, 4, NULL, NULL, 'RA1007', '00011122244' UNION ALL
		  SELECT 'Sofia Ribeiro', 'sofia.ribeiro@example.com', 'aluno987', '998678901', 'Rua das Rosas', '2013-12-30', 'Feminino', NULL, 8, 4, NULL, NULL, 'RA1008', '11122233355' UNION ALL
		  SELECT 'André Martins', 'andre.martins@example.com', 'aluno456', '998789012', 'Rua dos Girassóis', '2014-01-05', 'Masculino', NULL, 9, 5, NULL, NULL, 'RA1009', '22233344466' UNION ALL
		  SELECT 'Patrícia Mendes', 'patricia.mendes@example.com', 'aluno654', '998890123', 'Rua dos Ipês', '2015-02-10', 'Feminino', NULL, 10, 5, NULL, NULL, 'RA1010', '33344455577') n
	WHERE n.Id_Aluno IN (SELECT Id FROM Aluno);  -- Garante que apenas alunos existentes sejam inseridos

	-- Inserindo dados na tabela Boletim
	INSERT INTO Boletim (Id_Aluno, Id_Disciplina, Id_Bimestre, MediaFinal, Situacao, Observacoes)
	SELECT a.Id, d.Id, b.Id, m.MediaFinal, m.Situacao, m.Observacoes
	FROM (SELECT 1 AS Id_Aluno, 1 AS Id_Disciplina, 1 AS Id_Bimestre, 8.5 AS MediaFinal, 'Aprovado' AS Situacao, 'Bom desempenho' AS Observacoes UNION ALL
		  SELECT 2, 1, 1, 9.0, 'Aprovado', 'Excelente desempenho' UNION ALL
		  SELECT 3, 2, 1, 7.5, 'Aprovado', 'Pode melhorar' UNION ALL
		  SELECT 4, 2, 1, 8.0, 'Aprovado', 'Bom desempenho' UNION ALL
		  SELECT 5, 3, 2, 9.5, 'Aprovado', 'Excelente desempenho' UNION ALL
		  SELECT 6, 3, 2, 8.0, 'Aprovado', 'Bom desempenho' UNION ALL
		  SELECT 7, 4, 2, 7.0, 'Aprovado', 'Pode melhorar' UNION ALL
		  SELECT 8, 4, 3, 9.0, 'Aprovado', 'Excelente desempenho' UNION ALL
		  SELECT 9, 1, 3, 8.5, 'Aprovado', 'Bom desempenho' UNION ALL
		  SELECT 10, 2, 4, 9.0, 'Aprovado', 'Excelente desempenho') m
	JOIN Aluno a ON a.Id = m.Id_Aluno
	JOIN Disciplina d ON d.Id = m.Id_Disciplina
	JOIN Bimestre b ON b.Id = m.Id_Bimestre;  -- Certifique-se de que a tabela Bimestre existe e contém os IDs corretos

	SELECT Id FROM professor;

	SELECT Id FROM professor WHERE Id IN (1,2,3,4,5,6,7,8,9,10);

	SELECT Id FROM turma WHERE Id IN (1,2,3,4,5,6,7,8,9,10);

	-- Inserindo dados na tabela Professor_Turma
	INSERT INTO Professor_Turma (Id_Professor, Id_Turma, Status)
	SELECT p.Id, t.Id, 'Ativo'
	FROM professor p
	JOIN turma t ON t.Id = p.Id
	WHERE p.Id IN (1, 2, 3) AND t.Id IN (10, 11, 12);

	-- Commit para confirmar todas as alterações
	COMMIT;

	DROP USER IF EXISTS 'admin'@'localhost';
	CREATE USER 'admin'@'localhost' IDENTIFIED BY 'senha@123';

	GRANT ALL PRIVILEGES ON ControlHub.* TO 'admin'@'localhost';
	FLUSH PRIVILEGES;

	DESCRIBE Aluno;
	DESCRIBE Professor;
	DESCRIBE Gestor;
	DESCRIBE Responsavel;

	SELECT * FROM Aluno;
	SELECT * FROM Professor;
	SELECT * FROM Gestor;
	SELECT * FROM Responsavel;

	-- Para Aluno
	SELECT * FROM Aluno WHERE RA = 'RA1001';
	-- Para Professor
	SELECT * FROM Professor WHERE Email = 'email@exemplo.com' OR CPF = '12345678900';
	-- Para Gestor
	SELECT * FROM Gestor WHERE Email = 'email@exemplo.com';
	-- Para Responsável
	SELECT * FROM Responsavel WHERE Email = 'teste@exemplo.com';

	SELECT * FROM Professor_Turma WHERE Id_Professor = 1; -- Substitua 1 pelo ID do professor que você está testando

	SELECT * FROM Turma;


	select * from Disciplina;
	select * from Falta;

	INSERT INTO Falta (Id_Aluno, Id_Turma, Id_Disciplina, DataFalta, Justificada)
	VALUES (1, 1, 1, '2023-11-17', FALSE);

	CREATE TABLE Turma_Disciplina (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Id_Turma INT NOT NULL,
		Id_Disciplina INT NOT NULL,
		FOREIGN KEY (Id_Turma) REFERENCES Turma(Id) ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Disciplina) REFERENCES Disciplina(Id) ON DELETE CASCADE ON UPDATE CASCADE,
		UNIQUE (Id_Turma, Id_Disciplina)
	);

	CREATE TABLE Turma_Professor (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Id_Turma INT NOT NULL,
		Id_Professor INT NOT NULL,
		Id_Disciplina INT NOT NULL,  -- Adicionando relação com disciplina
		Status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo',
		DataInicio DATE NOT NULL,
		DataFim DATE,
		FOREIGN KEY (Id_Turma) REFERENCES Turma(Id) ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Professor) REFERENCES Professor(Id) ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Disciplina) REFERENCES Disciplina(Id) ON DELETE CASCADE ON UPDATE CASCADE,
		UNIQUE (Id_Turma, Id_Professor, Id_Disciplina)  -- Garante que um professor não seja atribuído à mesma disciplina na mesma turma múltiplas vezes
	);

	-- Inserindo dados na tabela Professor
	INSERT INTO Professor (Nome, CPF, Email, Senha, Telefone, Endereco, DataNascimento, Genero, FormacaoAcademica, DataContratacao, Status)
	VALUES 
	('Alice Ramos', '12345678900', 'alice.ramos@example.com', 'prof123a', '123456789', 'Rua das Flores, 123', '1980-04-15', 'Feminino', 'Licenciatura em Educação', '2010-01-01', 'Ativo'),
	('Bruno Vieira', '98765432100', 'bruno.vieira@example.com', 'prof456b', '987654321', 'Rua dos Lírios, 456', '1978-06-20', 'Masculino', 'Licenciatura em Matemática', '2011-01-01', 'Ativo'),
	('Elisa Moura', '91765432100', 'elisa.moura@example.com', 'prof321c', '917654321', 'Rua Antiga, 200', '1987-05-18', 'Feminino', 'Licenciatura em História', '2012-01-01', 'Ativo'),
	('Fernando Costa', '91234567890', 'fernando.costa@example.com', 'prof654d', '912345678', 'Rua Nova, 789', '1985-11-30', 'Masculino', 'Licenciatura em Geografia', '2013-01-01', 'Ativo'),
	('Gabriela Lima', '91122334455', 'gabriela.lima@example.com', 'prof987e', '911223344', 'Rua Velha, 456', '1990-01-15', 'Feminino', 'Licenciatura em Ciências', '2014-01-01', 'Ativo'),
	('Hugo Almeida', '91098765432', 'hugo.almeida@example.com', 'prof321f', '910987654', 'Rua do Sol, 123', '1982-02-20', 'Masculino', 'Licenciatura em Educação Física', '2015-01-01', 'Ativo'),
	('Isabela Santos', '90987654321', 'isabela.santos@example.com', 'prof654g', '909876543', 'Rua da Lua, 456', '1988-03-25', 'Feminino', 'Licenciatura em Artes', '2016-01-01', 'Ativo'),
	('Júlio César', '90876543210', 'julio.cesar@example.com', 'prof987h', '908765432', 'Rua das Estrelas, 789', '1983-04-30', 'Masculino', 'Licenciatura em Filosofia', '2017-01-01', 'Ativo'),
	('Karla Dias', '90765432109', 'karla.dias@example.com', 'prof654i', '907654321', 'Rua do Vento, 123', '1992-05-05', 'Feminino', 'Licenciatura em Educação Artística', '2018-01-01', 'Ativo'),
	('Leonardo Martins', '90654321098', 'leonardo.martins@example.com', 'prof321j', '906543210', 'Rua do Mar, 456', '1981-06-10', 'Masculino', 'Licenciatura em Física', '2019-01-01', 'Ativo');

UPDATE Aluno_Turma
SET Status = 'Ativo', DataEntrada = '2023-01-01'
WHERE (Id_Aluno, Id_Turma) IN ((1,1),(2,1),(3,1),(4,1),(5,1),(6,2),(7,2),(8,2),(9,2),(10,2),(11,3));

USE ControlHub;

INSERT INTO Turma_Disciplina (Id_Turma, Id_Disciplina) VALUES
    (1, 1),  -- Turma 1 - Matemática
    (1, 2),  -- Turma 1 - Português
    (1, 3),  -- Turma 1 - História
    (2, 1),  -- Turma 2 - Matemática
    (2, 4),  -- Turma 2 - Geografia
    (2, 5),  -- Turma 2 - Ciências
    (3, 2),  -- Turma 3 - Português
    (3, 6),  -- Turma 3 - Educação Física
    (4, 3),  -- Turma 4 - História
    (5, 7),  -- Turma 5 - Artes
    (6, 8);  -- Turma 6 - Inglês

	-- Verifica se o aluno está na turma
	SELECT COUNT(*) FROM Aluno_Turma 
	WHERE Id_Aluno = 1 AND Id_Turma = 1 AND Status = 'Ativo';

	-- Só insere a falta se o aluno estiver matriculado
	INSERT INTO Falta (Id_Aluno, Id_Turma, Id_Disciplina, DataFalta, Justificada)
	SELECT 1, 1, 1, '2023-11-20', FALSE
	FROM DUAL
	WHERE EXISTS (
		SELECT 1 FROM Aluno_Turma 
		WHERE Id_Aluno = 1 AND Id_Turma = 1 AND Status = 'Ativo'
	);

	SELECT t.Nome AS Turma, p.Nome AS Professor, d.Nome AS Disciplina
	FROM Turma_Professor tp
	JOIN Turma t ON tp.Id_Turma = t.Id
	JOIN Professor p ON tp.Id_Professor = p.Id
	JOIN Disciplina d ON tp.Id_Disciplina = d.Id
	ORDER BY t.Nome, d.Nome;

	SELECT * from Turma;
	select * from Aluno_Turma;

	CREATE TABLE Professor_Turma_Disciplina (
		Id INT AUTO_INCREMENT PRIMARY KEY,
		Id_Professor INT NOT NULL,
		Id_Turma INT NOT NULL,
		Id_Disciplina INT NOT NULL,
		Status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo',
		UNIQUE KEY (Id_Professor, Id_Turma, Id_Disciplina),
		FOREIGN KEY (Id_Professor) REFERENCES Professor(Id),
		FOREIGN KEY (Id_Turma) REFERENCES Turma(Id),
		FOREIGN KEY (Id_Disciplina) REFERENCES Disciplina(Id)
	);

	ALTER TABLE Turma
	ADD COLUMN Id_Responsavel INT,
	ADD COLUMN Id_Atividade INT,
	ADD COLUMN Id_Prova INT,
	ADD COLUMN Id_Evento INT,
	ADD COLUMN Nota_Responsavel DECIMAL(5,2);

	ALTER TABLE Atividade
	ADD COLUMN EnvioAtividade DATETIME,
	ADD COLUMN RecebimentoAtividade DATETIME;

	CREATE TABLE Prova (
		Id INT PRIMARY KEY AUTO_INCREMENT,
		Titulo VARCHAR(100) NOT NULL,
		Descricao TEXT,
		DataCriacao DATE NOT NULL,
		DataEntrega DATE,
		Id_Professor INT NOT NULL,
		Id_Turma INT NOT NULL,
		FOREIGN KEY (Id_Professor) REFERENCES Professor(Id) ON DELETE CASCADE ON UPDATE CASCADE,
		FOREIGN KEY (Id_Turma) REFERENCES Turma(Id) ON DELETE CASCADE ON UPDATE CASCADE,
		EnvioProva DATETIME,
		RecebimentoProva DATETIME
	);

	ALTER TABLE EventoEscolar
	ADD COLUMN Id_Responsavel INT,
	ADD FOREIGN KEY (Id_Responsavel) REFERENCES Responsavel(Id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE Atividade_Prova (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Id_Professor_Turma_Disciplina INT NOT NULL,
    Tipo ENUM('Atividade', 'Prova') NOT NULL,
    Titulo VARCHAR(255) NOT NULL,
    DataRealizacao DATE NOT NULL,
    Status ENUM('Pendente', 'Concluída') DEFAULT 'Pendente',
    FOREIGN KEY (Id_Professor_Turma_Disciplina) 
        REFERENCES Professor_Turma_Disciplina(Id)
        ON DELETE CASCADE
);

SELECT t.Nome AS Turma, d.Nome AS Disciplina, p.Nome AS Professor, ap.Titulo, ap.DataRealizacao
FROM Professor_Turma_Disciplina ptd
JOIN Turma t ON ptd.Id_Turma = t.Id
JOIN Disciplina d ON ptd.Id_Disciplina = d.Id
JOIN Professor p ON ptd.Id_Professor = p.Id
LEFT JOIN Atividade_Prova ap ON ap.Id_Professor_Turma_Disciplina = ptd.Id;


SELECT 
    t.Id AS TurmaId,
    t.Nome AS TurmaNome,
    d.Id AS DisciplinaId,
    d.Nome AS DisciplinaNome,
    p.Id AS ProfessorId,
    p.Nome AS ProfessorNome,
    ap.Id AS AtividadeProvaId,
    ap.Tipo,
    ap.Titulo,
    ap.DataRealizacao,
    ap.Status
FROM
    Professor_Turma_Disciplina ptd
        JOIN
    Turma t ON ptd.Id_Turma = t.Id
        JOIN
    Disciplina d ON ptd.Id_Disciplina = d.Id
        JOIN
    Professor p ON ptd.Id_Professor = p.Id
        LEFT JOIN
    Atividade_Prova ap ON ap.Id_Professor_Turma_Disciplina = ptd.Id
ORDER BY t.Nome , d.Nome , p.Nome , ap.DataRealizacao;

DESCRIBE Prova;
SHOW COLUMNS FROM Prova;

SELECT 
    t.Nome AS Turma,
    t.Serie AS Série,
    a.Nome AS Aluno,
    a.RA,
    d.Nome AS Disciplina,
    d.Codigo AS Codigo_Disciplina,
    GROUP_CONCAT(DISTINCT p.Nome SEPARATOR ', ') AS Professor_Responsavel
FROM 
    Aluno a
JOIN 
    Aluno_Turma at ON a.Id = at.Id_Aluno
JOIN 
    Turma t ON at.Id_Turma = t.Id
JOIN 
    Turma_Disciplina td ON t.Id = td.Id_Turma
JOIN 
    Disciplina d ON td.Id_Disciplina = d.Id
LEFT JOIN 
    Turma_Professor tp ON td.Id_Disciplina = tp.Id_Disciplina AND t.Id = tp.Id_Turma
LEFT JOIN 
    Professor p ON tp.Id_Professor = p.Id
WHERE 
    at.Status = 'Ativo' -- Filtra apenas alunos ativos na turma
GROUP BY 
    t.Id, a.Id, d.Id
ORDER BY 
    t.Nome, a.Nome;
    
    DESCRIBE Prova;
    
    SELECT 
    a.Id AS AlunoId,
    a.Nome AS Aluno,
    t.Id AS TurmaId,
    t.Nome AS Turma,
    d.Id AS DisciplinaId,
    d.Nome AS Disciplina,
    p.Id AS ProfessorId,
    p.Nome AS Professor,
    ap.Id AS AtividadeProvaId,
    ap.Tipo,
    ap.Titulo,
    ap.DataRealizacao AS Data,
    ap.Status
FROM Aluno a
JOIN Aluno_Turma at ON a.Id = at.Id_Aluno AND at.Status = 'Ativo'
JOIN Turma t ON at.Id_Turma = t.Id
JOIN Turma_Disciplina td ON t.Id = td.Id_Turma
JOIN Disciplina d ON td.Id_Disciplina = d.Id
JOIN Professor_Turma_Disciplina ptd 
    ON ptd.Id_Turma = t.Id 
   AND ptd.Id_Disciplina = d.Id
JOIN Professor p ON p.Id = ptd.Id_Professor
LEFT JOIN Atividade_Prova ap 
    ON ap.Id_Professor_Turma_Disciplina = ptd.Id
ORDER BY a.Nome, ap.DataRealizacao;


CREATE TABLE Prova (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Titulo VARCHAR(100) NOT NULL,
    Descricao TEXT,
    DataCriacao DATE NOT NULL,
    DataEntrega DATE,
    Id_Professor INT NOT NULL,
    Id_Turma INT NOT NULL,
    Id_Disciplina INT NOT NULL, -- ADICIONADO
    FOREIGN KEY (Id_Professor) REFERENCES Professor(Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Id_Turma) REFERENCES Turma(Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Id_Disciplina) REFERENCES Disciplina(Id) ON DELETE CASCADE ON UPDATE CASCADE, -- ADICIONADO
    EnvioProva DATETIME,
    RecebimentoProva DATETIME
);

ALTER TABLE Prova
ADD COLUMN Id_Disciplina INT NOT NULL,
ADD CONSTRAINT FK_Prova_Disciplina FOREIGN KEY (Id_Disciplina)
    REFERENCES Disciplina(Id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;

SELECT pr.Id, pr.Titulo, pr.Descricao, pr.DataEntrega, p.Nome AS Professor, d.Nome AS Disciplina
FROM Prova pr
INNER JOIN Professor p ON pr.Id_Professor = p.Id
INNER JOIN Disciplina d ON pr.Id_Disciplina = d.Id
WHERE pr.Id_Turma = 1
ORDER BY pr.DataEntrega;

CREATE TABLE Avaliacao (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Id_Professor_Turma_Disciplina INT NOT NULL,
    Tipo ENUM('Atividade','Prova') NOT NULL,
    Titulo VARCHAR(100) NOT NULL,
    Descricao TEXT,
    DataCriacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    DataEntrega DATE,
    Valor DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (Id_Professor_Turma_Disciplina) REFERENCES Professor_Turma_Disciplina(Id)
);

CREATE TABLE NotaItem (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Id_Aluno INT NOT NULL,
  Id_Turma INT NOT NULL,
  Tipo ENUM('Atividade', 'Prova') NOT NULL,
  Id_Item INT NOT NULL, -- referencia Atividade.Id ou Prova.Id
  Valor DECIMAL(5,2) NOT NULL,
  CONSTRAINT FK_Aluno FOREIGN KEY (Id_Aluno) REFERENCES Aluno(Id),
  CONSTRAINT FK_Turma FOREIGN KEY (Id_Turma) REFERENCES Turma(Id)
);

CREATE TABLE Submissao (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Id_Aluno INT NOT NULL,
    Tipo ENUM('Atividade','Prova') NOT NULL,
    Id_Item INT NOT NULL, -- referência Prova.Id ou Atividade.Id
    Resposta TEXT,
    DataEnvio DATETIME DEFAULT CURRENT_TIMESTAMP,
    Nota DECIMAL(5,2),
    Status ENUM('Pendente','Corrigida') DEFAULT 'Pendente',
    FOREIGN KEY (Id_Aluno) REFERENCES Aluno(Id)
);

-- Exemplo de inserção de nota na NotaItem após correção
INSERT INTO NotaItem (Id_Aluno, Id_Turma, Tipo, Id_Item, Valor)
SELECT s.Id_Aluno, p.Id_Turma, s.Tipo, s.Id_Item, s.Nota
FROM Submissao s
JOIN Prova p ON (s.Tipo = 'Prova' AND s.Id_Item = p.Id)
-- ou JOIN Atividade a ON (s.Tipo = 'Atividade' AND s.Id_Item = a.Id)
WHERE s.Nota IS NOT NULL;

SELECT *
FROM Professor_Turma_Disciplina ptd
WHERE ptd.Id_Professor = 5
  AND ptd.Id_Turma = 2
  AND ptd.Id_Disciplina = 3;

SELECT * FROM Professor WHERE Id = 2; -- Verifique se o professor existe
SELECT * FROM Turma WHERE Id = 1; -- Verifique se a turma existe
SELECT * FROM Disciplina WHERE Id = 3; -- Verifique se a disciplina existe


use controlhub;

CREATE TABLE eventos (
  Id SERIAL PRIMARY KEY,
  Titulo VARCHAR(100) NOT NULL,
  Descricao TEXT,
  Data DATE NOT NULL,
  Id_Aluno INT REFERENCES alunos(Id),
  CriadoPor VARCHAR(50)
);

INSERT INTO eventos (Titulo, Descricao, Data, Id_Responsavel, CriadoPor)
VALUES
('Reunião de Pais', 'Reunião para discutir desempenho escolar', '2025-09-15', 1, 'Gestor'),
('Entrega de Boletim', 'Entrega oficial dos boletins bimestrais', '2025-09-20', 2, 'Gestor');

CREATE TABLE responsaveis (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Nome VARCHAR(100) NOT NULL,
  Email VARCHAR(100)
);

ALTER TABLE eventos DROP COLUMN Id_Aluno;

ALTER TABLE eventos ADD COLUMN Id_Responsavel INT REFERENCES responsaveis(Id);
SELECT e.Id, e.Titulo, e.Descricao, e.Data, r.Nome AS Responsavel, e.CriadoPor
FROM eventos e
JOIN responsaveis r ON e.Id_Responsavel = r.Id;

use controlhub;

SELECT 
    a.Id,
    a.Titulo,
    a.Descricao,
    a.DataCriacao,
    a.DataEntrega,
    p.Nome AS Professor,
    t.Nome AS Turma,
    d.Nome AS Disciplina
FROM Atividade a
JOIN Professor p ON a.Id_Professor = p.Id
JOIN Turma t ON a.Id_Turma = t.Id
JOIN Disciplina d ON a.Id_Disciplina = d.Id
ORDER BY a.DataEntrega;

use controlhub;

-- 1. Crie a tabela Bimestre (se ainda não existir)
CREATE TABLE IF NOT EXISTS Bimestre (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Nome VARCHAR(50) NOT NULL,
    DataInicio DATE,
    DataFim DATE,
    Status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo'
);

-- 2. Adicione a coluna Id_Bimestre na tabela Atividade (se ainda não existir)
SET @db := DATABASE();
SELECT COUNT(*) INTO @cnt
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Atividade' AND COLUMN_NAME = 'Id_Bimestre';

SET @s = IF(@cnt = 0, 'ALTER TABLE `Atividade` ADD COLUMN `Id_Bimestre` INT NULL;', 'SELECT \"column exists\";');
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Atualize os registros existentes para um bimestre válido (exemplo: Id = 1)
UPDATE Atividade 
SET Id_Bimestre = 1 
WHERE Id_Bimestre IS NULL;

-- 4. Adicione a constraint de chave estrangeira (se ainda não existir)
SELECT COUNT(*) 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = DATABASE()
  AND TABLE_NAME = 'Atividade'
  AND CONSTRAINT_NAME = 'FK_Atividade_Bimestre';

ALTER TABLE Atividade
ADD CONSTRAINT FK_Atividade_Bimestre
FOREIGN KEY (Id_Bimestre) REFERENCES Bimestre(Id);


-- 5. Crie a tabela Nota vinculando à Atividade
CREATE TABLE IF NOT EXISTS Nota (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Id_Aluno INT NOT NULL,
    Id_Atividade INT NOT NULL,
    Valor DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (Id_Aluno) REFERENCES Aluno(Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Id_Atividade) REFERENCES Atividade(Id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 6. Crie a tabela Boletim para consolidar notas finais por aluno, disciplina e bimestre
CREATE TABLE IF NOT EXISTS Boletim (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Id_Aluno INT NOT NULL,
    Id_Disciplina INT NOT NULL,
    Id_Bimestre INT NOT NULL,
    MediaFinal DECIMAL(5,2),
    Situacao ENUM('Aprovado', 'Reprovado', 'Recuperacao') DEFAULT NULL,
    Observacoes TEXT,
    FOREIGN KEY (Id_Aluno) REFERENCES Aluno(Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Id_Disciplina) REFERENCES Disciplina(Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Id_Bimestre) REFERENCES Bimestre(Id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (Id_Aluno, Id_Disciplina, Id_Bimestre)
);

USE ControlHub;

INSERT INTO Prova (Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina, EnvioProva, RecebimentoProva)
VALUES 
('Prova Final de Matemática', 'Prova abrangendo todo o conteúdo do semestre', CURDATE(), '2025-12-15', 1, 1, 1, NOW(), NULL);

INSERT INTO Atividade (Titulo, Descricao, DataCriacao, DataEntrega, Id_Professor, Id_Turma, Id_Disciplina, EnvioAtividade, Id_Bimestre)
VALUES  
('Trabalho de História', 'Pesquisa sobre a história do Brasil colonial', CURDATE(), '2025-11-30', 2, 1, 3, NOW(), 1);

UPDATE Boletim
SET MediaFinal = 8.5, Situacao = 'Aprovado', Observacoes = 'Bom desempenho geral na disciplina'
WHERE Id_Aluno = 1 AND Id_Disciplina = 1 AND Id_Bimestre = 1;

CREATE TABLE Curso (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  Nome VARCHAR(100) NOT NULL UNIQUE,
  Descricao TEXT
);

CREATE TABLE GradeCurricular (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  Id_Curso INT NOT NULL,
  AnoInicio YEAR NOT NULL,
  AnoFim YEAR,
  Descricao TEXT,
  FOREIGN KEY (Id_Curso) REFERENCES Curso(Id) ON DELETE CASCADE
);

CREATE TABLE GradeDisciplina (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  Id_GradeCurricular INT NOT NULL,
  Id_Disciplina INT NOT NULL,
  Obrigatoria BOOLEAN NOT NULL DEFAULT TRUE,
  CargaHoraria INT NOT NULL,
  Semestre INT NOT NULL, -- ou Ano INT NOT NULL, dependendo da organização
  Ordem INT, -- para ordenar as disciplinas no semestre/ano
  FOREIGN KEY (Id_GradeCurricular) REFERENCES GradeCurricular(Id) ON DELETE CASCADE,
  FOREIGN KEY (Id_Disciplina) REFERENCES Disciplina(Id) ON DELETE CASCADE,
  UNIQUE (Id_GradeCurricular, Id_Disciplina)
);

CREATE TABLE PreRequisito (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  Id_GradeCurricular INT NOT NULL,
  Id_Disciplina INT NOT NULL,
  Id_PreRequisito INT NOT NULL,
  FOREIGN KEY (Id_GradeCurricular) REFERENCES GradeCurricular(Id) ON DELETE CASCADE,
  FOREIGN KEY (Id_Disciplina) REFERENCES Disciplina(Id) ON DELETE CASCADE,
  FOREIGN KEY (Id_PreRequisito) REFERENCES Disciplina(Id) ON DELETE CASCADE,
  UNIQUE (Id_GradeCurricular, Id_Disciplina, Id_PreRequisito)
);

INSERT INTO Curso (Nome, Descricao) VALUES
('Ensino Médio', 'Curso de Ensino Médio regular'),
('Curso Técnico em Informática', 'Curso técnico profissionalizante em informática');

INSERT INTO GradeCurricular (Id_Curso, AnoInicio, AnoFim, Descricao) VALUES
(1, 2023, NULL, 'Grade curricular do Ensino Médio - versão 2023');

INSERT INTO Disciplina (Nome, Codigo, Ementa, CargaHoraria, PreRequisitos) VALUES
('Matemática', 'MAT101', 'Matemática básica e avançada', 60, NULL),
('Português', 'POR101', 'Língua Portuguesa', 60, NULL),
('Física', 'FIS101', 'Física básica', 60, NULL),
('Química', 'QUI101', 'Química geral', 60, NULL),
('Biologia', 'BIO101', 'Biologia geral', 60, NULL),
('Educação Física', 'EF101', 'Atividades físicas e esportes', 60, NULL),
('Artes', 'ART101', 'Educação artística', 60, NULL),
('Inglês', 'ING101', 'Língua Inglesa', 60, NULL);

INSERT INTO GradeDisciplina (Id_GradeCurricular, Id_Disciplina, Obrigatoria, CargaHoraria, Semestre, Ordem) VALUES
(1, 1, TRUE, 60, 1, 1),  -- Matemática, obrigatório, 1º semestre
(1, 2, TRUE, 60, 1, 2),  -- Português, obrigatório, 1º semestre
(1, 3, TRUE, 60, 2, 1),  -- Física, obrigatório, 2º semestre
(1, 4, TRUE, 60, 2, 2),  -- Química, obrigatório, 2º semestre
(1, 5, TRUE, 60, 3, 1),  -- Biologia, obrigatório, 3º semestre
(1, 6, FALSE, 60, 3, 2), -- Educação Física, optativa, 3º semestre
(1, 7, FALSE, 60, 4, 1), -- Artes, optativa, 4º semestre
(1, 8, TRUE, 60, 4, 2);  -- Inglês, obrigatório, 4º semestre

INSERT INTO PreRequisito (Id_GradeCurricular, Id_Disciplina, Id_PreRequisito) VALUES
(1, 3, 1),  -- Física depende de Matemática
(1, 4, 3);  -- Química depende de Física

SELECT gd.Semestre, gd.Ordem, d.Nome AS Disciplina, gd.Obrigatoria, gd.CargaHoraria,
       GROUP_CONCAT(pr2.Nome SEPARATOR ', ') AS PreRequisitos
FROM GradeDisciplina gd
JOIN Disciplina d ON gd.Id_Disciplina = d.Id
LEFT JOIN PreRequisito pr ON pr.Id_Disciplina = gd.Id_Disciplina AND pr.Id_GradeCurricular = gd.Id_GradeCurricular
LEFT JOIN Disciplina pr2 ON pr.Id_PreRequisito = pr2.Id
WHERE gd.Id_GradeCurricular = 1
GROUP BY gd.Id
ORDER BY gd.Semestre, gd.Ordem;

CREATE TABLE PesoAvaliacao (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  Id_GradeDisciplina INT NOT NULL,
  Tipo ENUM('Prova', 'Atividade') NOT NULL,
  Peso DECIMAL(5,2) NOT NULL, -- Exemplo: 0.6 para 60%
  Id_Bimestre INT NOT NULL,
  FOREIGN KEY (Id_GradeDisciplina) REFERENCES GradeDisciplina(Id) ON DELETE CASCADE,
  FOREIGN KEY (Id_Bimestre) REFERENCES Bimestre(Id) ON DELETE CASCADE,
  UNIQUE (Id_GradeDisciplina, Tipo, Id_Bimestre)
);

ALTER TABLE Prova ADD COLUMN Id_GradeDisciplina INT NOT NULL;
SELECT Id, Id_GradeDisciplina FROM Prova WHERE Id_GradeDisciplina IS NULL OR Id_GradeDisciplina NOT IN (SELECT Id FROM GradeDisciplina);

ALTER TABLE Atividade ADD COLUMN Id_GradeDisciplina INT NOT NULL;
SELECT Id, Id_GradeDisciplina 
FROM Atividade 
WHERE Id_GradeDisciplina IS NULL 
   OR Id_GradeDisciplina NOT IN (SELECT Id FROM GradeDisciplina);

CREATE TABLE IF NOT EXISTS Nota (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Id_Aluno INT NOT NULL,
    Id_Turma INT NOT NULL,
    Id_Bimestre INT NOT NULL,
    Id_Atividade INT NULL,
    Id_Prova INT NULL,
    Valor DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (Id_Aluno) REFERENCES Aluno(Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Id_Turma) REFERENCES Turma(Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Id_Bimestre) REFERENCES Bimestre(Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Id_Atividade) REFERENCES Atividade(Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Id_Prova) REFERENCES Prova(Id) ON DELETE CASCADE ON UPDATE CASCADE
);

SHOW COLUMNS FROM Nota;
ALTER TABLE Nota
ADD COLUMN Id_Atividade INT NULL,
ADD COLUMN Id_Prova INT NULL;
ALTER TABLE Nota
ADD CONSTRAINT FK_Nota_Atividade FOREIGN KEY (Id_Atividade) REFERENCES Atividade(Id) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT FK_Nota_Prova FOREIGN KEY (Id_Prova) REFERENCES Prova(Id) ON DELETE CASCADE ON UPDATE CASCADE;
-- Definir variáveis
SET @Id_Aluno = 1;
SET @Id_Disciplina = 1;
SET @Id_Bimestre = 1;

-- Calcular nota final ponderada de atividades
SELECT 
  IFNULL(SUM(n.Valor * pa.Peso) / NULLIF(SUM(pa.Peso), 0), 0) INTO @notaAtividades
FROM Nota n
JOIN Atividade a ON n.Id_Atividade = a.Id
JOIN GradeDisciplina gd ON a.Id_GradeDisciplina = gd.Id
JOIN PesoAvaliacao pa ON pa.Id_GradeDisciplina = gd.Id AND pa.Tipo = 'Atividade' AND pa.Id_Bimestre = a.Id_Bimestre
WHERE n.Id_Aluno = @Id_Aluno AND gd.Id_Disciplina = @Id_Disciplina AND a.Id_Bimestre = @Id_Bimestre;

DESCRIBE Prova;
SHOW COLUMNS FROM Prova;
ALTER TABLE Prova
ADD COLUMN Id_Bimestre INT NOT NULL;

UPDATE Prova SET Id_Bimestre = 1 WHERE Id_Bimestre IS NULL;

ALTER TABLE Prova
ADD CONSTRAINT FK_Prova_Bimestre FOREIGN KEY (Id_Bimestre) REFERENCES Bimestre(Id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Calcular nota final ponderada de provas
SELECT 
  IFNULL(SUM(n.Valor * pa.Peso) / NULLIF(SUM(pa.Peso), 0), 0) INTO @notaProvas
FROM Nota n
JOIN Prova pr ON n.Id_Prova = pr.Id
JOIN GradeDisciplina gd ON pr.Id_GradeDisciplina = gd.Id
JOIN PesoAvaliacao pa ON pa.Id_GradeDisciplina = gd.Id AND pa.Tipo = 'Prova' AND pa.Id_Bimestre = pr.Id_Bimestre
WHERE n.Id_Aluno = @Id_Aluno AND gd.Id_Disciplina = @Id_Disciplina AND pr.Id_Bimestre = @Id_Bimestre;

-- Somar as notas ponderadas
SET @notaFinal = @notaAtividades + @notaProvas;

-- Definir situação
SET @situacao = IF(@notaFinal >= 7, 'Aprovado', IF(@notaFinal >= 5, 'Recuperacao', 'Reprovado'));

-- Atualizar boletim
UPDATE Boletim
SET MediaFinal = @notaFinal,
    Situacao = @situacao
WHERE Id_Aluno = @Id_Aluno AND Id_Disciplina = @Id_Disciplina AND Id_Bimestre = @Id_Bimestre;

-- 1. Adicionar a coluna Id_Bimestre na tabela Prova
ALTER TABLE Prova
ADD COLUMN Id_Bimestre INT NOT NULL;

-- 2. Criar a chave estrangeira para garantir integridade referencial
ALTER TABLE Prova
ADD CONSTRAINT FK_Prova_Bimestre FOREIGN KEY (Id_Bimestre)
REFERENCES Bimestre(Id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 3. Atualizar os registros existentes para um Id_Bimestre válido (exemplo: 1)
UPDATE Prova
SET Id_Bimestre = 1
WHERE Id_Bimestre IS NULL;

SELECT CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'Prova'
  AND COLUMN_NAME = 'Id_Bimestre'
  AND REFERENCED_TABLE_NAME = 'Bimestre';
  
  ALTER TABLE Prova
ADD CONSTRAINT FK_Prova_Bimestre FOREIGN KEY (Id_Bimestre)
REFERENCES Bimestre(Id)
ON DELETE CASCADE
ON UPDATE CASCADE;

SELECT 
    t.Id AS Id_Turma,
    t.Nome AS Nome_Turma,
    b.Id AS Id_Bimestre,
    b.Nome AS Nome_Bimestre,
    b.DataInicio,
    b.DataFim
FROM 
    Turma t
JOIN 
    Atividade a ON a.Id_Turma = t.Id
JOIN 
    Bimestre b ON a.Id_Bimestre = b.Id
WHERE 
    b.Status = 'Ativo'
GROUP BY 
    t.Id, b.Id
ORDER BY 
    t.Nome, b.DataInicio;
    
----------------------------------------------------

SELECT 
    t.Id AS Id_Turma,
    t.Nome AS Nome_Turma,
    b.Id AS Id_Bimestre,
    b.Nome AS Nome_Bimestre,
    b.DataInicio,
    b.DataFim
FROM 
    Turma t
JOIN 
    Atividade a ON a.Id_Turma = t.Id
JOIN 
    Bimestre b ON a.Id_Bimestre = b.Id
WHERE 
    b.Status = 'Ativo'

UNION

SELECT 
    t.Id AS Id_Turma,
    t.Nome AS Nome_Turma,
    b.Id AS Id_Bimestre,
    b.Nome AS Nome_Bimestre,
    b.DataInicio,
    b.DataFim
FROM 
    Turma t
JOIN 
    Prova p ON p.Id_Turma = t.Id
JOIN 
    Bimestre b ON p.Id_Bimestre = b.Id
WHERE 
    b.Status = 'Ativo'

ORDER BY 
    Nome_Turma, DataInicio;
    
    
    SELECT 
    t.Id AS Id_Turma,
    t.Nome AS Nome_Turma,
    b.Id AS Id_Bimestre,
    b.Nome AS Nome_Bimestre,
    b.DataInicio,
    b.DataFim
FROM 
    Turma t
CROSS JOIN 
    Bimestre b
WHERE 
    b.Status = 'Ativo'
ORDER BY 
    t.Nome, b.DataInicio;
    
----------------------------------------
SELECT 
    t.Id AS Id_Turma,
    t.Nome AS Nome_Turma,
    b.Id AS Id_Bimestre,
    b.Nome AS Nome_Bimestre,
    b.DataInicio,
    b.DataFim
FROM 
    Turma t
CROSS JOIN 
    Bimestre b
WHERE 
    b.Status = 'Ativo'
ORDER BY 
    t.Nome, b.DataInicio;
    
-----------------------------------------
ALTER TABLE Turma ADD COLUMN Id_GradeCurricular INT;

ALTER TABLE Turma
ADD CONSTRAINT FK_Turma_GradeCurricular FOREIGN KEY (Id_GradeCurricular) REFERENCES GradeCurricular(Id);
----------------------------------------------------------------------------------

SELECT 
    t.Nome AS Turma,
    gd.Semestre,
    gd.Ordem,
    d.Nome AS Disciplina,
    gd.CargaHoraria,
    CASE WHEN gd.Obrigatoria THEN 'Sim' ELSE 'Não' END AS Obrigatoria
FROM 
    Turma t
JOIN 
    GradeCurricular gc ON t.Id_GradeCurricular = gc.Id
JOIN 
    GradeDisciplina gd ON gd.Id_GradeCurricular = gc.Id
JOIN 
    Disciplina d ON d.Id = gd.Id_Disciplina
ORDER BY 
    t.Nome, gd.Semestre, gd.Ordem;
    
ALTER TABLE Turma ADD COLUMN Id_GradeCurricular INT;

ALTER TABLE Turma
ADD CONSTRAINT FK_Turma_GradeCurricular FOREIGN KEY (Id_GradeCurricular) REFERENCES GradeCurricular(Id);
    
USE ControlHub;

SELECT 
    t.Id AS Id_Turma,
    d.Id AS Id_Disciplina,
    d.Codigo AS Codigo_Disciplina,
    p.Id AS Id_Professor,
    p.Nome AS Nome_Professor
FROM 
    Turma t
JOIN 
    GradeDisciplina gd ON gd.Id_GradeCurricular = t.Id_GradeCurricular
JOIN 
    Disciplina d ON gd.Id_Disciplina = d.Id
JOIN 
    Professor_Turma_Disciplina ptd ON ptd.Id_Turma = t.Id AND ptd.Id_Disciplina = d.Id
JOIN 
    Professor p ON ptd.Id_Professor = p.Id
WHERE 
    t.Id = 1
    AND p.Id = 5
ORDER BY 
    t.Nome, d.Nome;
    
-- Exemplo: Atualizar Turma 1 para ter Id_GradeCurricular = 1
UPDATE Turma SET Id_GradeCurricular = 1 WHERE Id = 1;

INSERT IGNORE INTO GradeCurricular (Id_Curso, AnoInicio, Descricao) VALUES (1, 2023, 'Grade Curricular Ensino Médio 2023');
INSERT IGNORE INTO Disciplina (Nome, Codigo, Ementa, CargaHoraria) VALUES ('História', 'HIS101', 'História do Brasil', 60);

INSERT IGNORE INTO GradeDisciplina (Id_GradeCurricular, Id_Disciplina, Obrigatoria, CargaHoraria, Semestre, Ordem)
VALUES (1, 3, TRUE, 60, 1, 1);

INSERT IGNORE INTO Professor (Nome, CPF, Email, Senha, Telefone, Endereco, DataNascimento, Genero, FormacaoAcademica, DataContratacao, Status)
VALUES ('Nome do Professor', 'CPF_do_Professor', 'email@exemplo.com', 'senha123', '999999999', 'Endereço', '1980-01-01', 'Masculino', 'Formação', '2010-01-01', 'Ativo');

INSERT IGNORE INTO Professor_Turma_Disciplina (Id_Professor, Id_Turma, Id_Disciplina, Status)
VALUES (5, 1, 3, 'Ativo');

SELECT * FROM Professor;
SELECT * FROM Turma;
SELECT * FROM Disciplina;

SELECT Id, Id_GradeCurricular, Id_Disciplina, Semestre, Obrigatoria, CargaHoraria, Ordem
FROM GradeDisciplina
ORDER BY Semestre, Ordem;

ALTER TABLE GradeCurricular
ADD COLUMN CargaHorariaTotal INT DEFAULT 0;

SET SQL_SAFE_UPDATES = 0;

UPDATE GradeCurricular gc
SET CargaHorariaTotal = (
    SELECT IFNULL(SUM(gd.CargaHoraria), 0)
    FROM GradeDisciplina gd
    WHERE gd.Id_GradeCurricular = gc.Id
);

CREATE OR REPLACE VIEW vw_GradeCurricular_ComCargaHoraria AS
SELECT 
    gc.Id,
    gc.Id_Curso,
    gc.AnoInicio,
    gc.AnoFim,
    gc.Descricao,
    IFNULL(SUM(gd.CargaHoraria), 0) AS CargaHorariaTotal
FROM GradeCurricular gc
LEFT JOIN GradeDisciplina gd ON gd.Id_GradeCurricular = gc.Id
GROUP BY gc.Id;

SELECT
  b.Id_Aluno,
  b.Id_Disciplina,
  b.Id_Bimestre,
  -- Média das notas de Atividades
  IFNULL((
    SELECT AVG(n.Valor)
    FROM Nota n
    JOIN Atividade a ON n.Id_Atividade = a.Id
    WHERE n.Id_Aluno = b.Id_Aluno
      AND a.Id_Disciplina = b.Id_Disciplina
      AND a.Id_Bimestre = b.Id_Bimestre
  ), 0) AS MediaAtividades,
  -- Média das notas de Provas
  IFNULL((
    SELECT AVG(n.Valor)
    FROM Nota n
    JOIN Prova p ON n.Id_Prova = p.Id
    WHERE n.Id_Aluno = b.Id_Aluno
      AND p.Id_Disciplina = b.Id_Disciplina
      AND p.Id_Bimestre = b.Id_Bimestre
  ), 0) AS MediaProvas,
  -- Média final simples (pode ajustar pesos aqui)
  ROUND(
    (
      IFNULL((
        SELECT AVG(n.Valor)
        FROM Nota n
        JOIN Atividade a ON n.Id_Atividade = a.Id
        WHERE n.Id_Aluno = b.Id_Aluno
          AND a.Id_Disciplina = b.Id_Disciplina
          AND a.Id_Bimestre = b.Id_Bimestre
      ), 0) * 0.4
      +
      IFNULL((
        SELECT AVG(n.Valor)
        FROM Nota n
        JOIN Prova p ON n.Id_Prova = p.Id
        WHERE n.Id_Aluno = b.Id_Aluno
          AND p.Id_Disciplina = b.Id_Disciplina
          AND p.Id_Bimestre = b.Id_Bimestre
      ), 0) * 0.6
    ), 2
  ) AS MediaFinalCalculada,
  b.Situacao,
  b.Observacoes
FROM Boletim b
WHERE b.Id_Aluno = 123
ORDER BY b.Id_Bimestre, b.Id_Disciplina;

SELECT   
  b.Id_Aluno,   
  b.Id_Disciplina,   
  b.Id_Bimestre,   
  IFNULL((
    SELECT SUM(n.Valor)
    FROM Nota n
    JOIN Atividade a ON n.Id_Atividade = a.Id
    WHERE n.Id_Aluno = b.Id_Aluno
      AND a.Id_Disciplina = b.Id_Disciplina
      AND a.Id_Bimestre = b.Id_Bimestre
  ), 0) AS SomaNotasAtividades,   
  IFNULL((
    SELECT COUNT(n.Valor)
    FROM Nota n
    JOIN Atividade a ON n.Id_Atividade = a.Id
    WHERE n.Id_Aluno = b.Id_Aluno
      AND a.Id_Disciplina = b.Id_Disciplina
      AND a.Id_Bimestre = b.Id_Bimestre
  ), 0) AS QtdeNotasAtividades,   
  IFNULL((
    SELECT SUM(n.Valor)
    FROM Nota n
    JOIN Prova p ON n.Id_Prova = p.Id
    WHERE n.Id_Aluno = b.Id_Aluno
      AND p.Id_Disciplina = b.Id_Disciplina
      AND p.Id_Bimestre = b.Id_Bimestre
  ), 0) AS SomaNotasProvas,   
  IFNULL((
    SELECT COUNT(n.Valor)
    FROM Nota n
    JOIN Prova p ON n.Id_Prova = p.Id
    WHERE n.Id_Aluno = b.Id_Aluno
      AND p.Id_Disciplina = b.Id_Disciplina
      AND p.Id_Bimestre = b.Id_Bimestre
  ), 0) AS QtdeNotasProvas,   
  CASE     
    WHEN (
      IFNULL((
        SELECT COUNT(n.Valor)
        FROM Nota n
        JOIN Atividade a ON n.Id_Atividade = a.Id
        WHERE n.Id_Aluno = b.Id_Aluno
          AND a.Id_Disciplina = b.Id_Disciplina
          AND a.Id_Bimestre = b.Id_Bimestre
      ), 0) + 
      IFNULL((
        SELECT COUNT(n.Valor)
        FROM Nota n
        JOIN Prova p ON n.Id_Prova = p.Id
        WHERE n.Id_Aluno = b.Id_Aluno
          AND p.Id_Disciplina = b.Id_Disciplina
          AND p.Id_Bimestre = b.Id_Bimestre
      ), 0)
    ) = 0 THEN 0     
    ELSE ROUND(
      (
        IFNULL((
          SELECT SUM(n.Valor)
          FROM Nota n
          JOIN Atividade a ON n.Id_Atividade = a.Id
          WHERE n.Id_Aluno = b.Id_Aluno
            AND a.Id_Disciplina = b.Id_Disciplina
            AND a.Id_Bimestre = b.Id_Bimestre
        ), 0) + 
        IFNULL((
          SELECT SUM(n.Valor)
          FROM Nota n
          JOIN Prova p ON n.Id_Prova = p.Id
          WHERE n.Id_Aluno = b.Id_Aluno
            AND p.Id_Disciplina = b.Id_Disciplina
            AND p.Id_Bimestre = b.Id_Bimestre
        ), 0)
      ) / (
        IFNULL((
          SELECT COUNT(n.Valor)
          FROM Nota n
          JOIN Atividade a ON n.Id_Atividade = a.Id
          WHERE n.Id_Aluno = b.Id_Aluno
            AND a.Id_Disciplina = b.Id_Disciplina
            AND a.Id_Bimestre = b.Id_Bimestre
        ), 0) + 
        IFNULL((
          SELECT COUNT(n.Valor)
          FROM Nota n
          JOIN Prova p ON n.Id_Prova = p.Id
          WHERE n.Id_Aluno = b.Id_Aluno
            AND p.Id_Disciplina = b.Id_Disciplina
            AND p.Id_Bimestre = b.Id_Bimestre
        ), 0)
      ), 2
    )
  END AS MediaFinalCalculada,   
  b.Situacao,   
  b.Observacoes 
FROM Boletim b 
WHERE b.Id_Aluno = 123  -- Substitua 123 pelo Id do aluno desejado
ORDER BY b.Id_Bimestre, b.Id_Disciplina;

ALTER TABLE Boletim
DROP COLUMN MediaFinal;

UPDATE Boletim b
JOIN (
  -- Subconsulta com cálculo da média final (igual à anterior)
  SELECT 
    b.Id AS BoletimId,
    CASE 
      WHEN (qtdeNotas = 0) THEN 0
      ELSE ROUND((somaAtividades + somaProvas) / qtdeNotas, 2)
    END AS MediaFinalCalculada
  FROM (
    SELECT 
      b.Id,
      b.Id_Aluno,
      b.Id_Disciplina,
      b.Id_Bimestre,
      IFNULL((
        SELECT SUM(n.Valor)
        FROM Nota n
        JOIN Atividade a ON n.Id_Atividade = a.Id
        WHERE n.Id_Aluno = b.Id_Aluno
          AND a.Id_Disciplina = b.Id_Disciplina
          AND a.Id_Bimestre = b.Id_Bimestre
      ), 0) AS somaAtividades,
      IFNULL((
        SELECT SUM(n.Valor)
        FROM Nota n
        JOIN Prova p ON n.Id_Prova = p.Id
        WHERE n.Id_Aluno = b.Id_Aluno
          AND p.Id_Disciplina = b.Id_Disciplina
          AND p.Id_Bimestre = b.Id_Bimestre
      ), 0) AS somaProvas,
      (
        IFNULL((
          SELECT COUNT(*)
          FROM Nota n
          JOIN Atividade a ON n.Id_Atividade = a.Id
          WHERE n.Id_Aluno = b.Id_Aluno
            AND a.Id_Disciplina = b.Id_Disciplina
            AND a.Id_Bimestre = b.Id_Bimestre
        ), 0)
        +
        IFNULL((
          SELECT COUNT(*)
          FROM Nota n
          JOIN Prova p ON n.Id_Prova = p.Id
          WHERE n.Id_Aluno = b.Id_Aluno
            AND p.Id_Disciplina = b.Id_Disciplina
            AND p.Id_Bimestre = b.Id_Bimestre
        ), 0)
      ) AS qtdeNotas
    FROM Boletim b
  ) b
) calc ON b.Id = calc.BoletimId
SET b.MediaFinal = calc.MediaFinalCalculada;
  
  DESCRIBE Boletim;
  
  ALTER TABLE Boletim
ADD COLUMN MediaFinal DECIMAL(5,2) NOT NULL DEFAULT 0;

INSERT INTO Boletim (Id_Aluno, Id_Disciplina, Id_Bimestre, MediaFinal, Situacao, Observacoes)
VALUES (123, 45, 1, 7.75, 'Aprovado', 'Aluno está indo bem')
ON DUPLICATE KEY UPDATE
  MediaFinal = VALUES(MediaFinal),
  Situacao = VALUES(Situacao),
  Observacoes = VALUES(Observacoes);
  
  USE ControlHub;
  SELECT * FROM Aluno WHERE Id = 123;
  
  SELECT * FROM Atividade WHERE Id = 456;
  
  SELECT * FROM Turma WHERE Id = 10;
  INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor) VALUES
(1, 1, 1, 1, 8.5),
(1, 1, 1, 1, 9.0);

SHOW INDEX FROM Nota;

INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor) VALUES
(1, 1, 1, 1, 7.5),
(1, 1, 1, 1, 8.0);

CREATE TABLE EntregaAtividade (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Id_Aluno INT NOT NULL,
  Id_Atividade INT NOT NULL,
  DataEntrega DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Conteudo TEXT, -- pode ser texto, link, JSON, etc.
  Arquivo VARCHAR(255), -- caminho do arquivo, se for upload
  Status ENUM('Pendente', 'Entregue', 'Avaliado') DEFAULT 'Pendente',
  FOREIGN KEY (Id_Aluno) REFERENCES Aluno(Id),
  FOREIGN KEY (Id_Atividade) REFERENCES Atividade(Id)
);

DROP TABLE EntregaAtividade;

CREATE TABLE EntregaAtividade (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Id_Aluno INT NOT NULL,
  Id_Atividade INT NOT NULL,
  DataEntrega DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Conteudo TEXT,
  Arquivo VARCHAR(255),
  Status ENUM('Pendente', 'Entregue', 'Avaliado') DEFAULT 'Pendente',
  FOREIGN KEY (Id_Aluno) REFERENCES Aluno(Id),
  FOREIGN KEY (Id_Atividade) REFERENCES Atividade(Id)
);

ALTER TABLE GradeDisciplina
ADD COLUMN Descricao TEXT;

UPDATE GradeDisciplina
SET Descricao = 'Estudo dos fundamentos de álgebra e operações básicas'
WHERE Id_GradeCurricular = 1 AND Id_Disciplina = 1; -- Exemplo para Matemática

ALTER TABLE Boletim
ADD COLUMN Frequencia INT DEFAULT 0;

SET SQL_SAFE_UPDATES = 0;

UPDATE Boletim b
LEFT JOIN (
    SELECT 
        f.Id_Aluno,
        f.Id_Disciplina,
        b.Id AS Id_Bimestre,
        COUNT(*) AS QtdeFaltas
    FROM Falta f
    JOIN Bimestre b ON f.DataFalta BETWEEN b.DataInicio AND b.DataFim
    GROUP BY f.Id_Aluno, f.Id_Disciplina, b.Id
) faltas ON b.Id_Aluno = faltas.Id_Aluno 
        AND b.Id_Disciplina = faltas.Id_Disciplina 
        AND b.Id_Bimestre = faltas.Id_Bimestre
SET b.Frequencia = IFNULL(faltas.QtdeFaltas, 0);

SET SQL_SAFE_UPDATES = 1;

CREATE OR REPLACE VIEW vw_GradeDisciplina_ComCodigo AS
SELECT 
    gd.Id,
    gd.Id_GradeCurricular,
    gd.Id_Disciplina,
    d.Codigo AS CodigoDisciplina,
    gd.Obrigatoria,
    gd.CargaHoraria,
    gd.Semestre,
    gd.Ordem,
    gd.Descricao
FROM GradeDisciplina gd
JOIN Disciplina d ON gd.Id_Disciplina = d.Id;

ALTER TABLE GradeDisciplina ADD COLUMN CodigoDisciplina VARCHAR(10);

SET SQL_SAFE_UPDATES = 0;

UPDATE GradeDisciplina gd
JOIN Disciplina d ON gd.Id_Disciplina = d.Id
SET gd.CodigoDisciplina = d.Codigo;

SET SQL_SAFE_UPDATES = 1;

ALTER TABLE GradeCurricular ADD COLUMN Codigo VARCHAR(20) UNIQUE;

SHOW COLUMNS FROM Turma LIKE 'Id_GradeCurricular';

SELECT CONSTRAINT_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'Turma'
  AND COLUMN_NAME = 'Id_GradeCurricular'
  AND REFERENCED_TABLE_NAME = 'GradeCurricular';
  
ALTER TABLE Turma
ADD CONSTRAINT FK_Turma_GradeCurricular FOREIGN KEY (Id_GradeCurricular) REFERENCES GradeCurricular(Id);

SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'Turma'
  AND REFERENCED_TABLE_NAME = 'GradeCurricular';
  
  INSERT INTO Turma (Nome, Serie, AnoLetivo, Turno, Sala, CapacidadeMaxima, Status, Id_GradeCurricular)
VALUES ('Turma A', '1ª Série', 2024, 'Manhã', 'Sala 101', 30, 'Ativo', 1);

CREATE TABLE GradeDisciplina_Professor (
  Id INT PRIMARY KEY AUTO_INCREMENT,
  Id_GradeDisciplina INT NOT NULL,
  Id_Professor INT NOT NULL,
  FOREIGN KEY (Id_GradeDisciplina) REFERENCES GradeDisciplina(Id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (Id_Professor) REFERENCES Professor(Id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE (Id_GradeDisciplina, Id_Professor)
);

SELECT 
  gd.Id AS Id_GradeDisciplina,
  d.Nome AS Disciplina,
  p.Id AS Id_Professor,
  p.Nome AS Professor
FROM GradeDisciplina gd
JOIN Disciplina d ON gd.Id_Disciplina = d.Id
JOIN GradeDisciplina_Professor gdp ON gdp.Id_GradeDisciplina = gd.Id
JOIN Professor p ON gdp.Id_Professor = p.Id
WHERE gd.Id_GradeCurricular = 1;

SELECT 
  p.Id AS Id_Professor,
  p.Nome AS Nome_Professor,
  t.Id AS Id_Turma,
  t.Nome AS Nome_Turma,
  gd.Id AS Id_GradeDisciplina,
  d.Nome AS Nome_Disciplina,
  gc.Id AS Id_GradeCurricular,
  gc.Codigo AS Codigo_GradeCurricular
FROM Professor p
JOIN Professor_Turma_Disciplina ptd ON p.Id = ptd.Id_Professor
JOIN Turma t ON ptd.Id_Turma = t.Id
JOIN GradeCurricular gc ON t.Id_GradeCurricular = gc.Id
JOIN GradeDisciplina gd ON gd.Id_GradeCurricular = gc.Id AND gd.Id_Disciplina = ptd.Id_Disciplina
JOIN Disciplina d ON gd.Id_Disciplina = d.Id
WHERE gc.Id = 1
  AND gd.Id_Disciplina = 3
ORDER BY p.Nome, t.Nome;

SELECT 
  gd.Semestre,
  d.Nome AS Nome_Disciplina,
  gd.CargaHoraria,
  gd.Ordem
FROM GradeDisciplina gd
JOIN Disciplina d ON gd.Id_Disciplina = d.Id
WHERE gd.Id_GradeCurricular = 1
ORDER BY gd.Semestre, gd.Ordem;

SELECT 
  CASE 
    WHEN gd.Semestre = 1 AND gd.Ordem IN (1,2) THEN 1
    WHEN gd.Semestre = 1 AND gd.Ordem IN (3,4) THEN 2
    WHEN gd.Semestre = 2 AND gd.Ordem IN (1,2) THEN 3
    WHEN gd.Semestre = 2 AND gd.Ordem IN (3,4) THEN 4
  END AS Bimestre,
  d.Nome AS Nome_Disciplina,
  gd.CargaHoraria,
  gd.Ordem
FROM GradeDisciplina gd
JOIN Disciplina d ON gd.Id_Disciplina = d.Id
WHERE gd.Id_GradeCurricular = 1
ORDER BY Bimestre, gd.Ordem;

SELECT * FROM GradeDisciplina WHERE Id_GradeCurricular = 1;

DELETE FROM GradeDisciplina WHERE Id_GradeCurricular = 1;

-- Semestre 1
INSERT INTO GradeDisciplina (Id_GradeCurricular, Id_Disciplina, Semestre, Ordem, CargaHoraria, Obrigatoria)
VALUES
(1, 1, 1, 1, 60, TRUE), -- Matemática
(1, 2, 1, 2, 60, TRUE), -- Português
(1, 3, 1, 3, 45, TRUE), -- História
(1, 4, 1, 4, 45, TRUE); -- Geografia

-- Semestre 2
INSERT INTO GradeDisciplina (Id_GradeCurricular, Id_Disciplina, Semestre, Ordem, CargaHoraria, Obrigatoria)
VALUES
(1, 5, 2, 1, 60, TRUE), -- Física
(1, 6, 2, 2, 60, TRUE), -- Química
(1, 7, 2, 3, 45, TRUE), -- Biologia
(1, 8, 2, 4, 45, TRUE); -- Inglês

ALTER TABLE GradeDisciplina
ADD COLUMN Bimestre TINYINT NULL;

SET SQL_SAFE_UPDATES = 0;

UPDATE GradeDisciplina
SET Bimestre = CASE
    WHEN Semestre = 1 AND Ordem IN (1,2) THEN 1
    WHEN Semestre = 1 AND Ordem IN (3,4) THEN 2
    WHEN Semestre = 2 AND Ordem IN (1,2) THEN 3
    WHEN Semestre = 2 AND Ordem IN (3,4) THEN 4
END;

SET SQL_SAFE_UPDATES = 1; -- opcional, reativa safe updates

ALTER TABLE Professor_Turma_Disciplina
ADD COLUMN DataInicio DATE NULL;

USE ControlHub;

-- Verificar se a coluna Id_Bimestre já existe
SET @db := DATABASE();
SELECT COUNT(*) INTO @cnt
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Atividade' AND COLUMN_NAME = 'Id_Bimestre';

-- Adicionar a coluna se não existir
SET @s = IF(@cnt = 0, 
    'ALTER TABLE Atividade ADD COLUMN Id_Bimestre INT NULL;', 
    'SELECT "Coluna já existe em Atividade";'
);
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar FOREIGN KEY se não existir (verificar constraint)
SELECT COUNT(*) INTO @fk_cnt
FROM information_schema.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = DATABASE()
  AND TABLE_NAME = 'Atividade'
  AND CONSTRAINT_NAME = 'FK_Atividade_Bimestre';

SET @fk_s = IF(@fk_cnt = 0, 
    'ALTER TABLE Atividade ADD CONSTRAINT FK_Atividade_Bimestre FOREIGN KEY (Id_Bimestre) REFERENCES Bimestre(Id) ON DELETE SET NULL ON UPDATE CASCADE;', 
    'SELECT "FOREIGN KEY já existe em Atividade";'
);
PREPARE fk_stmt FROM @fk_s;
EXECUTE fk_stmt;
DEALLOCATE PREPARE fk_stmt;

-- Atualizar registros existentes para um bimestre padrão (ex: Id=1; ajuste se necessário)
UPDATE Atividade 
SET Id_Bimestre = 1 
WHERE Id_Bimestre IS NULL;

-- Tornar a coluna NOT NULL (opcional, após atualização)
ALTER TABLE Atividade MODIFY COLUMN Id_Bimestre INT NOT NULL DEFAULT 1;

USE ControlHub;

-- Verificar se a coluna Id_Bimestre já existe
SET @db := DATABASE();
SELECT COUNT(*) INTO @cnt
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Prova' AND COLUMN_NAME = 'Id_Bimestre';

-- Adicionar a coluna se não existir
SET @s = IF(@cnt = 0, 
    'ALTER TABLE Prova ADD COLUMN Id_Bimestre INT NULL;', 
    'SELECT "Coluna já existe em Prova";'
);
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar FOREIGN KEY se não existir
SELECT COUNT(*) INTO @fk_cnt
FROM information_schema.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = DATABASE()
  AND TABLE_NAME = 'Prova'
  AND CONSTRAINT_NAME = 'FK_Prova_Bimestre';

SET @fk_s = IF(@fk_cnt = 0, 
    'ALTER TABLE Prova ADD CONSTRAINT FK_Prova_Bimestre FOREIGN KEY (Id_Bimestre) REFERENCES Bimestre(Id) ON DELETE SET NULL ON UPDATE CASCADE;', 
    'SELECT "FOREIGN KEY já existe em Prova";'
);
PREPARE fk_stmt FROM @fk_s;
EXECUTE fk_stmt;
DEALLOCATE PREPARE fk_stmt;

-- Atualizar registros existentes para um bimestre padrão (ex: Id=1)
UPDATE Prova 
SET Id_Bimestre = 1 
WHERE Id_Bimestre IS NULL;

-- Tornar a coluna NOT NULL (opcional, após atualização)
ALTER TABLE Prova MODIFY COLUMN Id_Bimestre INT NOT NULL DEFAULT 1;

USE ControlHub;

-- Verificar se a coluna Id_Bimestre já existe
SET @db := DATABASE();
SELECT COUNT(*) INTO @cnt
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Boletim' AND COLUMN_NAME = 'Id_Bimestre';

-- Adicionar a coluna se não existir (provavelmente já existe, mas para segurança)
SET @s = IF(@cnt = 0, 
    'ALTER TABLE Boletim ADD COLUMN Id_Bimestre INT NULL;', 
    'SELECT "Coluna já existe em Boletim";'
);
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar FOREIGN KEY se não existir
SELECT COUNT(*) INTO @fk_cnt
FROM information_schema.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = DATABASE()
  AND TABLE_NAME = 'Boletim'
  AND CONSTRAINT_NAME = 'FK_Boletim_Bimestre';

SET @fk_s = IF(@fk_cnt = 0, 
    'ALTER TABLE Boletim ADD CONSTRAINT FK_Boletim_Bimestre FOREIGN KEY (Id_Bimestre) REFERENCES Bimestre(Id) ON DELETE CASCADE ON UPDATE CASCADE;', 
    'SELECT "FOREIGN KEY já existe em Boletim";'
);
PREPARE fk_stmt FROM @fk_s;
EXECUTE fk_stmt;
DEALLOCATE PREPARE fk_stmt;

-- Atualizar registros existentes para um bimestre padrão (ex: Id=1)
UPDATE Boletim 
SET Id_Bimestre = 1 
WHERE Id_Bimestre IS NULL;

-- Tornar a coluna NOT NULL (opcional, após atualização)
ALTER TABLE Boletim MODIFY COLUMN Id_Bimestre INT NOT NULL DEFAULT 1;

-- Descrever as tabelas para confirmar as colunas e constraints
DESCRIBE Atividade;
DESCRIBE Prova;
DESCRIBE Boletim;

-- Verificar constraints de FOREIGN KEY
SELECT 
    TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'ControlHub'
  AND REFERENCED_TABLE_NAME = 'Bimestre'
  AND (TABLE_NAME IN ('Atividade', 'Prova', 'Boletim'));

-- Exemplo de consulta: Listar atividades por bimestre
SELECT 
    a.Id, a.Titulo, b.Nome AS Bimestre, p.Nome AS Professor
FROM Atividade a
JOIN Bimestre b ON a.Id_Bimestre = b.Id
JOIN Professor p ON a.Id_Professor = p.Id
ORDER BY b.Nome, a.Titulo;

-- Exemplo de consulta: Provas por bimestre
SELECT 
    pr.Id, pr.Titulo, b.Nome AS Bimestre, d.Nome AS Disciplina
FROM Prova pr
JOIN Bimestre b ON pr.Id_Bimestre = b.Id
JOIN Disciplina d ON pr.Id_Disciplina = d.Id
ORDER BY b.Nome, pr.Titulo;

-- Exemplo de consulta: Boletim por bimestre
SELECT 
    bo.Id_Aluno, a.Nome AS Aluno, d.Nome AS Disciplina, b.Nome AS Bimestre, bo.MediaFinal, bo.Situacao
FROM Boletim bo
JOIN Aluno a ON bo.Id_Aluno = a.Id
JOIN Disciplina d ON bo.Id_Disciplina = d.Id
JOIN Bimestre b ON bo.Id_Bimestre = b.Id
ORDER BY b.Nome, a.Nome, d.Nome;

 -- -----------------------------------------------------------------------------

USE ControlHub;

-- 1. Verificar colunas atuais da tabela Serie (rode isso primeiro para diagnosticar)
DESCRIBE Serie;

-- Ou consulta mais detalhada (compatível com todas as versões):
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ControlHub' 
  AND TABLE_NAME = 'Serie' 
  AND COLUMN_NAME IN ('CargaHorariaSemanal', 'CargaHorariaAnual', 'NumeroSemanasAno');

-- 2. Bloco procedural para adicionar colunas condicionalmente (compatível com MySQL 5.7+)
DELIMITER $$

-- Procedimento para adicionar coluna se não existir
CREATE PROCEDURE AdicionarColunaSeNaoExiste(
    IN tabela VARCHAR(64),
    IN coluna VARCHAR(64),
    IN definicao VARCHAR(255)
)
BEGIN
    DECLARE coluna_existe INT DEFAULT 0;
    
    -- Verificar se a coluna existe
    SELECT COUNT(*) INTO coluna_existe
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = tabela 
      AND COLUMN_NAME = coluna;
    
    -- Se não existir, adicionar
    IF coluna_existe = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', tabela, ' ADD COLUMN ', coluna, ' ', definicao);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('Coluna "', coluna, '" adicionada com sucesso!') AS Mensagem;
    ELSE
        SELECT CONCAT('Coluna "', coluna, '" já existe. Pulando...') AS Mensagem;
    END IF;
END$$

DELIMITER ;

-- 3. Executar o procedimento para cada coluna (rode um por vez ou todos)
CALL AdicionarColunaSeNaoExiste('Serie', 'CargaHorariaSemanal', 'INT NOT NULL DEFAULT 0 COMMENT "Aulas por semana (ex.: 30)"');
CALL AdicionarColunaSeNaoExiste('Serie', 'CargaHorariaAnual', 'INT NOT NULL DEFAULT 0 COMMENT "Carga total anual (ex.: 1200 horas)"');
CALL AdicionarColunaSeNaoExiste('Serie', 'NumeroSemanasAno', 'INT DEFAULT 40 COMMENT "Semanas no ano letivo (para cálculo automático)"');

-- 4. Dropar o procedimento após uso (opcional, para limpar)
DROP PROCEDURE IF EXISTS AdicionarColunaSeNaoExiste;

-- 5. Continuar com o resto do script original (inserções e triggers)
-- Inserir/atualizar dados de exemplo para séries (agora com as colunas)
UPDATE Serie SET 
    CargaHorariaSemanal = 30, 
    CargaHorariaAnual = 1200, 
    NumeroSemanasAno = 40 
WHERE Nome = '1º Ano';

INSERT IGNORE INTO Serie (Nome, Descricao, CargaHorariaSemanal, CargaHorariaAnual, NumeroSemanasAno) VALUES
('1º Ano', 'Ensino Fundamental - 1ª série', 30, 1200, 40),
('2º Ano', 'Ensino Fundamental - 2ª série', 30, 1200, 40),
('3º Ano', 'Ensino Fundamental - 3ª série', 32, 1280, 40),
('1º Médio', 'Ensino Médio - 1ª série', 35, 1400, 40);

-- Trigger para calcular CargaHorariaAnual automaticamente (compatível)
DELIMITER $$

DROP TRIGGER IF EXISTS trg_Serie_CalcularAnual$$
CREATE TRIGGER trg_Serie_CalcularAnual
AFTER INSERT ON Serie
FOR EACH ROW
BEGIN
    UPDATE Serie 
    SET CargaHorariaAnual = NEW.CargaHorariaSemanal * COALESCE(NEW.NumeroSemanasAno, 40) 
    WHERE Id = NEW.Id;
END$$

DROP TRIGGER IF EXISTS trg_Serie_AtualizarAnual$$
CREATE TRIGGER trg_Serie_AtualizarAnual
AFTER UPDATE ON Serie
FOR EACH ROW
BEGIN
    UPDATE Serie 
    SET CargaHorariaAnual = NEW.CargaHorariaSemanal * COALESCE(NEW.NumeroSemanasAno, 40) 
    WHERE Id = NEW.Id;
END$$

DELIMITER ;

-- Aplicar cálculo para dados existentes
UPDATE Serie SET CargaHorariaAnual = CargaHorariaSemanal * COALESCE(NumeroSemanasAno, 40) 
WHERE CargaHorariaAnual = 0 OR CargaHorariaAnual IS NULL;

-- 7. Verificar o resultado final
DESCRIBE Serie;  -- Deve mostrar: Id, Nome, Descricao, CargaHorariaSemanal, CargaHorariaAnual, NumeroSemanasAno
SELECT * FROM Serie;  -- Deve mostrar as séries com todos os campos preenchidos

-- ----------------------------------------------------------------------------------------
-- 1. DIAGNÓSTICO: Verificar estrutura atual da tabela GradeCurricular
DESCRIBE GradeCurricular;

-- Consulta detalhada de colunas (rode para ver se Id_Disciplina existe)
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ControlHub' AND TABLE_NAME = 'GradeCurricular' 
ORDER BY ORDINAL_POSITION;

-- 2. BACKUP DE DADOS EXISTENTES (se houver, para não perder)
CREATE TABLE IF NOT EXISTS GradeCurricular_Backup AS 
SELECT * FROM GradeCurricular;  -- Backup simples; drope depois se quiser

-- 3. Reutilizar/extender o procedimento para adicionar colunas (compatível)
DELIMITER $$

DROP PROCEDURE IF EXISTS AdicionarColunaSeNaoExiste$$
CREATE PROCEDURE AdicionarColunaSeNaoExiste(
    IN tabela VARCHAR(64),
    IN coluna VARCHAR(64),
    IN definicao VARCHAR(255)
)
BEGIN
    DECLARE coluna_existe INT DEFAULT 0;
    
    SELECT COUNT(*) INTO coluna_existe
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = tabela 
      AND COLUMN_NAME = coluna;
    
    IF coluna_existe = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', tabela, ' ADD COLUMN ', definicao);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('Coluna "', coluna, '" adicionada com sucesso!') AS Mensagem;
    ELSE
        SELECT CONCAT('Coluna "', coluna, '" já existe. Pulando...') AS Mensagem;
    END IF;
END$$

DELIMITER ;

-- 4. Adicionar colunas essenciais se não existirem (para estrutura nova)
-- Primeiro, Id_Disciplina (FK para Disciplina)
CALL AdicionarColunaSeNaoExiste('GradeCurricular', 'Id_Disciplina', 'INT NOT NULL COMMENT "ID da disciplina na grade" AFTER Id_Serie');

-- Adicionar FK para Id_Disciplina (se coluna adicionada)
SET @sql_fk = 'ALTER TABLE GradeCurricular ADD CONSTRAINT FK_GradeCurricular_Disciplina FOREIGN KEY (Id_Disciplina) REFERENCES Disciplina(Id) ON DELETE CASCADE ON UPDATE CASCADE';
PREPARE stmt_fk FROM @sql_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;

-- Adicionar outras colunas da estrutura nova se ausentes (AulasSemanais, etc.)
CALL AdicionarColunaSeNaoExiste('GradeCurricular', 'AulasSemanais', 'INT NOT NULL DEFAULT 0 COMMENT "Aulas por semana para esta disciplina"');
CALL AdicionarColunaSeNaoExiste('GradeCurricular', 'AnoLetivo', 'YEAR NULL COMMENT "Ano de validade da grade"');
CALL AdicionarColunaSeNaoExiste('GradeCurricular', 'Bimestre', 'TINYINT NULL COMMENT "Bimestre da disciplina (1-4, NULL para geral)"');
CALL AdicionarColunaSeNaoExiste('GradeCurricular', 'Situacao', "ENUM('Obrigatória', 'Optativa') DEFAULT 'Obrigatória' COMMENT 'Tipo da disciplina na grade'");

-- 5. Se a tabela ainda não tiver Id_Serie (da estrutura nova), adicionar
CALL AdicionarColunaSeNaoExiste('GradeCurricular', 'Id_Serie', 'INT NOT NULL COMMENT "ID da série na grade"');
-- FK para Serie
SET @sql_serie = 'ALTER TABLE GradeCurricular ADD CONSTRAINT FK_GradeCurricular_Serie FOREIGN KEY (Id_Serie) REFERENCES Serie(Id) ON DELETE CASCADE ON UPDATE CASCADE';
PREPARE stmt_serie FROM @sql_serie;
EXECUTE stmt_serie;
DEALLOCATE PREPARE stmt_serie;

-- 6. Dropar o procedimento após uso
DROP PROCEDURE IF EXISTS AdicionarColunaSeNaoExiste;

-- 7. RECRIAÇÃO OPCIONAL DA TABELA (se estrutura muito velha; comente se não quiser)
-- Isso dropa e recria com estrutura nova, migrando dados básicos se possível
-- DROP TABLE IF EXISTS GradeCurricular;
-- CREATE TABLE GradeCurricular (
--     Id INT PRIMARY KEY AUTO_INCREMENT,
--     Id_Serie INT NOT NULL,
--     Id_Disciplina INT NOT NULL,
--     AulasSemanais INT NOT NULL DEFAULT 0,
--     AnoLetivo YEAR NULL,
--     Bimestre TINYINT NULL,
--     Situacao ENUM('Obrigatória', 'Optativa') DEFAULT 'Obrigatória',
--     Descricao TEXT,
--     FOREIGN KEY (Id_Serie) REFERENCES Serie(Id) ON DELETE CASCADE,
--     FOREIGN KEY (Id_Disciplina) REFERENCES Disciplina(Id) ON DELETE CASCADE,
--     UNIQUE KEY uk_GradeCurricular_Serie_Disciplina (Id_Serie, Id_Disciplina)
-- );

-- Se recriou, migre dados antigos (exemplo: assuma Id_Serie=1 para todos)
-- INSERT INTO GradeCurricular (Id_Serie, Id_Disciplina, AulasSemanais, Descricao)
-- SELECT 1, gd.Id_Disciplina, gd.CargaHoraria / 40, gd.Descricao  -- Ajuste de GradeDisciplina antiga
-- FROM GradeDisciplina gd JOIN GradeCurricular gc ON gd.Id_GradeCurricular = gc.Id;  -- Migração fictícia

-- 8. UPDATE SEGURO: Só executa se Id_Disciplina existir e houver dados
-- Primeiro, verificar se há dados e coluna
SELECT COUNT(*) AS RegistrosExistentes FROM GradeCurricular WHERE Id_Disciplina IS NOT NULL;

-- Se houver, UPDATE (ajuste IDs de disciplinas conforme seus dados reais; ex.: 1=Português, 2=Matemática)
-- Rode manualmente se o SELECT acima retornar >0
UPDATE GradeCurricular 
SET Bimestre = 1, Situacao = 'Obrigatória' 
WHERE Id_Disciplina IN (1, 2) AND Id_Disciplina IS NOT NULL;

UPDATE GradeCurricular 
SET Bimestre = 2, Situacao = 'Obrigatória' 
WHERE Id_Disciplina IN (3, 4) AND Id_Disciplina IS NOT NULL;

UPDATE GradeCurricular 
SET Bimestre = 3, Situacao = 'Optativa' 
WHERE Id_Disciplina = 7 AND Id_Disciplina IS NOT NULL;

-- Se não houver dados em GradeCurricular, insira exemplos (para testar)
-- Assuma Id_Serie=1 ('1º Ano'), Id_Disciplina=1 (Português)
INSERT IGNORE INTO GradeCurricular (Id_Serie, Id_Disciplina, AulasSemanais, Bimestre, Situacao, Descricao) VALUES
(1, 1, 5, 1, 'Obrigatória', 'Português no 1º bimestre'),
(1, 2, 6, 1, 'Obrigatória', 'Matemática no 1º bimestre'),
(1, 3, 4, 2, 'Obrigatória', 'História no 2º bimestre'),
(1, 4, 4, 2, 'Obrigatória', 'Geografia no 2º bimestre'),
(1, 7, 2, 3, 'Optativa', 'Artes no 3º bimestre');

-- 9. Verificar após UPDATE/INSERT
SELECT * FROM GradeCurricular LIMIT 5;  -- Deve mostrar colunas novas e dados com Bimestre/Situacao

-- 10. Continuar com o resto: Tabela de permissões, VIEW, etc. (do script anterior)
-- (Cole aqui o código da tabela PermissoesResponsavelGrade, VIEW vw_GradeParaResponsavel, trigger e teste)
-- Exemplo rápido da VIEW (se já criada, pule)
DROP VIEW IF EXISTS vw_GradeParaResponsavel;
-- ... (o CREATE VIEW completo da resposta anterior)

-- Teste final da VIEW
SELECT * FROM vw_GradeParaResponsavel WHERE Id_Responsavel = 1 LIMIT 5;

DESCRIBE Serie;
ALTER TABLE Serie 
ADD COLUMN Descricao VARCHAR(255) NULL COMMENT 'Descrição da série';

INSERT IGNORE INTO Serie (Nome, Descricao, CargaHorariaSemanal, NumeroSemanasAno)
VALUES
('4º Ano', 'Ensino Fundamental - 4ª série', 33, 40),
('5º Ano', 'Ensino Fundamental - 5ª série', 33, 40),
('2º Médio', 'Ensino Médio - 2ª série', 36, 40);

-- Adicionar a coluna Descricao na tabela Disciplina
ALTER TABLE Disciplina
ADD COLUMN Descricao VARCHAR(255) NULL COMMENT 'Descrição da disciplina';

INSERT IGNORE INTO Disciplina (Nome, Descricao)
VALUES
('Português', 'Língua Portuguesa'),
('Matemática', 'Matemática geral'),
('História', 'História do Brasil'),
('Geografia', 'Geografia do Brasil'),
('Ciências', 'Ciências Naturais'),
('Inglês', 'Língua Inglesa'),
('Artes', 'Atividades artísticas');

DESCRIBE GradeCurricular;
ALTER TABLE GradeCurricular 
ADD COLUMN Id_Serie INT NOT NULL COMMENT 'ID da série na grade';

ALTER TABLE GradeCurricular 
ADD COLUMN Id_Disciplina INT NOT NULL COMMENT 'ID da disciplina na grade';

ALTER TABLE GradeCurricular 
ADD COLUMN AulasSemanais INT NOT NULL DEFAULT 0 COMMENT 'Aulas por semana para esta disciplina';

ALTER TABLE GradeCurricular 
ADD COLUMN Bimestre TINYINT NULL COMMENT 'Bimestre da disciplina (1-4, NULL para geral)';

ALTER TABLE GradeCurricular 
ADD COLUMN Situacao ENUM('Obrigatória','Optativa') DEFAULT 'Obrigatória' COMMENT 'Tipo da disciplina na grade';

ALTER TABLE GradeCurricular 
ADD COLUMN Descricao VARCHAR(255) NULL COMMENT 'Descrição da disciplina na grade';

ALTER TABLE GradeCurricular 
ADD CONSTRAINT FK_GradeCurricular_Serie FOREIGN KEY (Id_Serie) REFERENCES Serie(Id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE GradeCurricular 
ADD CONSTRAINT FK_GradeCurricular_Disciplina FOREIGN KEY (Id_Disciplina) REFERENCES Disciplina(Id) ON DELETE CASCADE ON UPDATE CASCADE;

INSERT IGNORE INTO GradeCurricular (Id_Serie, Id_Disciplina, AulasSemanais, Bimestre, Situacao, Descricao)
VALUES
(1, 1, 5, 1, 'Obrigatória', 'Português no 1º bimestre'),
(1, 2, 6, 1, 'Obrigatória', 'Matemática no 1º bimestre'),
(1, 3, 4, 2, 'Obrigatória', 'História no 2º bimestre'),
(1, 4, 4, 2, 'Obrigatória', 'Geografia no 2º bimestre'),
(1, 7, 2, 3, 'Optativa', 'Artes no 3º bimestre');

DESCRIBE GradeCurricular;
ALTER TABLE GradeCurricular 
ADD COLUMN Id_Serie INT NOT NULL COMMENT 'ID da série na grade';

ALTER TABLE GradeCurricular 
ADD COLUMN Id_Disciplina INT NOT NULL COMMENT 'ID da disciplina na grade';

ALTER TABLE GradeCurricular 
ADD COLUMN AulasSemanais INT NOT NULL DEFAULT 0 COMMENT 'Aulas por semana para esta disciplina';

ALTER TABLE GradeCurricular 
ADD COLUMN Situacao ENUM('Obrigatória','Optativa') DEFAULT 'Obrigatória' COMMENT 'Tipo da disciplina na grade';

ALTER TABLE GradeCurricular 
ADD COLUMN Descricao VARCHAR(255) NULL COMMENT 'Descrição da disciplina na grade';

-- Exemplo para 2º Ano
INSERT IGNORE INTO GradeCurricular (Id_Serie, Id_Disciplina, AulasSemanais, Bimestre, Situacao, Descricao)
VALUES
(1, 1, 5, 1, 'Obrigatória', 'Português no 1º bimestre'),
(1, 2, 6, 1, 'Obrigatória', 'Matemática no 1º bimestre');

USE ControlHub;

-- Ver estrutura detalhada da tabela Prova
DESCRIBE Prova;

-- Verificar colunas específicas via INFORMATION_SCHEMA (mais detalhado)
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT, 
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ControlHub' 
  AND TABLE_NAME = 'Prova' 
  AND COLUMN_NAME IN ('Id_Turma', 'Id_Professor', 'Id_Disciplina', 'Id_Bimestre')
ORDER BY ORDINAL_POSITION;

DELIMITER $$

-- Criar procedimento para adicionar coluna se não existir
DROP PROCEDURE IF EXISTS AdicionarColunaCondicional$$

CREATE PROCEDURE AdicionarColunaCondicional(
    IN tabela_name VARCHAR(64),
    IN coluna_name VARCHAR(64),
    IN definicao VARCHAR(255)
)
BEGIN
    DECLARE coluna_existe INT DEFAULT 0;
    
    -- Verificar se a coluna já existe
    SELECT COUNT(*) INTO coluna_existe
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = tabela_name 
      AND COLUMN_NAME = coluna_name;
    
    -- Se não existir, adicionar a coluna
    IF coluna_existe = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', tabela_name, ' ADD COLUMN ', coluna_name, ' ', definicao);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('Coluna "', coluna_name, '" adicionada com sucesso à tabela ', tabela_name) AS Resultado;
    ELSE
        SELECT CONCAT('Coluna "', coluna_name, '" já existe na tabela ', tabela_name, '. Pulando...') AS Resultado;
    END IF;
END$$

DELIMITER ;

-- Executar para cada coluna necessária na tabela Prova
CALL AdicionarColunaCondicional('Prova', 'Id_Turma', 'INT NOT NULL COMMENT "ID da turma da prova"');
CALL AdicionarColunaCondicional('Prova', 'Id_Professor', 'INT NOT NULL COMMENT "ID do professor responsável"');
CALL AdicionarColunaCondicional('Prova', 'Id_Disciplina', 'INT NOT NULL DEFAULT 1 COMMENT "ID da disciplina da prova"');
CALL AdicionarColunaCondicional('Prova', 'Id_Bimestre', 'INT NOT NULL DEFAULT 1 COMMENT "ID do bimestre da prova"');

-- Dropar o procedimento após uso (opcional, para limpar)
DROP PROCEDURE AdicionarColunaCondicional;

-- Verificar estrutura final
DESCRIBE Prova;

DELIMITER $$

-- Procedimento para adicionar FK se não existir
DROP PROCEDURE IF EXISTS AdicionarFKCondicional$$

CREATE PROCEDURE AdicionarFKCondicional(
    IN tabela_name VARCHAR(64),
    IN constraint_name VARCHAR(64),
    IN coluna_name VARCHAR(64),
    IN tabela_referenciada VARCHAR(64),
    IN coluna_referenciada VARCHAR(64),
    IN acoes VARCHAR(100)  -- ex.: 'ON DELETE CASCADE ON UPDATE CASCADE'
)
BEGIN
    DECLARE fk_existe INT DEFAULT 0;
    
    -- Verificar se a FK já existe
    SELECT COUNT(*) INTO fk_existe
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = tabela_name 
      AND CONSTRAINT_NAME = constraint_name
      AND REFERENCED_TABLE_NAME = tabela_referenciada;
    
    -- Se não existir, adicionar a FK
    IF fk_existe = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', tabela_name, ' ADD CONSTRAINT ', constraint_name, 
                          ' FOREIGN KEY (', coluna_name, ') REFERENCES ', tabela_referenciada, 
                          '(', coluna_referenciada, ') ', acoes);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('FK "', constraint_name, '" adicionada com sucesso à tabela ', tabela_name) AS Resultado;
    ELSE
        SELECT CONCAT('FK "', constraint_name, '" já existe na tabela ', tabela_name, '. Pulando...') AS Resultado;
    END IF;
END$$

DELIMITER ;

-- Executar para cada FK necessária na tabela Prova
CALL AdicionarFKCondicional('Prova', 'FK_Prova_Turma', 'Id_Turma', 'Turma', 'Id', 'ON DELETE CASCADE ON UPDATE CASCADE');
CALL AdicionarFKCondicional('Prova', 'FK_Prova_Professor', 'Id_Professor', 'Professor', 'Id', 'ON DELETE CASCADE ON UPDATE CASCADE');
CALL AdicionarFKCondicional('Prova', 'FK_Prova_Disciplina', 'Id_Disciplina', 'Disciplina', 'Id', 'ON DELETE CASCADE ON UPDATE CASCADE');
CALL AdicionarFKCondicional('Prova', 'FK_Prova_Disciplina', 'Id_Disciplina', 'Disciplina', 'Id', 'ON DELETE CASCADE ON UPDATE CASCADE');

SELECT p.Id, p.Id_Bimestre
FROM Prova p
LEFT JOIN Bimestre b ON p.Id_Bimestre = b.Id
WHERE b.Id IS NULL AND p.Id_Bimestre IS NOT NULL;

ALTER TABLE Prova MODIFY Id_Bimestre INT NULL;


-- Dropar o procedimento
DROP PROCEDURE AdicionarFKCondicional;

-- Verificar FKs adicionadas
SELECT 
    TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'ControlHub'
  AND TABLE_NAME = 'Prova'
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;

SET SQL_SAFE_UPDATES = 0;

UPDATE Prova
SET Id_Disciplina = 1,
    Id_Bimestre = 1
WHERE Id_Disciplina IS NULL OR Id_Bimestre IS NULL;

SET SQL_SAFE_UPDATES = 1;

-- Verificar se há dados (deve mostrar as 12 colunas com valores)
SELECT * FROM Prova LIMIT 5;

-- ======================================
USE ControlHub;

-- Verificar estrutura da tabela Prova (confirme se Id_GradeDisciplina está lá e é NOT NULL)
DESCRIBE Prova;

-- Verificar se há dados existentes na Prova (para não perder)
SELECT COUNT(*) AS TotalProvas FROM Prova;
SELECT * FROM Prova LIMIT 3;  -- Veja se há valores em Id_GradeDisciplina

-- Verificar se a tabela GradeDisciplina existe e tem dados (para fornecer ID válido)
DESCRIBE GradeDisciplina;
SELECT COUNT(*) AS TotalGrades FROM GradeDisciplina;
SELECT Id, Id_GradeCurricular, Id_Disciplina FROM GradeDisciplina LIMIT 5;  -- Veja IDs disponíveis (ex.: 1, 2...)
-- ===========

-- Nota para Prova (Id_Prova=1, aluno 1, turma 1, bimestre 1)
INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Prova, Valor) VALUES (1, 1, 1, 1, 8.50);

-- Nota para Atividade (assuma Id_Atividade=1)
INSERT INTO Nota (Id_Aluno, Id_Turma, Id_Bimestre, Id_Atividade, Valor) VALUES (1, 1, 1, 1, 9.00);

-- Ver notas com professor e turma
SELECT n.Valor, a.Nome AS Aluno, pr.Titulo AS Prova, p.Nome AS Professor, t.Nome AS Turma 
FROM Nota n JOIN Aluno a ON n.Id_Aluno = a.Id 
JOIN Prova pr ON n.Id_Prova = pr.Id 
JOIN Professor p ON pr.Id_Professor = p.Id 
JOIN Turma t ON pr.Id_Turma = t.Id 
WHERE n.Id_Prova IS NOT NULL;

USE ControlHub;

DELIMITER $$

CREATE TRIGGER trg_Aluno_Turma_Unica_Turma_Ativa_BI
BEFORE INSERT ON Aluno_Turma
FOR EACH ROW
BEGIN
    IF NEW.Status = 'Ativo' THEN
        IF EXISTS (
            SELECT 1 FROM Aluno_Turma
            WHERE Id_Aluno = NEW.Id_Aluno
              AND Status = 'Ativo'
        ) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Aluno já está matriculado em uma turma ativa.';
        END IF;
    END IF;
END$$

CREATE TRIGGER trg_Aluno_Turma_Unica_Turma_Ativa_BU
BEFORE UPDATE ON Aluno_Turma
FOR EACH ROW
BEGIN
    IF NEW.Status = 'Ativo' THEN
        IF EXISTS (
            SELECT 1 FROM Aluno_Turma
            WHERE Id_Aluno = NEW.Id_Aluno
              AND Status = 'Ativo'
              AND Id <> OLD.Id
        ) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Aluno já está matriculado em uma turma ativa.';
        END IF;
    END IF;
END$$

DELIMITER ;

-- Variáveis de entrada
SET @Id_Aluno = 1;
SET @Id_Disciplina = 1;
SET @Id_Bimestre = 1;

-- Calcular média ponderada das Atividades
SELECT 
  IFNULL(SUM(n.Valor * pa.Peso) / NULLIF(SUM(pa.Peso), 0), 0) INTO @notaAtividades
FROM Nota n
JOIN Atividade a ON n.Id_Atividade = a.Id
JOIN GradeDisciplina gd ON a.Id_GradeDisciplina = gd.Id
JOIN PesoAvaliacao pa ON pa.Id_GradeDisciplina = gd.Id AND pa.Tipo = 'Atividade' AND pa.Id_Bimestre = a.Id_Bimestre
WHERE n.Id_Aluno = @Id_Aluno AND gd.Id_Disciplina = @Id_Disciplina AND a.Id_Bimestre = @Id_Bimestre;

-- Calcular média ponderada das Provas
SELECT 
  IFNULL(SUM(n.Valor * pa.Peso) / NULLIF(SUM(pa.Peso), 0), 0) INTO @notaProvas
FROM Nota n
JOIN Prova pr ON n.Id_Prova = pr.Id
JOIN GradeDisciplina gd ON pr.Id_GradeDisciplina = gd.Id
JOIN PesoAvaliacao pa ON pa.Id_GradeDisciplina = gd.Id AND pa.Tipo = 'Prova' AND pa.Id_Bimestre = pr.Id_Bimestre
WHERE n.Id_Aluno = @Id_Aluno AND gd.Id_Disciplina = @Id_Disciplina AND pr.Id_Bimestre = @Id_Bimestre;

-- Somar as médias ponderadas
SET @notaFinal = @notaAtividades + @notaProvas;

-- Definir situação
SET @situacao = IF(@notaFinal >= 7, 'Aprovado', IF(@notaFinal >= 5, 'Recuperacao', 'Reprovado'));

-- Atualizar boletim
UPDATE Boletim
SET MediaFinal = @notaFinal,
    Situacao = @situacao
WHERE Id_Aluno = @Id_Aluno AND Id_Disciplina = @Id_Disciplina AND Id_Bimestre = @Id_Bimestre;

SELECT 
    n.Id,
    n.Valor,
    CASE 
        WHEN n.Id_Atividade IS NOT NULL THEN 'Atividade'
        WHEN n.Id_Prova IS NOT NULL THEN 'Prova'
        ELSE 'Desconhecido'
    END AS Tipo,
    COALESCE(a.Titulo, pr.Titulo) AS Titulo,
    n.Id_Bimestre
FROM Nota n
LEFT JOIN Atividade a ON n.Id_Atividade = a.Id
LEFT JOIN Prova pr ON n.Id_Prova = pr.Id
WHERE n.Id_Aluno = @Id_Aluno
  AND (a.Id_Disciplina = @Id_Disciplina OR pr.Id_Disciplina = @Id_Disciplina)
  AND n.Id_Bimestre = @Id_Bimestre;
  
  SELECT 
    b.Id_Aluno,
    a.Nome AS NomeAluno,
    b.Id_Disciplina,
    d.Nome AS NomeDisciplina,
    b.Id_Bimestre,
    bi.Nome AS NomeBimestre,
    b.MediaFinal,
    b.Situacao,
    b.Observacoes
FROM Boletim b
JOIN Aluno a ON b.Id_Aluno = a.Id
JOIN Disciplina d ON b.Id_Disciplina = d.Id
JOIN Bimestre bi ON b.Id_Bimestre = bi.Id
WHERE b.Id_Aluno = @Id_Aluno
ORDER BY b.Id_Bimestre, b.Id_Disciplina;

CREATE OR REPLACE VIEW vw_BoletimCompleto AS
SELECT 
    b.Id_Aluno,
    a.Nome AS NomeAluno,
    b.Id_Disciplina,
    d.Nome AS NomeDisciplina,
    b.Id_Bimestre,
    bi.Nome AS NomeBimestre,
    b.MediaFinal,
    b.Situacao,
    b.Observacoes
FROM Boletim b
JOIN Aluno a ON b.Id_Aluno = a.Id
JOIN Disciplina d ON b.Id_Disciplina = d.Id
JOIN Bimestre bi ON b.Id_Bimestre = bi.Id;

SELECT * FROM vw_BoletimCompleto WHERE Id_Aluno = @Id_Aluno;