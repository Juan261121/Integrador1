// ====== VARIÁVEIS E ELEMENTOS ======
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

const contadorCarrinho = document.getElementById('contador-carrinho');
const listaCarrinho = document.getElementById('lista-carrinho');
const totalCarrinho = document.getElementById('total-carrinho');
const botoesAdicionar = document.querySelectorAll('.adicionar-carrinho');

// ====== CARREGAR PRODUTOS DINAMICAMENTE ======
async function carregarProdutos() {
    try {
        const resposta = await fetch('produtos.json');
        const produtos = await resposta.json();
        const container = document.getElementById('produtos');
        container.innerHTML = '';

        produtos.forEach(produto => {
            const div = document.createElement('div');
            div.classList.add('produto');
            div.dataset.id = produto.id;
            div.dataset.nome = produto.nome;
            div.dataset.preco = produto.preco;

            div.innerHTML = `
                <img src="${produto.img}" alt="${produto.nome}">
                <h3>${produto.nome}</h3>
                <p>Preço: R$ ${produto.preco.toFixed(2)}</p>
                <button class="adicionar-carrinho">Adicionar ao Carrinho</button>
            `;
            container.appendChild(div);
        });

        // Recarregar eventos dos botões após carregar produtos
        adicionarEventosBotoes();
    } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
    }
}

// ====== REATRIBUIR EVENTOS APÓS O CARREGAMENTO (AGORA SEM CHECAGEM DE LOGIN) ======
function adicionarEventosBotoes() {
    const botoesAdicionar = document.querySelectorAll('.adicionar-carrinho');
    botoesAdicionar.forEach(botao => {
        botao.addEventListener('click', (event) => {
            const produtoElemento = event.target.closest('.produto');
            const produto = {
                id: produtoElemento.dataset.id,
                nome: produtoElemento.dataset.nome,
                preco: parseFloat(produtoElemento.dataset.preco)
            };
            // Adiciona ao carrinho DIRETAMENTE
            adicionarAoCarrinho(produto); 
        });
    });
}

// Chama o carregamento dos produtos ao iniciar
carregarProdutos();

// ====== LOGIN E CADASTRO ======
let usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado')) || null;

function atualizarUsuarioUI() {
    const nomeSpan = document.getElementById('usuario-logado');
    const btnSair = document.getElementById('btn-sair');
    const authSection = document.getElementById('auth');

    if (usuarioLogado) {
        nomeSpan.textContent = `👤 Olá, ${usuarioLogado.nome}`;
        btnSair.style.display = 'inline';
        authSection.style.display = 'none';
    } else {
        nomeSpan.textContent = '';
        btnSair.style.display = 'none';
        authSection.style.display = 'block';
    }
}

// Cadastro
document.getElementById('btn-cadastrar').addEventListener('click', () => {
    const nome = document.getElementById('cadastro-nome').value.trim();
    const email = document.getElementById('cadastro-email').value.trim();
    const senha = document.getElementById('cadastro-senha').value.trim();

    if (!nome || !email || !senha) return alert('Preencha todos os campos.', 'erro');

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    if (usuarios.find(u => u.email === email)) {
        alert('Esse email já está cadastrado!', 'erro');
        return;
    }

    usuarios.push({ nome, email, senha });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    alert('Cadastro realizado com sucesso!', 'sucesso');
    document.getElementById('link-login').click();
});

// Login
document.getElementById('btn-login').addEventListener('click', () => {
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value.trim();

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (!usuario) return alert('Email ou senha incorretos!', 'erro');

    usuarioLogado = usuario;
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    atualizarUsuarioUI();
    alert(`Bem-vindo, ${usuario.nome}!`, 'sucesso');
});

// Logout
document.getElementById('btn-sair').addEventListener('click', () => {
    localStorage.removeItem('usuarioLogado');
    usuarioLogado = null;
    atualizarUsuarioUI();
});

// Alternar entre login e cadastro
document.getElementById('link-cadastro').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('cadastro-section').style.display = 'block';
});

document.getElementById('link-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('cadastro-section').style.display = 'none';
});

// Inicializa (Mantido, mas ajustado o lugar da chamada final)

// ====== PAINEL ADMINISTRATIVO ======
function atualizarPainelAdmin() {
    const painel = document.getElementById('painel-admin');
    // const listaAdmin = document.getElementById('lista-admin-produtos'); // Não usada diretamente aqui

    // Mostrar painel apenas se o admin estiver logado
    if (usuarioLogado && usuarioLogado.email === 'admin@loja.com') {
        painel.style.display = 'block';
        carregarListaAdmin();
    } else {
        painel.style.display = 'none';
    }
}

async function carregarListaAdmin() {
    // Tenta carregar do localStorage primeiro, se não existir, usa o fetch (em um cenário real, você usaria apenas o fetch)
    const produtosLocal = JSON.parse(localStorage.getItem('produtos'));
    let produtos = [];

    if (produtosLocal) {
        produtos = produtosLocal;
    } else {
        const resposta = await fetch('produtos.json');
        produtos = await resposta.json();
    }
    
    const listaAdmin = document.getElementById('lista-admin-produtos');
    listaAdmin.innerHTML = '';

    produtos.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${p.nome} - R$ ${p.preco.toFixed(2)}</span>
            <button data-id="${p.id}">Remover</button>
        `;
        listaAdmin.appendChild(li);
    });

    // Eventos de remover
    listaAdmin.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', e => removerProdutoAdmin(e.target.dataset.id));
    });
}

// Adicionar produto
document.getElementById('btn-adicionar-produto').addEventListener('click', async () => {
    const nome = document.getElementById('produto-nome').value.trim();
    const preco = parseFloat(document.getElementById('produto-preco').value.trim());
    const img = document.getElementById('produto-img').value.trim();

    if (!nome || !preco || !img) return alert('Preencha todos os campos!', 'erro');

    // Tenta carregar do localStorage primeiro
    const produtosLocal = JSON.parse(localStorage.getItem('produtos'));
    let produtos = [];
    if (produtosLocal) {
        produtos = produtosLocal;
    } else {
        // Se não existir no local, carrega do JSON para obter a base
        const resposta = await fetch('produtos.json');
        produtos = await resposta.json();
    }

    const novoProduto = {
        id: (productos.length + 1).toString(),
        nome,
        preco,
        img
    };
    produtos.push(novoProduto);

    // Atualiza localmente (não salva no arquivo real, pois estamos no front-end)
    localStorage.setItem('produtos', JSON.stringify(produtos));
    alert('Produto adicionado com sucesso (salvo localmente)!', 'sucesso');
    carregarListaAdmin();
    carregarProdutos(); // Recarrega os produtos na vitrine
});

// Remover produto (local)
function removerProdutoAdmin(id) {
    const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
    const novos = produtos.filter(p => p.id !== id);
    localStorage.setItem('produtos', JSON.stringify(novos));
    alert('Produto removido com sucesso!', 'sucesso');
    carregarListaAdmin();
    carregarProdutos(); // Recarrega os produtos na vitrine
}

// ====== FUNÇÃO PARA SALVAR LOCALMENTE ======
function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}


// ====== ADICIONAR PRODUTO ======
function adicionarAoCarrinho(produto) {
    const itemExistente = carrinho.find(item => item.id === produto.id);

    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: 1
        });
    }

    salvarCarrinho();
    atualizarCarrinho();
    alert(`${produto.nome} adicionado ao carrinho!`, 'sucesso');
}


// ====== REMOVER PRODUTO ======
function removerDoCarrinho(id) {
    carrinho = carrinho.filter(item => item.id !== id);
    salvarCarrinho();
    atualizarCarrinho();
}


// ====== ATUALIZAR CARRINHO ======
function atualizarCarrinho() {
    listaCarrinho.innerHTML = '';
    let total = 0;
    let totalItens = 0;

    if (carrinho.length === 0) {
        listaCarrinho.innerHTML = '<li class="mensagem-vazio">Seu carrinho está vazio.</li>';
    } else {
        carrinho.forEach(item => {
            const li = document.createElement('li');
            const subtotal = item.preco * item.quantidade;
            li.innerHTML = `
                <span>${item.nome} (${item.quantidade}x) - R$ ${subtotal.toFixed(2)}</span>
                <div>
                    <button class="menos" data-id="${item.id}">-</button>
                    <button class="mais" data-id="${item.id}">+</button>
                    <button class="remover" data-id="${item.id}">🗑️</button>
                </div>
            `;
            listaCarrinho.appendChild(li);

            total += subtotal;
            totalItens += item.quantidade;
        });
    }

    contadorCarrinho.textContent = totalItens;
    totalCarrinho.textContent = total.toFixed(2);

    // Eventos dos botões dentro do carrinho
    document.querySelectorAll('.menos').forEach(btn => {
        btn.addEventListener('click', e => diminuirQuantidade(e.target.dataset.id));
    });
    document.querySelectorAll('.mais').forEach(btn => {
        btn.addEventListener('click', e => aumentarQuantidade(e.target.dataset.id));
    });
    document.querySelectorAll('.remover').forEach(btn => {
        btn.addEventListener('click', e => removerDoCarrinho(e.target.dataset.id));
    });
}


// ====== ALTERAR QUANTIDADE ======
function diminuirQuantidade(id) {
    const item = carrinho.find(p => p.id === id);
    if (item) {
        item.quantidade -= 1;
        if (item.quantidade <= 0) removerDoCarrinho(id);
    }
    salvarCarrinho();
    atualizarCarrinho();
}

function aumentarQuantidade(id) {
    const item = carrinho.find(p => p.id === id);
    if (item) {
        item.quantidade += 1;
    }
    salvarCarrinho();
    atualizarCarrinho();
}


// ====== EVENTOS DOS BOTÕES DE PRODUTO (NÃO É MAIS NECESSÁRIO AQUI POR CAUSA DA carregarProdutos) ======
/* REMOVIDO:
botoesAdicionar.forEach(botao => {
    botao.addEventListener('click', (event) => {
        const produtoElemento = event.target.closest('.produto');
        const produto = {
            id: produtoElemento.dataset.id,
            nome: produtoElemento.dataset.nome,
            preco: parseFloat(produtoElemento.dataset.preco)
        };
        adicionarAoCarrinho(produto);
    });
});
*/

// Atualiza UI sempre que o login muda (mantido, mas agora garante que o painel admin também atualiza)
const antigoAtualizarUI = atualizarUsuarioUI;
atualizarUsuarioUI = function() {
    antigoAtualizarUI();
    atualizarPainelAdmin();
};


// ====== INICIALIZA FINAL ======
atualizarCarrinho(); // Carrega carrinho
atualizarUsuarioUI(); // Carrega status de login e ajusta a UI

// ===== ALERTA PERSONALIZADO =====
function mostrarAlerta(msg, tipo = 'info') {
    const alerta = document.getElementById('alerta');
    alerta.textContent = msg;
    alerta.className = 'alerta mostrar';
    if (tipo === 'erro') alerta.style.background = '#dc3545';
    if (tipo === 'sucesso') alerta.style.background = '#28a745';
    setTimeout(() => alerta.classList.remove('mostrar'), 2500);
}

// Substitui alert() em todo o código
window.alert = (msg, tipo = 'info') => mostrarAlerta(msg, tipo);

// ===== MODO ESCURO / CLARO =====
const btnTema = document.getElementById('btn-toggle-tema');
btnTema.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    btnTema.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// ===== MODAL DO CARRINHO =====
const modalCarrinho = document.getElementById('modal-carrinho');
document.getElementById('abrir-carrinho').addEventListener('click', () => {
    modalCarrinho.style.display = 'flex';
});
document.getElementById('fechar-carrinho').addEventListener('click', () => {
    modalCarrinho.style.display = 'none';
});
window.addEventListener('click', (e) => {
    if (e.target === modalCarrinho) modalCarrinho.style.display = 'none';
});
// ===== MODAL DE CHECKOUT =====
const modalCheckout = document.getElementById('modal-checkout');
const btnFinalizar = document.getElementById('btn-finalizar');
const fecharCheckout = document.getElementById('fechar-checkout');

// Abre o checkout
btnFinalizar.addEventListener('click', () => {
    // ⚠️ Importante: Verifica o login no Checkout, não na adição ao carrinho!
    if (!usuarioLogado) {
        alert('Você precisa estar logado para finalizar a compra!', 'erro');
        // Você pode também forçar a abertura da seção de login/cadastro aqui:
        // document.getElementById('abrir-auth').click(); 
        return;
    }
    
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!', 'info');
        return;
    }

    const resumo = document.getElementById('resumo-pedido');
    const lista = carrinho.map(item => `
        <li>${item.nome} (${item.quantidade}x) <strong>R$ ${(item.preco * item.quantidade).toFixed(2)}</strong></li>
    `).join('');

    const total = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

    resumo.innerHTML = `
        <h3>Resumo do Pedido</h3>
        <ul>${lista}</ul>
        <p>Total: R$ ${total.toFixed(2)}</p>
    `;

    // Pré-preenche o campo de nome do checkout com o nome do usuário logado
    document.getElementById('checkout-nome').value = usuarioLogado.nome;

    modalCheckout.style.display = 'flex';
});

// Fecha o checkout
fecharCheckout.addEventListener('click', () => {
    modalCheckout.style.display = 'none';
});
window.addEventListener('click', e => {
    if (e.target === modalCheckout) modalCheckout.style.display = 'none';
});

// ===== FINALIZAR COMPRA =====
document.getElementById('form-checkout').addEventListener('submit', (e) => {
    e.preventDefault();

    // Uma nova checagem de login, caso o usuário tenha deslogado
    if (!usuarioLogado) {
        alert('Erro de sessão. Faça login novamente.', 'erro');
        return;
    }

    const nome = document.getElementById('checkout-nome').value.trim();
    const endereco = document.getElementById('checkout-endereco').value.trim();
    const cidade = document.getElementById('checkout-cidade').value.trim();
    const cep = document.getElementById('checkout-cep').value.trim();

    if (!nome || !endereco || !cidade || !cep) {
        alert('Preencha todos os campos!', 'erro');
        return;
    }

    // Limpa o carrinho e salva
    carrinho = [];
    salvarCarrinho();
    atualizarCarrinho();

    modalCheckout.style.display = 'none';
    modalCarrinho.style.display = 'none';
    mostrarAlerta('✅ Compra finalizada com sucesso! Obrigado, ' + nome + '!', 'sucesso');
});