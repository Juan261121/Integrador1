
let carrinho = [];


const contadorCarrinho = document.getElementById('contador-carrinho');
const listaCarrinho = document.getElementById('lista-carrinho');
const totalCarrinho = document.getElementById('total-carrinho');
const botoesAdicionar = document.querySelectorAll('.adicionar-carrinho');


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

    atualizarCarrinho(); 
}

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
                ${item.nome} (${item.quantidade}x) - R$ ${(subtotal).toFixed(2)}
            `;
            listaCarrinho.appendChild(li);

            total += subtotal;
            totalItens += item.quantidade;
        });
    }

    contadorCarrinho.textContent = totalItens;

    totalCarrinho.textContent = total.toFixed(2);
}

botoesAdicionar.forEach(botao => {
    botao.addEventListener('click', (event) => {
        const produtoElemento = event.target.closest('.produto');

  
        const produto = {
            id: produtoElemento.dataset.id,
            nome: produtoElemento.dataset.nome,
            preco: parseFloat(produtoElemento.dataset.preco)
        };
        
        adicionarAoCarrinho(produto);
        alert(`${produto.nome} adicionado ao carrinho!`);
    });
});

// Inicializa o carrinho ao carregar a página
atualizarCarrinho();