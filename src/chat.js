var socket;
let name,
  nome,
  sala,
  salaAtual,
  maoLevantada = false,
  contadorMaosLevantadas = 0,
  create = 0;

async function iniciarConexaoSala() {
  document.getElementById("criaSala").style.display = "none";
  nome = obterNomeUsuario();
  if (create == 0) {
    if (!nome) return;

    sala = await selecionarSala();
    if (!sala) return;
  }
  console.log(sala);
  finalizarConexaoSala();
  iniciarConexaoSockets(sala);
  configurarEventosSocket();
  modificarInterfaceSala(sala);
}

function obterNomeUsuario() {
  const nomeUsuario = document.getElementById("nome").value;

  if (nomeUsuario === "") {
    alert("Por favor, preencha seu nome.");
    return null;
  }

  return nomeUsuario;
}

async function start() {
  if (document.getElementById("nome").value != "") {
    document.getElementById("telaEscolha").style.display = "none";
    document.getElementById("telaChat").style.display = "block";
  } else alert("Preencha com o seu nome!");
}

async function showSalas() {
  document.getElementById("telaEscolha").style.display = "none";
  document.getElementById("confirma").style.display = "none";
  create = 1;
  exibirSalasParaSelecao();
}

async function createSala() {
  document.getElementById("confirma").style.display = "none";
  document.getElementById("confirmaLabel").style.display = "none";
  document.getElementById("criaSala").style.display = "block";
}

async function selecionarSala() {
  const escolha = prompt("Deseja entrar em uma sala existente? (S/N)");

  if (escolha === "S" || escolha === "s") {
    return await exibirSalasParaSelecao();
  } else if (escolha === "N" || escolha === "n") {
    const nomeSala = prompt("Digite o nome da sala:").trim();
    if (nomeSala === "") {
      alert("Por favor, preencha o nome da sala.");
      return null;
    }
    return nomeSala;
  } else {
    alert("Opção inválida. Por favor, escolha S ou N.");
    return null;
  }
}

async function selecionarSala() {
  const nomeSala = document.getElementById("nomesala").value;
  if (nomeSala === "") {
    alert("Por favor, preencha o nome da sala.");
    return null;
  }
  return nomeSala;
}

function finalizarConexaoSala() {
  if (socket) {
    socket.send(`Saindo da sala ${salaAtual}`);
    socket.close();
  }
}

function iniciarConexaoSockets(sala) {
  // mudei
  salaAtual = sala;
  document.getElementById("loader").style.display = "inline-block";
  socket = new WebSocket(`ws://localhost:3333/${sala}`);
  socketVideo = new WebSocket(`ws://localhost:3335/${sala}`);
}

function configurarEventosSocket() {
  socket.onopen = () => {
    console.log("Conexão aberta");
    socket.send(`'${nome}' entrou na sala '${salaAtual}'`);
    atualizarInterfaceParaChat(
      `'${nome}' entrou na sala '${salaAtual}'`,
      "black"
    );
  };

  socket.onmessage = (event) => interpretarChatMensagem(event.data);
  socket.onclose = () => encerrarSessaoTexto();

  socketVideo.onopen = () => console.log("WebSocket de vídeo conectado");
  socketVideo.onmessage = async (event) =>
    await interpretarVideoMensagem(event);
}

async function interpretarVideoMensagem(event) {
  const data = JSON.parse(event.data);
  if (data.offer) await handleOffer(data.offer);
  else if (data.answer) await handleAnswer(data.answer);
  else if (data.ice)
    peerConnection.addIceCandidate(new RTCIceCandidate(data.ice));
}

function modificarInterfaceSala(sala) {
  document.getElementById("enviar").onclick = comunicarMensagem;
  document.getElementById("salaNome").innerText = sala;
}

function atualizarInterfaceParaChat(mensagem) {
  document.getElementById("telaEscolha").style.display = "none";
  document.getElementById("telaChats").style.display = "block";
  document.getElementById("telaChat").style.display = "block";
  document.getElementById("telaVideo").style.display = "block";
  adicionarMensagem(mensagem);
}

function comunicarMensagem() {
  const mensagem = document.getElementById("mensagem").value;
  socket.send(`${nome}: ${mensagem}`);
  document.getElementById("mensagem").value = "";
  adicionarMensagem(`Você: ${mensagem}`, true);
}

function adicionarMensagem(mensagem, enviadaPorMim = false) {
  const div = document.createElement("div");
  div.textContent = mensagem;
  div.style.color = "black";
  div.className = enviadaPorMim ? "mensagem-enviada" : "mensagem-recebida";
  const chatDiv = document.getElementById("chat");
  chatDiv.appendChild(div);
  chatDiv.scrollTop = chatDiv.scrollHeight;
}
async function handleOffer(offer) {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socketVideo.send(JSON.stringify({ answer }));
}

async function handleAnswer(answer) {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

function encerrarSessaoTexto() {
  atualizarInterfaceParaChat(`Fim de histórico da sala ${salaAtual}`, "black");
  socket = null;
  salaAtual = null;
  document.getElementById("loader").style.display = "none";
}

function desconectarDaSala() {
  if (socket && salaAtual) {
    socket.send(`${nome} saiu da sala ${salaAtual}.`);
    socket.onclose = function () {};
    socket.close();
    var div = document.createElement("div");
    div.textContent = `Fim de histórico da sala ${salaAtual}.`;
    div.style.color = "black" || "red";
    socket = null;
    socketVideo = null;
    salaAtual = null;
    document.getElementById("chat").appendChild(div);
    document.getElementById("loader").style.display = "none";
  }

  document.getElementById("telaEscolha").style.display = "block";
  document.getElementById("telaChat").style.display = "none";
  document.getElementById("telaVideo").style.display = "none";
  document.getElementById("chatVideo").style.display = "none";
}

function exibirSalasParaSelecao() {
  const socket = new WebSocket("ws://localhost:3334");

  const socketOpen = new Promise((resolve) => {
    socket.onopen = () => resolve();
  });

  socketOpen.then(() => {
    socket.send("listar_salas");
  });

  return new Promise((resolve) => {
    socket.onmessage = (event) => {
      const salasDisponiveis = JSON.parse(event.data);
      const listaSalas = document.getElementById("listaSalas");
      listaSalas.innerHTML = "";

      const telaListaSalas = document.getElementById("telaListaSalas");
      const backButton = document.getElementById("backButton");

      salasDisponiveis.forEach((salaList) => {
        const listItem = document.createElement("li");
        listItem.textContent = salaList;
        listItem.style.cursor = "pointer";
        listItem.addEventListener("click", () => {
          socket.close();
          resolve(salaList);
          document.getElementById("telaListaSalas").style.display = "none";
          document.getElementById("confirma").style.display = "none";
          document.getElementById("confirmaLabel").style.display = "none";
          document.getElementById("telaEscolha").style.display = "block";
          sala = salaList;
          iniciarConexaoSala();
        });
        listaSalas.appendChild(listItem);
      });

      if (salasDisponiveis.length > 0) {
        telaListaSalas.style.display = "block";
        document.getElementById("telaEscolha").style.display = "none";
      }
    };
  });
}

function atualizarExibicaoIconeMao(estado) {
  document.getElementById("maoIcon1").style.display = estado
    ? "inline-block"
    : "none";
}

function interpretarChatMensagem(mensagem) {
  const regex = /(.*) (levantou a mão)/;
  const regex2 = /(.*) (abaixou a mão)/;
  const match = mensagem.match(regex);
  const match2 = mensagem.match(regex2);
  const maoIcon1 = document.getElementById("maoIcon1");

  if (mensagem.match(regex)) {
    name = match[1];
    maoIcon1.innerHTML = `🖐️ ${name} quer falar`;
  }

  if (mensagem.match(regex2)) {
    maoIcon1.innerHTML = "";
  }

  if (mensagem.includes("levantou a mão")) {
    console.log("teste nome lenvatou", name);
    atualizarExibicaoIconeMao(true);
  } else if (mensagem.includes("abaixou a mão")) {
    console.log("teste nome abaixou", name);
    atualizarExibicaoIconeMao(false);
  }
  updateMaoIcon(name);
  adicionarMensagem(mensagem);
}

function trocarModoMao() {
  const nomeUsuario = nome;
  const mensagem = `${nomeUsuario} levantou a mão`;
  console.log(mensagem);

  const levantarMaoButton = document.getElementById("levantarMaoButton");

  if (!maoLevantada) {
    maoLevantada = true;
    levantarMaoButton.style.backgroundColor = "purple";
    levantarMaoButton.innerHTML = "Abaixar mão";
    socket.send(mensagem);
    contadorMaosLevantadas++;
  } else {
    maoLevantada = false;
    levantarMaoButton.style.backgroundColor = "";
    levantarMaoButton.innerHTML = "Levantar mão";
    socket.send(`${nomeUsuario} abaixou a mão`);
    contadorMaosLevantadas--;
  }
  updateMaoIcon(null);
}

function updateMaoIcon(nombre) {
  const filterName = nombre;

  if (filterName == null) {
    const maoIcon = document.getElementById("maoIcon");
    maoIcon.innerHTML = `🖐️ ${nome} quer falar`;
    maoIcon.style.display =
      contadorMaosLevantadas > 0 ? "inline-block" : "none";
  }
}
