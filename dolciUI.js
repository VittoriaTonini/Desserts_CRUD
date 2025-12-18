const API_BASE = 'http://localhost:3000';

// logica del frontend
const form = document.getElementById('form');
const lista = document.getElementById('lista');

const idInput = document.getElementById('id');
const nameInput = document.getElementById('name');
const descriptionInput = document.getElementById('description');
const imageInput = document.getElementById('image');

// GET
function caricaDolci() {
  fetch(`${API_BASE}/api/dolci`)
    .then(res => {
      if (!res.ok) throw new Error('Errore HTTP ' + res.status);
      return res.json();
    })
    .then(data => {
      lista.innerHTML = '';

      data.data.forEach(dolce => {
        const div = document.createElement('div');

        div.innerHTML = `
          <h3>${dolce.name}</h3>
          <p>${dolce.description || ''}</p>
          ${dolce.image ? `<img src="${API_BASE}/images/${dolce.image}" width="150">` : ''}
          <br>
          <button onclick="modificaDolce(${dolce.id})">Modifica</button>
          <button onclick="eliminaDolce(${dolce.id})">Elimina</button>
          <hr>
        `;

        lista.appendChild(div);
      });
    })
    .catch(err => console.error(err));
}

form.addEventListener('submit', e => {
  e.preventDefault();

  const dolce = {
    name: nameInput.value,
    description: descriptionInput.value,
    image: imageInput.value
  };

  // POST
  if (!idInput.value) {
    fetch(`${API_BASE}/api/dolci`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dolce)
    }).then(() => caricaDolci());
  }
  // PUT
  else {
    fetch(`${API_BASE}/api/dolci/${idInput.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dolce)
    }).then(() => caricaDolci());
  }

  form.reset();
  idInput.value = '';
});

// GET by id
function modificaDolce(id) {
  fetch(`${API_BASE}/api/dolci/${id}`)
    .then(res => res.json())
    .then(data => {
      const d = data.data;
      idInput.value = d.id;
      nameInput.value = d.name;
      descriptionInput.value = d.description;
      imageInput.value = d.image;
    });
}

// DELETE
function eliminaDolce(id) {
  if (!confirm('Sei sicuro?')) return;

  fetch(`${API_BASE}/api/dolci/${id}`, {
    method: 'DELETE'
  }).then(() => caricaDolci());
}

caricaDolci();