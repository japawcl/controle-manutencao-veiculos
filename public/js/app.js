document.addEventListener('DOMContentLoaded', function () {
  var tabela = document.querySelector('.tabela');
  if (!tabela) return;

  var caixa = document.createElement('div');
  caixa.className = 'filtro';
  caixa.innerHTML =
    '<label for="busca" class="apoio">Filtrar por qualquer palavra da tabela</label>' +
    '<input id="busca" type="search" placeholder="óleo, freio, Fiat...">';
  tabela.parentNode.insertBefore(caixa, tabela);

  var linhas = Array.prototype.slice.call(tabela.querySelectorAll('tbody tr'));

  document.getElementById('busca').addEventListener('input', function (evento) {
    var termo = evento.target.value.toLowerCase().trim();
    linhas.forEach(function (linha) {
      var texto = linha.textContent.toLowerCase();
      linha.style.display = texto.indexOf(termo) > -1 ? '' : 'none';
    });
  });
});


document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('form[data-validar]').forEach(function (form) {
    // O servidor valida novamente; estas mensagens só antecipam o feedback.
    form.noValidate = true;
    var aviso = document.createElement('p');
    aviso.className = 'mensagem-erro';
    aviso.setAttribute('role', 'alert');
    form.prepend(aviso);
    function validar(campo) {
      campo.setCustomValidity('');
      if (campo.required && campo.type === 'text' && !campo.value.trim()) {
        campo.setCustomValidity('Preencha este campo.');
      }
      var invalido = !campo.checkValidity();
      campo.classList.toggle('campo-erro', invalido);
      campo.setAttribute('aria-invalid', String(invalido));
      return !invalido;
    }
    form.addEventListener('submit', function (evento) {
      var campos = Array.from(form.querySelectorAll('input, select, textarea'));
      var invalidos = campos.filter(function (campo) { return !validar(campo); });
      aviso.textContent = invalidos.length ? 'Revise os campos destacados antes de salvar.' : '';
      if (invalidos.length) {
        evento.preventDefault();
        invalidos[0].focus();
        invalidos[0].reportValidity();
      }
    });
    form.addEventListener('input', function (evento) {
      if (evento.target.matches('input, select, textarea')) validar(evento.target);
    });
  });
  document.querySelectorAll('form[data-confirmar]').forEach(function (form) {
    form.addEventListener('submit', function (evento) {
      if (!confirm(form.dataset.confirmar)) evento.preventDefault();
    });
  });
  document.querySelectorAll('textarea[maxlength]').forEach(function (campo) {
    var contador = document.createElement('small');
    contador.className = 'apoio contador';
    campo.after(contador);
    function atualizar() { contador.textContent = campo.value.length + '/' + campo.maxLength + ' caracteres'; }
    campo.addEventListener('input', atualizar);
    atualizar();
  });
});
