import { initState, getState, navigate } from './state.js';
import { renderStudent } from './ui/student.js';
import { renderTeacher } from './ui/teacher.js';

const routes = {
  '#/login': renderLogin,
  '#/aluno': renderStudent,
  '#/prof': renderTeacher
};

async function renderLogin(root){
  const s = getState();
  root.innerHTML = `
    <section class="card">
      <h2>Entrar</h2>
      <div class="grid cols-2">
        <div>
          <div class="label">Time</div>
          <input id="teamName" class="input" placeholder="Ex.: Time A">
        </div>
        <div>
          <div class="label">PIN</div>
          <input id="teamPin" class="input" placeholder="1234">
        </div>
      </div>
      <div style="display:flex;gap:10px;margin-top:12px">
        <button class="btn" id="enterStudent">Entrar como Aluno</button>
        <button class="btn alt" id="enterTeacher">Entrar como Professor</button>
      </div>
      <hr>
      <p class="label">Cenário carregado: <span class="badge">${s.scenario.name}</span> • Rodadas: ${s.scenario.rounds}</p>
    </section>
  `;
  root.querySelector('#enterStudent').onclick = ()=>{
    const team = root.querySelector('#teamName').value || 'Time A';
    const pin = root.querySelector('#teamPin').value || '0000';
    s.session = { role:'student', team, pin };
    navigate('#/aluno');
  };
  root.querySelector('#enterTeacher').onclick = ()=>{
    s.session = { role:'teacher' };
    navigate('#/prof');
  };
}

async function router(){
  const root = document.querySelector('#app');
  const hash = location.hash || '#/login';
  const fn = routes[hash] || renderLogin;
  await initState();
  fn(root);
}
addEventListener('hashchange', router);
addEventListener('DOMContentLoaded', router);
