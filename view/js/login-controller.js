function mostrarCadastro() {
    document.getElementById('box-login').style.display = 'none';
    document.getElementById('box-cadastro').style.display = 'block';
}

function mostrarLogin() {
    document.getElementById('box-cadastro').style.display = 'none';
    document.getElementById('box-login').style.display = 'block';
}

function entrarComoConvidado() {
    const usuario = { 
        nome: 'Convidado', 
        email: 'convidado@teste.com',
        tipo: 'visitante',
        restricoes: [] 
    };
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
    alert("Entrando como convidado...");
    
    window.location.href = '/view/html/dashboard.html';
}

// LÓGICA DE LOGIN (Protegida com IF)
const formLogin = document.getElementById('form-login');
if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        
        // Tenta buscar se esse usuário existe no sistema (simulação ou banco)
        const nomeExtraido = email.split('@')[0];
        
        const usuario = {
            nome: nomeExtraido.charAt(0).toUpperCase() + nomeExtraido.slice(1), 
            email: email,
            restricoes: []
        };

        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
        alert("Login realizado!");
        
        window.location.href = '/view/html/dashboard.html';
    });
}

// LÓGICA DE CADASTRO (Protegida com IF)
const formCadastro = document.getElementById('form-cadastro');
if (formCadastro) {
    formCadastro.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('cad-nome').value;
        const email = document.getElementById('cad-email').value;
        
        // Captura as restrições marcadas no cadastro
        const checkboxes = document.querySelectorAll('.restricao:checked');
        const restricoes = Array.from(checkboxes).map(cb => cb.value);

        // Cria o objeto do usuário
        const novoUsuario = {
            nome: nome,
            email: email,
            restricoes: restricoes
        };

        // Salva no localStorage para simular que a conta foi criada e está ativa
        localStorage.setItem('usuarioLogado', JSON.stringify(novoUsuario));
        
        alert("Conta criada com sucesso! Redirecionando...");
        
        window.location.href = '/view/html/dashboard.html';
    });
}