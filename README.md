# Projeto WebRTC e WebSocket

Este projeto permite comunicação em tempo real entre dois usuários via WebRTC (para vídeo e compartilhamento de tela) e WebSockets (para chat em grupo). A aplicação é dividida em duas partes principais:
- Cliente: gerencia a interface do usuário, a captura de vídeo, alternância de câmeras e compartilhamento de tela.
- Servidor: gerencia a comunicação via WebSockets para chat e vídeo.

## Funcionalidades
- **Chat em grupo**: Envie mensagens para todos os membros da sala.
- **Chamada de vídeo**: Comunicação de vídeo em tempo real entre dois usuários.
- **Compartilhamento de tela**: Compartilhe sua tela com outros usuários.
- **Alternância de câmeras**: Alterne entre múltiplas câmeras (se disponíveis).
- **Controle de áudio e vídeo**: Silencie o microfone ou desligue a câmera durante a chamada.

## Demonstração da aplicação 
- [Youtube](https://youtu.be/7cLSSfWBGHA)
- [GoogleDrive](https://drive.google.com/drive/folders/1rZlOLwlRr9bbd1CxPubnz81eIugvuflO?usp=sharing)

## Requisitos

- **Node.js** (versão 14 ou superior)
- **Python** (para o servidor WebSocket)
- **Browser** que suporte WebRTC (Chrome, Firefox, Edge, etc.)

## Configuração e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/seuusuario/seuprojeto.git
cd seuprojeto
```

### 2. Rodar o Servidor WebSocket

Este projeto usa Python com a biblioteca websockets para gerenciar a comunicação via WebSocket.

Instale a biblioteca websockets (se necessário):

```bash
pip install websockets
```
Execute o servidor WebSocket:
```bash
python server.py
```

O servidor estará disponível nas seguintes portas:
- Chat: ws://localhost:3333
- Listagem de salas: ws://localhost:3334
- Vídeo: ws://localhost:3335

### 3 Abra o Cliente no Navegador
Abra o arquivo HTML do cliente no navegador para iniciar a aplicação de chat e vídeo. Certifique-se de que o navegador suporta WebRTC e que você permitiu o acesso à câmera e microfone.

Abra o arquivo index.html no navegador:

No Windows ou Mac:
Aperte Ctrl + F5 no arquivo ou use um servidor estático como o Live Server se necessário, caso esteja utilizando o VSCode, ou ultilize outro interpretador de HTML.

No Linux ou WSL
```bash
xdg-open index.html
```
Ao abrir o cliente, preencha seu nome e selecione uma sala ou crie uma nova sala para iniciar a comunicação.


### 4 Participantes



| Nome            | Matricula | Github |
| --------------- | --------- | ------ |
| Iago Cabral     | 190088745      | [iagocabral](https://github.com/iagocabral)   |
| Matheus Perillo |      190093421     |  [MatheusPerillo](https://github.com/MatheusPerillo)      |
| Paulo Victor    |    211043718       |     [PauloVictorFS](https://github.com/PauloVictorFS)   |
| Pedro Henrique Nogueira                |     190094486      |    [phnog](https://github.com/phnog)    |
