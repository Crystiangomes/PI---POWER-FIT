// ── FORMULÁRIO DE CONTATO ─────────────────────────────

const form = document.getElementById("formContato");

if (form) {

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const nome = document.getElementById("nome").value.trim();

        const email = document.getElementById("email").value.trim();

        const mensagem = document.getElementById("mensagem").value.trim();

        // VALIDAÇÃO

        if (!nome || !email || !mensagem) {

            mostrarToast("❌ Preencha todos os campos.");

            return;
        }

        const novaMensagem = {
            nome,
            email,
            mensagem
        };

        try {

            const resposta = await fetch("http://localhost:3000/mensagem", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(novaMensagem)

            });

            const dados = await resposta.text();

            mostrarToast("✅ Mensagem enviada com sucesso!");

            console.log(dados);

            form.reset();

        } catch (erro) {

            console.error(erro);

            mostrarToast("❌ Erro ao enviar mensagem.");

        }

    });

}