// db.js

const NOME_BANCO = "FamilyChefDB";
const VERSAO_BANCO = 1;
const NOME_TABELA = "receitas";

let db; 

// 1. Iniciar Banco
function iniciarBanco() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(NOME_BANCO, VERSAO_BANCO);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(NOME_TABELA)) {
                db.createObjectStore(NOME_TABELA, { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve("Banco de dados do FamilyChef iniciado com sucesso!");
        };

        request.onerror = (event) => {
            console.error("Erro ao abrir IndexedDB", event.target.error);
            reject(event.target.error);
        };
    });
}

// 2. Adicionar Item
async function adicionarItem(item) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([NOME_TABELA], "readwrite");
        const store = transaction.objectStore(NOME_TABELA);
        const request = store.add(item);

        request.onsuccess = () => resolve("Receita salva com sucesso!");
        request.onerror = (event) => reject(event.target.error);
    });
}

// 3. Buscar Itens
async function buscarItens() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([NOME_TABELA], "readonly");
        const store = transaction.objectStore(NOME_TABELA);
        const request = store.getAll();

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// 4. Deletar Item
async function deletarItem(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([NOME_TABELA], "readwrite");
        const store = transaction.objectStore(NOME_TABELA);
        const request = store.delete(id);

        request.onsuccess = () => resolve("Receita deletada!");
        request.onerror = (event) => reject(event.target.error);
    });
}