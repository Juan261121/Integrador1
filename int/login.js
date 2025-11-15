// Continuação do seu script existente...

// 5. Obter referências para os campos e botões de Ação
const inputCadastroNome = document.getElementById('cadastro-nome');
const inputCadastroEmail = document.getElementById('cadastro-email');
const inputCadastroSenha = document.getElementById('cadastro-senha');
const btnCadastrar = document.getElementById('btn-cadastrar');

const inputLoginEmail = document.getElementById('login-email');
const inputLoginSenha = document.getElementById('login-senha');
const btnLogin = document.getElementById('btn-login');

// --- Funções de Salvar e Validar ---

// 6. Função para Salvar Cadastro no localStorage
function salvarCadastro() {
    const nome = inputCadastroNome.value.trim();
    const email = inputCadastroEmail.value.trim();
    const senha = inputCadastroSenha.value.trim();

    if (nome === '' || email === '' || senha === '') {
        alert('Por favor, preencha todos os campos do cadastro.');
        return;
    }

    // Cria um objeto com os dados do usuário
    const novoUsuario = {
        nome: nome,
        email: email,
        senha: senha // Em um app real, a senha seria HASHED, NUNCA salva em texto simples!
    };

    // Pega a lista de usuários existente (ou cria uma nova se não houver)
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    // Verifica se o email já está cadastrado
    const emailExistente = usuarios.some(u => u.email === email);
    if (emailExistente) {
        alert('Este e-mail já está cadastrado. Tente fazer login.');
        return;
    }

    // Adiciona o novo usuário à lista
    usuarios.push(novoUsuario);

    // Salva a lista atualizada no localStorage, convertendo para JSON
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    alert('Cadastro realizado com sucesso! Agora você pode fazer o login.');
    // Volta para a tela de login após o cadastro
    mostrarLogin(); 
    
    // Limpa os campos após o cadastro
    inputCadastroNome.value = '';
    inputCadastroEmail.value = '';
    inputCadastroSenha.value = '';
}

// 7. Função para Validar Login
function fazerLogin() {
    const emailDigitado = inputLoginEmail.value.trim();
    const senhaDigitada = inputLoginSenha.value.trim();

    if (emailDigitado === '' || senhaDigitada === '') {
        alert('Por favor, preencha o email e a senha.');
        return;
    }

    // Pega a lista de usuários do localStorage
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    // Tenta encontrar um usuário que corresponda ao email E à senha
    const usuarioEncontrado = usuarios.find(usuario => 
        usuario.email === emailDigitado && usuario.senha === senhaDigitada
    );

    if (usuarioEncontrado) {
        alert(`Login realizado com sucesso! Bem-vindo(a), ${usuarioEncontrado.nome}.`);
        // Aqui você faria o redirecionamento para a página principal
        // Exemplo: window.location.href = 'pagina-principal.html';
        
        // Limpa os campos após o login
        inputLoginEmail.value = '';
        inputLoginSenha.value = '';
    } else {
        alert('Credenciais inválidas. Verifique seu e-mail e senha.');
    }
}

// 8. Adicionar eventos de clique aos botões
btnCadastrar.addEventListener('click', salvarCadastro);
btnLogin.addEventListener('click', fazerLogin);