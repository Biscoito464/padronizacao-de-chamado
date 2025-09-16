let templates = {};

// Carregar JSON com os templates
fetch("templates.json")
  .then(res => res.json())
  .then(data => {
    templates = data;
  })
  .catch(err => console.error("Erro ao carregar templates.json", err));

function abrirFormulario(tipoChamado) {
  const conteudo = document.getElementById("conteudo");
  const config = templates[tipoChamado];

  if (!config) {
    conteudo.innerHTML = "<p>⚠️ Template não encontrado.</p>";
    return;
  }

  // Construir formulário dinamicamente
  let formHtml = `<h2>${config.titulo}</h2><form id="formRelatorio">`;
  config.campos.forEach(campo => {
    formHtml += `
      <label>${campo.label}:</label>
      <input type="text" id="${campo.id}" required>
    `;
  });
  formHtml += `<button type="submit">Gerar Relatório</button></form>
    <div class="resultado" id="resultado"></div>
    <button id="baixarBtn" style="display:none;">Baixar Relatório</button>`;

  conteudo.innerHTML = formHtml;

  // Lógica do submit
  document.getElementById("formRelatorio").addEventListener("submit", function(e) {
    e.preventDefault();

    // Substituir variáveis no template
    let output = config.template;
    config.campos.forEach(campo => {
      const value = document.getElementById(campo.id).value;
      output = output.replace(`{{${campo.id}}}`, value);
    });

    document.getElementById("resultado").innerText = output;

    // Ativar botão de download
    const btn = document.getElementById("baixarBtn");
    btn.style.display = "inline-block";
    btn.onclick = () => baixarArquivo(output, tipoChamado);
  });
}

function baixarArquivo(conteudo, prefixo) {
  const blob = new Blob([conteudo], { type: "text/plain" });
  const link = document.createElement("a");
  const data = new Date();
  const nomeArquivo = `${prefixo}_${data.getFullYear()}${String(data.getMonth()+1).padStart(2,"0")}${String(data.getDate()).padStart(2,"0")}_${String(data.getHours()).padStart(2,"0")}${String(data.getMinutes()).padStart(2,"0")}${String(data.getSeconds()).padStart(2,"0")}.txt`;
  link.href = URL.createObjectURL(blob);
  link.download = nomeArquivo;
  link.click();
}
