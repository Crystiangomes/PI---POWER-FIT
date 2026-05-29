/* ============================================================
   POWERFIT SUPLEMENTOS — SCRIPT PRINCIPAL
   ============================================================ */

// ── UTILITÁRIOS ──────────────────────────────────────────────

/**
 * Exibe uma notificação toast temporária.
 * @param {string} msg   Mensagem a exibir
 * @param {number} tempo Duração em ms (padrão 3000)
 */
function mostrarToast(msg, tempo = 3000) {
    const toast = document.getElementById('toast');

    if (!toast) return;

    toast.textContent = msg;

    toast.classList.add('show');

    setTimeout(() => toast.classList.remove('show'), tempo);
}

// ── BUSCA DINÂMICA DE PRODUTOS ─────────────────────────────

let produtosLista = [];

async function carregarProdutos() {

    const container = document.getElementById("lista-produtos");

    if (!container) return;

    try {

        const resposta = await fetch("../data/script.json");

        if (!resposta.ok) {
            throw new Error("Erro ao carregar produtos");
        }

        const dados = await resposta.json();

        produtosLista = dados.produtos;

        renderizarProdutos(produtosLista);

    } catch (erro) {

        console.error("Erro ao carregar produtos:", erro);

    }
}

function renderizarProdutos(produtos) {

    const container = document.getElementById("lista-produtos");

    if (!container) return;

    container.innerHTML = produtos.map(produto => `
        <div class="produto-card" data-categoria="${produto.categoria}">
            <img src="${produto.imagem}" alt="${produto.nome}">
            <h3>${produto.nome}</h3>
            <p>${formatarBRL(produto.preco)}</p>

            <button onclick="adicionarCarrinho('${produto.nome}', ${produto.preco})">
                🛒 Adicionar
            </button>
        </div>
    `).join('');
}

function initBuscaProdutos() {

    const input = document.getElementById("pesquisaProduto");

    if (!input) return;

    input.addEventListener("input", () => {

        const termo = input.value.toLowerCase();

        const filtrados = produtosLista.filter(produto =>
            produto.nome.toLowerCase().includes(termo)
        );

        renderizarProdutos(filtrados);

    });
}

carregarProdutos();


// 

// ── CARRINHO (localStorage) ──────────────────────────────────

function getCarrinho() {

    try {

        return JSON.parse(localStorage.getItem('pf_carrinho')) || [];

    } catch {

        return [];

    }
}

function salvarCarrinho(carrinho) {

    localStorage.setItem('pf_carrinho', JSON.stringify(carrinho));

}

function adicionarCarrinho(nome, preco) {

    const carrinho = getCarrinho();

    const idx = carrinho.findIndex(p => p.nome === nome);

    if (idx > -1) {

        carrinho[idx].qtd += 1;

    } else {

        carrinho.push({
            nome,
            preco,
            qtd: 1
        });
    }

    salvarCarrinho(carrinho);

    atualizarBadge();

    mostrarToast(`✅ "${nome}" adicionado ao carrinho!`);
}

function removerDoCarrinho(nome) {

    let carrinho = getCarrinho();

    carrinho = carrinho.filter(p => p.nome !== nome);

    salvarCarrinho(carrinho);

    renderizarCarrinho();

    atualizarBadge();

    mostrarToast(`🗑️ "${nome}" removido do carrinho.`);
}

function alterarQtd(nome, delta) {

    let carrinho = getCarrinho();

    const idx = carrinho.findIndex(p => p.nome === nome);

    if (idx < 0) return;

    carrinho[idx].qtd += delta;

    if (carrinho[idx].qtd <= 0) {

        carrinho.splice(idx, 1);

    }

    salvarCarrinho(carrinho);

    renderizarCarrinho();

    atualizarBadge();
}

function atualizarBadge() {

    const badges = document.querySelectorAll('#badgeContador');

    const total = getCarrinho().reduce((s, p) => s + p.qtd, 0);

    badges.forEach(b => {

        b.textContent = total;

        b.style.display = total > 0 ? 'flex' : 'none';

    });
}

function formatarBRL(valor) {

    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

}

function renderizarCarrinho() {

    const lista = document.getElementById('lista-carrinho');

    const resumoEl = document.getElementById('carrinho-resumo');

    const vazioEl = document.getElementById('carrinho-vazio');

    const subtotalEl = document.getElementById('resumo-subtotal');

    const totalEl = document.getElementById('resumo-total');

    if (!lista) return;

    const carrinho = getCarrinho();

    if (carrinho.length === 0) {

        lista.innerHTML = '';

        if (vazioEl) vazioEl.style.display = 'block';

        if (resumoEl) resumoEl.style.display = 'none';

        return;
    }

    if (vazioEl) vazioEl.style.display = 'none';

    if (resumoEl) resumoEl.style.display = 'block';

    let subtotal = 0;

    lista.innerHTML = carrinho.map(item => {

        const total = item.preco * item.qtd;

        subtotal += total;

        return `
        <div class="produto-item">
            <img class="produto-imagem" src="../imagens/whey.jpg" alt="${item.nome}">

            <div class="produto-info">

                <h3 class="produto-titulo">${item.nome}</h3>

                <p class="produto-descricao">
                    Suplemento esportivo PowerFit de alta qualidade.
                </p>

                <div class="produto-quantidade">

                    <button onclick="alterarQtd('${item.nome}', -1)">
                        −
                    </button>

                    <span class="produto-quantidade-numero">
                        ${item.qtd}
                    </span>

                    <button onclick="alterarQtd('${item.nome}', 1)">
                        +
                    </button>

                </div>
            </div>

            <div>

                <p class="produto-valor">
                    ${formatarBRL(total)}
                </p>

                <p style="font-size:12px;color:var(--cinza-texto);text-align:right;">
                    ${formatarBRL(item.preco)} / un.
                </p>

                <button
                    class="produto-botao-remover"
                    onclick="removerDoCarrinho('${item.nome}')"
                >
                    🗑️ Remover
                </button>

            </div>
        </div>
        `;
    }).join('');

    if (subtotalEl) subtotalEl.textContent = formatarBRL(subtotal);

    if (totalEl) totalEl.textContent = formatarBRL(subtotal);
}

function finalizarCompra() {

    const carrinho = getCarrinho();

    if (carrinho.length === 0) {

        mostrarToast('❌ Seu carrinho está vazio!');

        return;
    }

    localStorage.removeItem('pf_carrinho');

    atualizarBadge();

    renderizarCarrinho();

    mostrarToast(
        '🎉 Pedido realizado com sucesso! Obrigado pela preferência.',
        4000
    );
}

// ── MENU MOBILE ─────────────────────────────────────────────

function initMenuToggle() {

    const toggle = document.getElementById('menuToggle');

    const menu = document.getElementById('menu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {

        menu.classList.toggle('aberto');

        const aberto = menu.classList.contains('aberto');

        toggle.setAttribute('aria-expanded', aberto);

    });

    menu.querySelectorAll('a').forEach(link => {

        link.addEventListener('click', () => {

            menu.classList.remove('aberto');

        });

    });
}

// ── FILTROS ─────────────────────────────────────────────

function initFiltros() {

    const btns = document.querySelectorAll('.filtro-btn');

    const cards = document.querySelectorAll('.produto-card[data-categoria]');

    if (!btns.length) return;

    btns.forEach(btn => {

        btn.addEventListener('click', () => {

            btns.forEach(b => b.classList.remove('ativo'));

            btn.classList.add('ativo');

            const filtro = btn.dataset.filtro;

            cards.forEach(card => {

                if (
                    filtro === 'todos' ||
                    card.dataset.categoria === filtro
                ) {

                    card.style.display = 'flex';

                } else {

                    card.style.display = 'none';

                }
            });
        });
    });
}

// ── FORMULÁRIO DE RECEITAS ─────────────────────────────

function initFormReceita() {

    const form = document.getElementById('formReceita');

    if (!form) return;

    form.addEventListener('submit', e => {

        e.preventDefault();

        const nome =
            document.getElementById('nomeReceita').value.trim();

        const autor =
            document.getElementById('autorReceita').value.trim();

        const ingredientes =
            document.getElementById('ingredientesReceita').value.trim();

        const preparo =
            document.getElementById('preparoReceita').value.trim();

        if (!nome || !autor || !ingredientes || !preparo) {

            mostrarToast(
                '❌ Por favor, preencha todos os campos obrigatórios.'
            );

            return;
        }

        const container =
            document.getElementById('receitas-dinamicas') ||
            document.getElementById('lista-receitas');

        if (container) {

            const card = document.createElement('div');

            card.className = 'receita-card';

            card.innerHTML = `
                <h3>🍽️ ${nome}</h3>

                <p><strong>Por:</strong> ${autor}</p>

                <p style="margin-top:8px;">
                    <strong>Ingredientes:</strong> ${ingredientes}
                </p>

                <p style="margin-top:6px;">
                    <strong>Preparo:</strong> ${preparo}
                </p>
            `;

            container.appendChild(card);
        }

        form.reset();

        mostrarToast('✅ Receita publicada com sucesso!');
    });
}

// ── LOGIN / CADASTRO ─────────────────────────────────────
// ── LOGIN / CADASTRO ─────────────────────────────────────

function initFormsAuth() {

    const formLogin = document.getElementById('formLogin');

    const formRegistro = document.getElementById('formRegistro');

    // ==========================
    // LOGIN
    // ==========================

    if (formLogin) {

        formLogin.addEventListener('submit', async (e) => {

            e.preventDefault();

            const email =
                document.getElementById('emailLogin')?.value.trim();

            const senha =
                document.getElementById('senhaLogin')?.value;

            if (!email || !senha) {

                mostrarToast('❌ Preencha e-mail e senha.');

                return;
            }

            try {

                const resposta = await fetch('http://localhost:3000/login', {

                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        email,
                        senha
                    })
                });

                const dados = await resposta.json();

                mostrarToast(dados.mensagem);

                if (dados.sucesso) {

                    localStorage.setItem(
                        'usuarioLogado',
                        email
                    );

                    setTimeout(() => {

                        window.location.href =
                            '../pages/produtos.html';

                    }, 1500);
                }

            } catch (erro) {

                console.log(erro);

                mostrarToast('❌ Erro ao fazer login.');
            }
        });
    }


    // ==========================
    // CADASTRO
    // ==========================

    if (formRegistro) {

        formRegistro.addEventListener('submit', async (e) => {

            e.preventDefault();

            const nome =
                document.getElementById('nomeNovo')?.value.trim();

            const email =
                document.getElementById('emailNovo')?.value.trim();

            const senha =
                document.getElementById('senhaNova')?.value;

            const confirm =
                document.getElementById('senhaConfirm')?.value;

            if (!nome || !email || !senha || !confirm) {

                mostrarToast('❌ Preencha todos os campos.');

                return;
            }

            if (senha !== confirm) {

                mostrarToast('❌ As senhas não coincidem.');

                return;
            }

            if (senha.length < 8) {

                mostrarToast(
                    '❌ A senha deve ter no mínimo 8 caracteres.'
                );

                return;
            }

            try {

                const resposta = await fetch('http://localhost:3000/cadastro', {

                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        nome,
                        email,
                        senha
                    })
                });

                const dados = await resposta.json();

                mostrarToast(dados.mensagem);

                if (resposta.ok) {

                    setTimeout(() => {

                        formRegistro.reset();

                    }, 1500);
                }

            } catch (erro) {

                console.log(erro);

                mostrarToast('❌ Erro ao cadastrar.');
            }
        });
    }
}

// ── INICIALIZAÇÃO ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

    atualizarBadge();

    initMenuToggle();

    initFiltros();

    initFormReceita();

    initFormsAuth();

    renderizarCarrinho();

    carregarProdutos();

    initBuscaProdutos();

});