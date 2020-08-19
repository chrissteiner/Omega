console.log('WebSocket client script will run here.');

const ws = new WebSocket('ws://localhost:3000', ['json', 'xml']);
console.log("Passiert hier was? jouuu")
ws.addEventListener('open', () => {
  const data = { message: 'Hello this is client speaking!' }
  const json = JSON.stringify(data);
  console.log(json);
  ws.send(json);
});
ws.addEventListener('message', event => {
  const data = JSON.parse(event.data);
  console.log(data + "du hoden");
});
function sendWSMsg() { 
  const data = { message: 'Hello this is client speaking!' }
  const json = JSON.stringify(data);
  console.log(json);
  ws.send(json);
}