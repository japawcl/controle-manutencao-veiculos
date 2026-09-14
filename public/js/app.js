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
