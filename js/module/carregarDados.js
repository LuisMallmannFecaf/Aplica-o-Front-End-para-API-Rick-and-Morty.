/**
 * Objetivo: Site estático consumindo API Rick & Morty
 * Data: 28/12/2025
 * Autor: Luís
 * Versão: 5.4 (Final, comentado, sem overlay/spinner)
 */

/* ===================== Estrutura Base =====================
   Cria a estrutura principal do site: <main> com <section id="cardPersonagens">
   onde os cards dos personagens serão inseridos dinamicamente.
*/
const criarEstruturaBase = () => {
    const main = document.createElement('main');       // Cria main
    const section = document.createElement('section'); // Cria section
    section.id = 'cardPersonagens';                        // ID usado para inserir cards
    main.appendChild(section);                          // Adiciona section ao main
    document.body.appendChild(main);                   // Adiciona main ao body
};

/* ===================== Utilitário =====================
   Função que retorna um valor seguro. Se o valor for null ou undefined, retorna '-'.
*/
const safe = (value) => value ? value : '-';

/* ===================== Criar Cards =====================
   Recebe os dados da API e cria dinamicamente os cards com informações
   do personagem: nome, imagem, status, espécie, tipo, gênero, origem, localização.
*/
const criarCards = (characters) => {
    const container = document.getElementById('cardPersonagens');
    container.innerHTML = ''; // Limpa cards antigos

    // Caso não existam resultados
    if (!characters.results.length) {
        container.innerHTML = '<p class="erro">Nenhum personagem encontrado.</p>';
        return;
    }

    const fragment = document.createDocumentFragment(); // Fragmento para otimizar inserção

    characters.results.forEach(({ name, status, image, species, type, gender, origin, location }) => {
        const statusIcon = status === 'Alive' ? '❤️' : status === 'Dead' ? '☠️' : '❓';

        const card = document.createElement('div');
        card.className = 'card-character';
        card.innerHTML = `
            <h2 class="name-character">${name}</h2>
            <figure class="card_image">
                <img src="${image}" alt="${name}">
            </figure>
            <div class="info-character">
                <span class="status ${status?.toLowerCase() || 'unknown'}">
                    <strong>Status:</strong> ${statusIcon} ${safe(status)}
                </span>
                <span><strong>🧬 Espécie:</strong> ${safe(species)}</span>
                <span><strong>⚙️ Tipo:</strong> ${safe(type)}</span>
                <span><strong>👤 Gênero:</strong> ${safe(gender)}</span>
                <span><strong>🌍 Origem:</strong> ${safe(origin?.name)}</span>
                <span><strong>📍 Localização:</strong> ${safe(location?.name)}</span>
            </div>
        `;
        fragment.appendChild(card); // Adiciona card ao fragmento
    });

    container.appendChild(fragment); // Insere todos os cards de uma vez
};

/* ===================== Paginação =====================
   Módulo que controla a paginação dos resultados da API.
   Possui botões de "Anterior" e "Próxima" e exibe a página atual.
*/
const Paginacao = (() => {
    let paginaAtual = 1, totalPaginas = 1;
    let btnPrev, btnNext, spanPagina;

    // Cria os elementos de paginação e adiciona ao DOM
    const criar = () => {
        const div = document.createElement('div');
        div.className = 'paginacao';

        btnPrev = document.createElement('button');
        btnPrev.className = 'btn-paginacao';
        btnPrev.innerText = 'Anterior';
        btnPrev.onclick = () => paginaAtual > 1 && atualizar(paginaAtual - 1);

        btnNext = document.createElement('button');
        btnNext.className = 'btn-paginacao';
        btnNext.innerText = 'Próxima';
        btnNext.onclick = () => paginaAtual < totalPaginas && atualizar(paginaAtual + 1);

        spanPagina = document.createElement('span');
        spanPagina.className = 'pagina-info';

        div.append(btnPrev, spanPagina, btnNext);
        document.body.appendChild(div);
    };

    // Atualiza a página atual, chama a API e rola a página para o topo
    const atualizar = (novaPagina) => {
        paginaAtual = novaPagina;
        getCharactersAPI(paginaAtual);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Define o total de páginas e atualiza botões e texto
    const setTotalPaginas = (total) => {
        totalPaginas = total;
        atualizarBotoes();
        atualizarInfo();
    };

    // Ativa/desativa botões conforme a página atual
    const atualizarBotoes = () => {
        btnPrev.disabled = paginaAtual === 1;
        btnNext.disabled = paginaAtual === totalPaginas;
    };

    // Atualiza texto informando página atual
    const atualizarInfo = () => {
        spanPagina.innerText = `Página ${paginaAtual} de ${totalPaginas}`;
    };

    return { criar, atualizar, setTotalPaginas };
})();

/* ===================== Cache =====================
   Armazena resultados da API por página para evitar requisições repetidas.
*/
const cacheAPI = {};

/* ===================== Fetch =====================
   Função que consome a API Rick & Morty usando fetch 
   Cria os cards e atualiza a paginação. 
   Usa cache para otimizar requisições.
*/
const getCharactersAPI = (page = 1) => {
    if (cacheAPI[page]) {
        criarCards(cacheAPI[page]);
        Paginacao.setTotalPaginas(cacheAPI[page].info.pages);
        return;
    }

    fetch(`https://rickandmortyapi.com/api/character?page=${page}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json(); // Converte resposta em JSON
        })
        .then(data => {
            cacheAPI[page] = data;              // Salva no cache
            criarCards(data);                   // Cria os cards
            Paginacao.setTotalPaginas(data.info.pages); // Atualiza paginação
        })
        .catch(error => {
            console.error('Erro ao buscar personagens:', error);
            const container = document.getElementById('cardPersonagens');
            container.innerHTML = '<p class="erro">Falha ao carregar os personagens. Tente novamente.</p>';
        });
};

/* ===================== Inicialização =====================
   Funções executadas quando a página carrega:
   - Cria a estrutura do site
   - Cria a paginação
   - Chama a API para carregar a primeira página
*/
window.addEventListener('load', () => {
    criarEstruturaBase();
    Paginacao.criar();
    getCharactersAPI();
});
