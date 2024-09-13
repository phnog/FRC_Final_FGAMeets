var socketVideo,
  localVideo,
  remoteVideo,
  localStreamVideo,
  peerConnection,
  screenSender;

async function inicializarWebRTC(isCaller, deviceId) {
  localVideo = document.getElementById("localVideo");
  remoteVideo = document.getElementById("remoteVideo");

  localStreamVideo = await navigator.mediaDevices.getUserMedia({
    video: {
      deviceId: deviceId ? { exact: deviceId } : undefined,
    },
    audio: true,
  });
  localVideo.srcObject = localStreamVideo;

  peerConnection = new RTCPeerConnection();

  localStreamVideo.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStreamVideo);
  });

  peerConnection.ontrack = (event) => {
    const stream = event.streams[0];
    // Verifica se é a trilha de vídeo da câmera ou da tela
    if (stream.getVideoTracks().length > 0) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack.label.includes("screen")) {
        document.getElementById("remoteScreenVideo").srcObject = stream;
      } else {
        remoteVideo.srcObject = stream;
      }
    }
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socketVideo.send(JSON.stringify({ ice: event.candidate }));
    }
  };

  if (isCaller) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socketVideo.send(JSON.stringify({ offer: offer }));
  }
  document.getElementById("chatVideo").style.display = "block";
}

function changeAudio() {
  if (!localStreamVideo) return;

  const audioTracks = localStreamVideo.getAudioTracks();
  if (audioTracks.length === 0) return;

  audioTracks[0].enabled = !audioTracks[0].enabled;

  const muteButton = document.getElementById("iconMute");
  if (audioTracks[0].enabled) {
    muteButton.src =
      "https://media.discordapp.net/attachments/805795785219506287/1283956104367308892/icons8-muted-25.png?ex=66e4e0ce&is=66e38f4e&hm=77c739faa9a2b5c22dddace3ac55f33347cfa45d8b2b84a851af3e7e19d1d44f&=&format=webp&quality=lossless";
  } else {
    muteButton.src =
      "https://media.discordapp.net/attachments/805795785219506287/1283957806248235070/icons8-mic-50.png?ex=66e4e263&is=66e390e3&hm=ea8fbb81c0e79c34ac90f3489921a6892a42b15f4c9e9c2aca354fc5cc9ccd5d&=&format=webp&quality=lossless";
  }
}

async function changeCamera() {
  if (!localStreamVideo) return;

  // Obtém a lista de câmeras disponíveis, se ainda não foi obtida
  if (availableCameras.length === 0) {
    availableCameras = await getAvailableCameras();
  }

  // Se não houver mais de uma câmera, não faz nada
  if (availableCameras.length < 2) {
    console.log("Não há câmeras suficientes para alternar.");
    return;
  }

  // Avança para o próximo índice de câmera na lista
  currentCameraIndex = (currentCameraIndex + 1) % availableCameras.length;
  const nextDeviceId = availableCameras[currentCameraIndex].deviceId;

  // Pede permissão para acessar a câmera desejada
  const newStream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: { exact: nextDeviceId } },
    audio: true,
  });

  // Parar o stream de vídeo atual
  if (localStreamVideo) {
    localStreamVideo.getTracks().forEach((track) => track.stop());
  }

  // Atribuir o novo stream ao localStreamVideo e exibir o vídeo
  localStreamVideo = newStream;
  localVideo.srcObject = newStream;

  // Substitui a trilha de vídeo atual na conexão peer-to-peer
  const videoSender = peerConnection
    .getSenders()
    .find((sender) => sender.track.kind === "video");
  videoSender.replaceTrack(newStream.getVideoTracks()[0]);

  // Atualiza o botão de alternância
  const toggleCameraButton = document.getElementById("toggleCameraButton");
  toggleCameraButton.textContent = `Alternar para câmera ${
    currentCameraIndex + 1
  }`;
}
async function getAvailableCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === "videoinput"); // Retorna apenas dispositivos de vídeo (câmeras)
}

let cameraEnabled = true;
let currentCameraIndex = 0;
let availableCameras = [];

async function toggleCamera() {
  if (!localStreamVideo) return;

  if (cameraEnabled) {
    // Desligar a câmera - parar todas as trilhas de vídeo
    localStreamVideo.getTracks().forEach((track) => track.stop());
    cameraEnabled = false;
    document.getElementById("toggleCameraButton").textContent = "Ligar Câmera";
  } else {
    // Ligar a câmera - obter novamente o fluxo de vídeo
    try {
      // Certifique-se de que a lista de câmeras está preenchida
      if (availableCameras.length === 0) {
        availableCameras = await getAvailableCameras();
      }

      // Solicita um novo fluxo da câmera atualmente selecionada
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: availableCameras[currentCameraIndex].deviceId },
        },
        audio: true,
      });

      // Atualiza o stream local
      localStreamVideo = newStream;
      localVideo.srcObject = newStream;

      // Substitui a trilha de vídeo na conexão peer-to-peer
      const videoSender = peerConnection
        .getSenders()
        .find((sender) => sender.track.kind === "video");
      if (videoSender) {
        videoSender.replaceTrack(newStream.getVideoTracks()[0]);
      }

      cameraEnabled = true;
      document.getElementById("toggleCameraButton").textContent =
        "Desligar Câmera";
    } catch (error) {
      console.error("Erro ao ligar a câmera:", error);
    }
  }
}

async function getAvailableCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((device) => device.kind === "videoinput"); // Retorna apenas dispositivos de vídeo (câmeras)
}

async function shareScreen() {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    const screenTrack = screenStream.getVideoTracks()[0];

    // Substituir a trilha de vídeo atual pela trilha de tela
    const sender = peerConnection
      .getSenders()
      .find((s) => s.track.kind === "video");
    sender.replaceTrack(screenTrack);

    // Mostrar a tela localmente
    localVideo.srcObject = screenStream;

    // Quando o usuário parar de compartilhar a tela, restaurar a webcam
    screenTrack.onended = async () => {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const cameraTrack = cameraStream.getVideoTracks()[0];
      sender.replaceTrack(cameraTrack);
      localVideo.srcObject = cameraStream;
    };
  } catch (error) {
    console.error("Erro ao compartilhar tela:", error);
  }
}
