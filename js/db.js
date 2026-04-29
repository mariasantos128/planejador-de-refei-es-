// db.js

const NOME_BANCO = "SaborSemanalDB";
const VERSAO_BANCO = 2; // Mudamos para 2 para forçar a criação da tabela de usuários
const TABELA_RECEITAS = "receitas";
const TABELA_USUARIOS = "usuarios"; // Nossa nova tabela!

let db; 

// 1. Iniciar Banco
function iniciarBanco() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(NOME_BANCO, VERSAO_BANCO);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            
            // Cria a tabela de Receitas (se não existir)
            if (!db.objectStoreNames.contains(TABELA_RECEITAS)) {
                db.createObjectStore(TABELA_RECEITAS, { keyPath: "id", autoIncrement: true });
            }
            
            // Cria a tabela de Usuários (se não existir)
            if (!db.objectStoreNames.contains(TABELA_USUARIOS)) {
                db.createObjectStore(TABELA_USUARIOS, { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve("Banco de dados do Sabor Semanal iniciado com sucesso!");
            
            // Se estivermos na página de usuários, já carrega a lista
            if (typeof carregarUsuarios === "function") {
                carregarUsuarios();
            }
        };

        request.onerror = (event) => {
            console.error("Erro ao abrir IndexedDB", event.target.error);
            reject(event.target.error);
        };
    });
}

// ==========================================
// MÓDULO: RECEITAS (Mantido do seu original)
// ==========================================
async function adicionarItem(item) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([TABELA_RECEITAS], "readwrite");
        const store = transaction.objectStore(TABELA_RECEITAS);
        const request = store.add(item);

        request.onsuccess = () => resolve("Receita salva com sucesso!");
        request.onerror = (event) => reject(event.target.error);
    });
}

async function buscarItens() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([TABELA_RECEITAS], "readonly");
        const store = transaction.objectStore(TABELA_RECEITAS);
        const request = store.getAll();

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

async function deletarItem(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([TABELA_RECEITAS], "readwrite");
        const store = transaction.objectStore(TABELA_RECEITAS);
        const request = store.delete(id);

        request.onsuccess = () => resolve("Receita deletada!");
        request.onerror = (event) => reject(event.target.error);
    });
}

// ==========================================
// MÓDULO: USUÁRIOS (Novas funções solicitadas pelo controller)
// ==========================================
async function adicionarUsuario(usuario) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([TABELA_USUARIOS], "readwrite");
        const store = transaction.objectStore(TABELA_USUARIOS);
        const request = store.add(usuario);

        request.onsuccess = () => resolve("Usuário salvo!");
        request.onerror = (event) => reject(event.target.error);
    });
}

async function buscarUsuarios() {
    return new Promise((resolve, reject) => {
        if (!db) { resolve([]); return; } // Proteção caso o banco não tenha carregado
        
        const transaction = db.transaction([TABELA_USUARIOS], "readonly");
        const store = transaction.objectStore(TABELA_USUARIOS);
        const request = store.getAll();

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// A função chamada pelo botão de remover no seu controller.js
async function removerUsuario(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([TABELA_USUARIOS], "readwrite");
        const store = transaction.objectStore(TABELA_USUARIOS);
        const request = store.delete(id);

        request.onsuccess = () => {
            // Atualiza a lista na tela logo após excluir o usuário
            if (typeof carregarUsuarios === "function") {
                carregarUsuarios();
            }
            resolve("Usuário deletado!");
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

// Inicializa o banco de dados assim que o arquivo db.js for lido
iniciarBanco();