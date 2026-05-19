let usuario = null;
let carrinho = [];
let charts = {};

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('usuario');
  if (saved && getToken()) {
    usuario = JSON.parse(saved);
    entrarApp();
  }

  document.getElementById('form-login').addEventListener('submit', onLogin);
  document.getElementById('btn-logout').addEventListener('click', logout);
  document.querySelectorAll('#menu-nav .nav-link').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navegar(el.dataset.view);
    });
  });
  document.getElementById('form-compra').addEventListener('submit', adicionarItemCarrinho);
  document.getElementById('btn-finalizar-compra').addEventListener('click', finalizarCompra);
  document.getElementById('btn-regenerar-rec').addEventListener('click', carregarRecomendacoes);
});

async function onLogin(e) {
  e.preventDefault();
  const erro = document.getElementById('login-erro');
  erro.classList.add('d-none');
  try {
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    const data = await Api.login(email, senha);
    setToken(data.token);
    usuario = data.usuario;
    localStorage.setItem('usuario', JSON.stringify(usuario));
    entrarApp();
  } catch (err) {
    erro.textContent = err.message;
    erro.classList.remove('d-none');
  }
}

function logout() {
  clearAuth();
  usuario = null;
  location.reload();
}

function entrarApp() {
  document.getElementById('tela-login').classList.add('d-none');
  document.getElementById('app').classList.remove('d-none');
  document.getElementById('nav-usuario').textContent =
    `${usuario.nome} · ${usuario.pontos_totais} pts · ${usuario.nivel?.nome || ''}`;

  const isAdmin = usuario.tipo === 'admin';
  document.querySelectorAll('.admin-only').forEach((el) => el.classList.toggle('d-none', !isAdmin));
  document.querySelectorAll('.cliente-only').forEach((el) => el.classList.toggle('d-none', isAdmin));

  if (isAdmin) {
    document.getElementById('view-dashboard').classList.add('d-none');
    document.getElementById('view-admin-dashboard').classList.remove('d-none');
    carregarAdminDashboard();
  } else {
    carregarDashboardCliente();
  }
}

function navegar(view) {
  document.querySelectorAll('#menu-nav .nav-link').forEach((l) => l.classList.remove('active'));
  document.querySelector(`[data-view="${view}"]`)?.classList.add('active');

  document.querySelectorAll('.view-panel').forEach((p) => p.classList.add('d-none'));
  const map = {
    dashboard: usuario.tipo === 'admin' ? 'view-admin-dashboard' : 'view-dashboard',
    missoes: 'view-missoes',
    recompensas: 'view-recompensas',
    recomendacoes: 'view-recomendacoes',
    compras: 'view-compras',
    'admin-clientes': 'view-admin-clientes',
    'admin-campanhas': 'view-admin-campanhas',
  };
  document.getElementById(map[view])?.classList.remove('d-none');

  const loaders = {
    missoes: carregarMissoes,
    recompensas: carregarRecompensas,
    recomendacoes: carregarRecomendacoes,
    compras: carregarCompras,
    'admin-clientes': carregarAdminClientes,
    'admin-campanhas': carregarAdminCampanhas,
    dashboard: () =>
      usuario.tipo === 'admin' ? carregarAdminDashboard() : carregarDashboardCliente(),
  };
  loaders[view]?.();
}

async function carregarDashboardCliente() {
  try {
    const [perfil, niveis, missoes] = await Promise.all([Api.perfil(), Api.niveis(), Api.missoes()]);

    document.getElementById('cards-metricas').innerHTML = `
      <div class="col-md-4"><div class="card metric-card p-3"><small class="text-muted">Pontos</small><h3>${perfil.pontos_totais}</h3></div></div>
      <div class="col-md-4"><div class="card metric-card p-3"><small class="text-muted">Nível</small><h3><span class="badge badge-nivel" style="background:${perfil.cor_hex}">${perfil.nivel_nome}</span></h3></div></div>
      <div class="col-md-4"><div class="card metric-card p-3"><small class="text-muted">Multiplicador</small><h3>${perfil.multiplicador}x</h3></div></div>`;

    const proximo = niveis.find((n) => n.pontos_minimos > perfil.pontos_totais);
    const atual = niveis.filter((n) => n.pontos_minimos <= perfil.pontos_totais).pop();
    const proxPontos = proximo ? proximo.pontos_minimos : atual.pontos_minimos;
    const pct = proximo
      ? ((perfil.pontos_totais - atual.pontos_minimos) / (proxPontos - atual.pontos_minimos)) * 100
      : 100;

    document.getElementById('nivel-info').innerHTML = `
      <p>Você é <strong style="color:${perfil.cor_hex}">${perfil.nivel_nome}</strong>.
      ${proximo ? `Faltam <strong>${proximo.pontos_minimos - perfil.pontos_totais}</strong> pts para ${proximo.nome}.` : 'Nível máximo!'}</p>
      <div class="progress mb-2"><div class="progress-bar" style="width:${Math.min(pct, 100)}%"></div></div>`;

    const pendentes = missoes.filter((m) => !m.concluida).slice(0, 3);
    document.getElementById('missoes-resumo').innerHTML = pendentes.length
      ? pendentes.map(renderMissaoMini).join('')
      : '<p class="text-muted">Todas as missões concluídas!</p>';

    renderChartNivel(niveis, perfil.pontos_totais);
    usuario.pontos_totais = perfil.pontos_totais;
  } catch (err) {
    console.error(err);
  }
}

function renderMissaoMini(m) {
  return `<div class="mb-2"><strong>${m.titulo}</strong>
    <div class="progress progress-missao"><div class="progress-bar" style="width:${m.percentual || 0}%"></div></div>
    <small>${m.progresso}/${m.meta_valor}</small></div>`;
}

function renderChartNivel(niveis, pontos) {
  const ctx = document.getElementById('chart-nivel');
  if (charts.nivel) charts.nivel.destroy();
  charts.nivel = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: niveis.map((n) => n.nome),
      datasets: [{ data: niveis.map((n) => (pontos >= n.pontos_minimos ? n.pontos_minimos + 1 : 0)), backgroundColor: niveis.map((n) => n.cor_hex) }],
    },
    options: { plugins: { legend: { position: 'bottom' } } },
  });
}

async function carregarMissoes() {
  const missoes = await Api.missoes();
  document.getElementById('lista-missoes').innerHTML = missoes
    .map(
      (m) => `
    <div class="col-md-6">
      <div class="card missao-card ${m.concluida ? 'concluida' : ''} h-100">
        <div class="card-body">
          <h5>${m.titulo} ${m.concluida ? '<i class="bi bi-check-circle-fill text-success"></i>' : ''}</h5>
          <p class="small text-muted">${m.descricao || ''}</p>
          <div class="progress progress-missao mb-2"><div class="progress-bar" style="width:${m.percentual || 0}%"></div></div>
          <span class="badge bg-primary">${m.pontos_recompensa} pts</span>
          <span class="float-end small">${m.progresso} / ${m.meta_valor}</span>
        </div>
      </div>
    </div>`
    )
    .join('');
}

async function carregarRecompensas() {
  const lista = await Api.recompensas();
  document.getElementById('lista-recompensas').innerHTML = lista
    .map(
      (r) => `
    <div class="col-md-4">
      <div class="card h-100">
        <div class="card-body">
          <h5>${r.titulo}</h5>
          <p class="small">${r.descricao || ''}</p>
          <p><strong>${r.custo_pontos}</strong> pontos · Estoque: ${r.estoque}</p>
          <button class="btn btn-sm btn-outline-primary" onclick="resgatarRecompensa(${r.id})">Resgatar</button>
        </div>
      </div>
    </div>`
    )
    .join('');
}

async function resgatarRecompensa(id) {
  try {
    const res = await Api.resgatar(id);
    alert(res.mensagem + ` Restam ${res.pontos_restantes} pts.`);
    carregarRecompensas();
    carregarDashboardCliente();
  } catch (err) {
    alert(err.message);
  }
}

async function carregarRecomendacoes() {
  try {
    await Api.regenerarRec();
  } catch (_) {}
  const lista = await Api.recomendacoes();
  document.getElementById('lista-recomendacoes').innerHTML = lista.length
    ? lista
        .map(
          (o) => `
      <div class="card oferta-card mb-2"><div class="card-body">
        <h5>${o.titulo}</h5><p class="mb-0">${o.descricao}</p>
        <small class="text-muted">${o.categoria || ''} · Score ${o.score}</small>
      </div></div>`
        )
        .join('')
    : '<p class="text-muted">Faça compras para receber ofertas personalizadas.</p>';
}

function adicionarItemCarrinho(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  carrinho.push({
    produto: fd.get('produto'),
    categoria: fd.get('categoria'),
    quantidade: Number(fd.get('quantidade')),
    preco_unit: Number(fd.get('preco_unit')),
  });
  e.target.reset();
  renderCarrinho();
}

function renderCarrinho() {
  const ul = document.getElementById('carrinho-temp');
  ul.innerHTML = carrinho
    .map((i, idx) => `<li class="list-group-item d-flex justify-content-between">
      ${i.produto} (${i.categoria}) x${i.quantidade} — R$ ${(i.quantidade * i.preco_unit).toFixed(2)}
      <button class="btn btn-sm btn-link text-danger" onclick="removerItem(${idx})">×</button></li>`)
    .join('');
  document.getElementById('btn-finalizar-compra').classList.toggle('d-none', !carrinho.length);
}

function removerItem(idx) {
  carrinho.splice(idx, 1);
  renderCarrinho();
}

async function finalizarCompra() {
  try {
    const res = await Api.criarCompra(carrinho);
    alert(`${res.mensagem} +${res.pontos_ganhos} pontos!`);
    carrinho = [];
    renderCarrinho();
    carregarCompras();
    carregarDashboardCliente();
  } catch (err) {
    alert(err.message);
  }
}

async function carregarCompras() {
  const compras = await Api.compras();
  document.getElementById('lista-compras').innerHTML = compras.length
    ? `<div class="table-responsive"><table class="table"><thead><tr><th>Data</th><th>Valor</th><th>Pontos</th></tr></thead><tbody>
      ${compras.map((c) => `<tr><td>${new Date(c.data_compra).toLocaleString('pt-BR')}</td><td>R$ ${Number(c.valor_total).toFixed(2)}</td><td>+${c.pontos_ganhos}</td></tr>`).join('')}
      </tbody></table></div>`
    : '<p class="text-muted">Nenhuma compra registrada.</p>';
}

async function carregarAdminDashboard() {
  const data = await Api.adminDashboard();
  const m = data.metricas;
  document.getElementById('admin-cards').innerHTML = `
    <div class="col-md-3"><div class="card p-3 metric-card"><small>Clientes</small><h4>${m.total_clientes}</h4></div></div>
    <div class="col-md-3"><div class="card p-3 metric-card"><small>Compras</small><h4>${m.total_compras}</h4></div></div>
    <div class="col-md-3"><div class="card p-3 metric-card"><small>Faturamento</small><h4>R$ ${Number(m.faturamento_total).toFixed(0)}</h4></div></div>
    <div class="col-md-3"><div class="card p-3 metric-card"><small>Ticket médio</small><h4>R$ ${Number(m.ticket_medio).toFixed(2)}</h4></div></div>`;

  if (charts.niveisAdmin) charts.niveisAdmin.destroy();
  charts.niveisAdmin = new Chart(document.getElementById('chart-niveis-admin'), {
    type: 'bar',
    data: {
      labels: data.porNivel.map((n) => n.nome),
      datasets: [{ label: 'Clientes', data: data.porNivel.map((n) => n.clientes), backgroundColor: data.porNivel.map((n) => n.cor_hex) }],
    },
  });

  if (charts.faturamento) charts.faturamento.destroy();
  charts.faturamento = new Chart(document.getElementById('chart-faturamento'), {
    type: 'line',
    data: {
      labels: data.comprasMes.map((c) => c.mes),
      datasets: [{ label: 'Faturamento R$', data: data.comprasMes.map((c) => c.valor), borderColor: '#4f46e5', tension: 0.3 }],
    },
  });
}

async function carregarAdminClientes() {
  const clientes = await Api.adminClientes();
  document.querySelector('#tabela-clientes tbody').innerHTML = clientes
    .map(
      (c) => `<tr><td>${c.nome}</td><td>${c.email}</td><td>${c.pontos_totais}</td>
      <td><span class="badge" style="background:${c.cor_hex}">${c.nivel}</span></td></tr>`
    )
    .join('');
}

async function carregarAdminCampanhas() {
  const lista = await Api.adminCampanhas();
  document.getElementById('lista-campanhas').innerHTML = lista
    .map(
      (c) => `<div class="card mb-2"><div class="card-body">
        <h5>${c.titulo} ${c.ativa ? '<span class="badge bg-success">Ativa</span>' : ''}</h5>
        <p>${c.descricao}</p>
        <small>${c.desconto_percentual}% off · ${c.categoria_alvo || 'Geral'} · +${c.pontos_bonus} pts · ${c.data_inicio} a ${c.data_fim}</small>
      </div></div>`
    )
    .join('');
}

window.resgatarRecompensa = resgatarRecompensa;
window.removerItem = removerItem;
