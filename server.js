/*
============================================================
1 PARTE - CONFIGURACAO DO SERVIDOR
============================================================
*/

require("dotenv").config(); // carrega as variáveis do .env

const pool = require("./db.js"); // conexão com banco

// IMPORTA O EXPRESS
const express = require("express");

// IMPORTA O CORS
const cors = require("cors");

// CRIA O SERVIDOR
const app = express();

// LIBERA O CORS
app.use(cors());

// PERMITE RECEBER JSON
app.use(express.json());

/*
============================================================
TESTE DE CONEXÃO COM O BANCO
============================================================
*/

pool.getConnection()
    .then(() => {
        console.log("✅ Banco conectado com sucesso!");
    })
    .catch((erro) => {
        console.error("❌ Erro ao conectar no banco:");
        console.error(erro);
    });

/*
============================================================
ROTAS
============================================================
*/

// ROTA PARA RECEBER MENSAGENS

app.post("/mensagem", async (req, res) => {

    try {

        // DADOS VINDOS DO FORM

        const nome = req.body.nome;
        const email = req.body.email;
        const mensagem = req.body.mensagem;

        // VALIDAÇÃO

        if (!nome || !email || !mensagem) {

            return res.status(400).json({
                mensagem: "Preencha todos os campos"
            });

        }

        // SALVA NO BANCO

        await pool.execute(

            "INSERT INTO tb_mensagem (nome, email, mensagem) VALUES (?, ?, ?)",

            [nome, email, mensagem]

        );

        // RESPOSTA

        return res.status(201).json({
            mensagem: "Mensagem enviada com sucesso!"
        });

    } catch (error) {

        console.error("❌ Erro no servidor:");
        console.error(error);

        return res.status(500).json({
            mensagem: "Erro no servidor"
        });

    }

});

/*
============================================================
INICIA O SERVIDOR
============================================================
*/

app.listen(3000, () => {

    console.log("🚀 Servidor rodando em http://localhost:3000");

});


// ==========================
// CADASTRO DE USUÁRIO
// ==========================

app.post("/cadastro", async (req, res) => {

    try {

        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {

            return res.status(400).json({
                mensagem: "Preencha todos os campos."
            });
        }

        await pool.execute(

            `INSERT INTO tb_usuarios (nome, email, senha)
             VALUES (?, ?, ?)`,

            [nome, email, senha]

        );

        return res.status(201).json({
            mensagem: "Cadastro realizado com sucesso!"
        });

    } catch (erro) {

        // EMAIL DUPLICADO
        if (erro.code === "ER_DUP_ENTRY") {

            return res.status(400).json({
                mensagem: "E-mail já cadastrado."
            });
        }

        // OUTROS ERROS
        console.log(erro);

        return res.status(500).json({
            mensagem: "Erro ao cadastrar usuário."
        });
    }
});


// ==========================
// LOGIN
// ==========================

app.post("/login", async (req, res) => {

    try {

        const { email, senha } = req.body;

        const [usuarios] = await pool.execute(

            `SELECT * FROM tb_usuarios
             WHERE email = ? AND senha = ?`,

            [email, senha]

        );

        if (usuarios.length > 0) {

            return res.json({
                sucesso: true,
                mensagem: "Login realizado com sucesso!"
            });

        } else {

            return res.status(401).json({
                sucesso: false,
                mensagem: "E-mail ou senha inválidos."
            });
        }

    } catch (erro) {

        console.log(erro);

        return res.status(500).json({
            mensagem: "Erro no servidor."
        });
    }
});