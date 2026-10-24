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
    function atualizarDatas() {
      var campo = form.querySelector('[data-data-manutencao]');
      if (!campo || !campo.dataset.hoje) return;
      var status = form.querySelector('[name="status"]');
      var registro = form.querySelector('[name="registro"]');
      var atual = status ? status.value : registro && registro.value === 'historico' ? 'Concluída' : 'Agendada';
      campo.removeAttribute('min');
      campo.removeAttribute('max');
      if (atual === 'Agendada') {
        var antigaInalterada = campo.dataset.statusOriginal === 'Agendada' && campo.dataset.dataOriginal === campo.value;
        if (!antigaInalterada) campo.min = campo.dataset.hoje;
      } else {
        campo.max = campo.dataset.hoje;
      }
    }
    atualizarDatas();
    function validar(campo) {
      campo.setCustomValidity('');
      if (campo.required && campo.type === 'text' && !campo.value.trim()) {
        campo.setCustomValidity('Preencha este campo.');
      }
      if (campo.matches('[data-moeda]') && campo.value.trim()) {
        var valor = campo.value.trim().replace(/^R\$\s*/, '');
        var agrupado = /^\d{1,3}(?:\.\d{3})+,\d{1,2}$/.test(valor);
        var decimal = /^\d+(?:[.,]\d{1,2})?$/.test(valor);
        var numero = Number((agrupado ? valor.replace(/\./g, '') : valor).replace(',', '.'));
        if ((!agrupado && !decimal) || !Number.isFinite(numero) || numero > 99999999.99) {
          campo.setCustomValidity('Informe dinheiro como 100,50 ou 1.234,56, até R$ 99.999.999,99.');
        }
      }
      if (campo.type === 'number' && campo.value && !/^-?\d+$/.test(campo.value)) {
        campo.setCustomValidity('Informe um número inteiro, sem letras ou notação científica.');
      }
      var invalido = !campo.checkValidity();
      campo.classList.toggle('campo-erro', invalido);
      campo.setAttribute('aria-invalid', String(invalido));
      return !invalido;
    }
    form.addEventListener('submit', function (evento) {
      atualizarDatas();
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
      atualizarDatas();
      if (evento.target.matches('input, select, textarea')) validar(evento.target);
    });
    form.addEventListener('change', atualizarDatas);
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
