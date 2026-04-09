const botoesSecao = Array.from(document.querySelectorAll('.botao-secao'));
const secoesAnimais = Array.from(document.querySelectorAll('.secao-animal'));
const containersCards = Object.fromEntries(
    Array.from(document.querySelectorAll('[data-cards-container]')).map((container) => [container.dataset.cardsContainer, container])
);
const containersPaginacao = Object.fromEntries(
    Array.from(document.querySelectorAll('[data-pagination]')).map((container) => [container.dataset.pagination, container])
);
const consultaMobile = window.matchMedia('(max-width: 768px)');
const consultaMedia = window.matchMedia('(min-width: 769px) and (max-width: 1024px)');
function obterCardsPorPagina() {
    return (consultaMobile.matches || consultaMedia.matches) ? 8 : 9;
}
const paginaAtualPorSecao = {
    cachorros: 1,
    gatos: 1,
    cavalos: 1
};

function subirSuavementeParaSecao(secao) {
    const elementoSecao = document.getElementById(secao);

    if (!elementoSecao) {
        return;
    }

    const topoDaSecao = elementoSecao.getBoundingClientRect().top + window.scrollY - 16;

    window.scrollTo({
        top: topoDaSecao,
        behavior: 'smooth'
    });
}

function criarCardAnimal(animal) {
    const partesDetalhes = animal.detalhes.split('|').map((parte) => parte.trim());
    const detalhesFormatados = partesDetalhes.map((parte, indice) => {
        const separador = indice < partesDetalhes.length - 1 ? '<span class="detalhe-separador"> | </span>' : '';
        return `<span class="detalhe-item">${parte}</span>${separador}`;
    }).join('');

    return `
        <article class="card-animal">
            <img src="${animal.imagem}" alt="${animal.alt}">
            <div class="card-conteudo">
                <h3>${animal.nome}</h3>
                <p>${detalhesFormatados}</p>
                <p>${animal.infos}</p>
            </div>
            <a href="${animal.pagina}">Quero adotar</a>
        </article>
    `;
}

function criarMensagemSemAnimais() {
    return `
        <div class="mensagem-sem-animais">
            <span class="patinhas" aria-hidden="true">🐾</span>
            <span>Não existem animais cadastrados no momento</span>
        </div>
    `;
}

function renderizarPaginacao(secao) {
    const paginacao = containersPaginacao[secao];
    const totalPaginas = Math.ceil(animaisPorSecao[secao].length / obterCardsPorPagina());

    if (!paginacao) {
        return;
    }

    if (totalPaginas <= 1) {
        paginacao.innerHTML = '';
        paginacao.classList.add('vazia');
        return;
    }

    paginacao.classList.remove('vazia');
    paginacao.innerHTML = Array.from({ length: totalPaginas }, (_, indice) => {
        const numeroPagina = indice + 1;
        const classeAtiva = numeroPagina === paginaAtualPorSecao[secao] ? ' ativo' : '';

        return `<button type="button" class="botao-pagina${classeAtiva}" data-page="${numeroPagina}" data-section="${secao}">${numeroPagina}</button>`;
    }).join('');

    paginacao.querySelectorAll('.botao-pagina').forEach((botao) => {
        botao.addEventListener('click', () => {
            paginaAtualPorSecao[secao] = Number(botao.dataset.page);
            renderizarSecao(secao);
            subirSuavementeParaSecao(secao);
        });
    });
}

function renderizarSecao(secao) {
    const container = containersCards[secao];
    const paginaAtual = paginaAtualPorSecao[secao];
    const inicio = (paginaAtual - 1) * obterCardsPorPagina();
    const fim = inicio + obterCardsPorPagina();
    const animaisDaSecao = animaisPorSecao[secao];
    const animaisVisiveis = animaisDaSecao.slice(inicio, fim);

    if (!container) {
        return;
    }

    if (animaisDaSecao.length === 0) {
        container.innerHTML = criarMensagemSemAnimais();
        renderizarPaginacao(secao);
        return;
    }

    container.innerHTML = animaisVisiveis.map(criarCardAnimal).join('');
    renderizarPaginacao(secao);
}

function mostrarSecao(nomeSecao) {
    secoesAnimais.forEach((secao) => {
        const estaAtiva = secao.id === nomeSecao;
        secao.classList.toggle('secao-oculta', !estaAtiva);
        secao.classList.toggle('secao-visivel', estaAtiva);
    });

    botoesSecao.forEach((botao) => {
        const estaAtivo = botao.dataset.section === nomeSecao;
        botao.classList.toggle('ativo', estaAtivo);
        botao.setAttribute('aria-current', estaAtivo ? 'page' : 'false');
    });
}

botoesSecao.forEach((botao) => {
    botao.addEventListener('click', () => {
        mostrarSecao(botao.dataset.section);
    });
});

Object.keys(animaisPorSecao).forEach((secao) => {
    renderizarSecao(secao);
});

mostrarSecao('cachorros');

function rerenderizarTudo() {
    Object.keys(animaisPorSecao).forEach((secao) => {
        paginaAtualPorSecao[secao] = 1;
        renderizarSecao(secao);
    });
}

consultaMobile.addEventListener('change', rerenderizarTudo);
consultaMedia.addEventListener('change', rerenderizarTudo);