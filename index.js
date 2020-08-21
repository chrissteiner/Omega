// //----------------------------------------------- SERVER FOR IOTs -------------------------
// const WebSocket = require('ws')
// const port = 3000;
// const wss = new WebSocket.Server({ port: port });
// console.log(`Server running at http://localhost:${port}`);

// wss.on('connection', ws => {
//   ws.on('message', message => {
//     console.log(`Received message => ${message}`)
//     ws.send("This is server speaking")
//     ws.emit("Hello to all my friends!!")
//   })
//   ws.send('Hello! Message From Server!!')
// })
// //----------------------------------------------- SERVER FOR Web -------------------------
var app = require('express')();
var server = require('http').Server(app);
// var io = require('socket.io')(server);
const api_port = 8080;
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(api_port); 
console.log(`API-Server running at http://localhost:${api_port}`);
// console.log("running on 8080");
// var numClients = 0;
// io.on('connection', function(socket) {
//     numClients=addConnection();
//     var message = "{ message: 'A new user has joined!' }";
//     socket.emit('announcements', message);
//     console.log(message);
//     io.emit('stats', { numClients: numClients });
    
//     socket.on('chat message', (msg) => {
//         console.log(msg);
//         io.emit('chat message', msg);
//     });    

//     socket.on('disconnect', function() {
//         numClients = rmConnection()
//         io.emit('stats', { numClients: numClients });
//     });
    
// });

// function addConnection(){
//     numClients++; console.log('Connected clients:', numClients); return numClients;
// }
// function rmConnection(){
//     numClients--; console.log('Connected clients:', numClients); return numClients;
// }
//----------------------------------------------- COMBINED -------------------------
const WebSocket = require('ws');
const { stringify } = require('querystring');
const { Console } = require('console');
const { kill } = require('process');
const { Serializer } = require('v8');
const port = 3000;
const wss = new WebSocket.Server({ port: port });
console.log(`Websocket-Server running at http://localhost:${port}`);
var numClients = 0;
var CLIENTS=[];
var id;
var IOT=[];
var answer = JSON.stringify({info: 'Hello from Server'});

wss.on('connection', ws => {
    numClients=addConnection(ws);
    ws.isAlive = true
    ws.on('pong', () => { heartbeat(ws) })

    ws.on('close', msg => {
        console.log("client wants to close")
        // console.log(ws)
        numClients = rmConnection(ws)
    });

    ws.on('message', message => {
        // console.log(`Received message => ${message}`)
        // ws.send("This is server speaking");
        var received = JSON.parse(message);
        console.log("Got message: ");
        console.log(received)
        if(received.message == "hoden"){
            console.log(id);
            ws.send(message + " selber");  // send message to itself

        }else if(received.message == "Hi Server!"){
            sendAll(message); // broadcast messages to everyone including sender

        }else if(received.message == "authentification"){
            addSensor(received, ws)

        }else if(received.Innenlicht == "toggle"){
            console.log("toggle");
            ws.send(message);
            sendAll(message);
        }else if(received.admin == "connected_clients"){
            IOT.forEach(element => {
                console.log(element.deviceID);    
            });
            
        }

    });

  ws.send(answer)
})

const heartbeat = (ws) => {
  ws.isAlive = true
}
const ping = (ws) => {
    // do some stuff
  }
const interval = setInterval(() => {
    console.log("Global livecheck");
    wss.clients.forEach((ws) => {
       if (ws.isAlive === false) {
            console.log("died during livecheck (Funktion bei RM nachziehen)")
            return ws.terminate()
        }
  
        ws.isAlive = false
        ws.ping(() => { ping(ws) })
    })
  }, 600000)

function addConnection(ws){
    var id = Math.random().toString(36).substr(2, 10);
    CLIENTS[id] = ws;
    CLIENTS.push(ws);
    console.log("Client connected! %o", id)
    numClients++; console.log('Connected clients:', numClients);
    return numClients;
}

function rmConnection(ws){
    // console.log(ws)
    CLIENTS.forEach(function(socket, index) {
        if(socket==ws['Socket']){
            console.log("Websocket wurde GEFUNDEN");
            IOT.forEach(function(element, i) {
                if(element['Socket']==socket){ //if the leaving Device is a Sensor, then remove from IOT array
                    console.log("leaving device is a Sensor");
                    IOT.splice(i, 1); //remove from IOT array
                }
            });
            
            socket.terminate();
            console.log("Client disconnected!")
            numClients--; console.log('Connected clients:', numClients); 
            // delete CLIENTS[id]; 
            CLIENTS.splice(index, 1); //remove from CLIENTS array
            return numClients;  
        }
        console.log("Die Verbindung konnte nicht gefunden werden");
    });
}

function sendAll(message) {
    console.log('sendAll : ' + CLIENTS.length);      
    for (var j=0; j < CLIENTS.length; j++) {
        console.log(CLIENTS[j])
        console.log('FOR : ', message);
        CLIENTS[j].send(message);
    }
}

function addSensor(received, ws){
            const hansl = {"deviceID":received.deviceID, "Socket":ws}
            // console.log("new Sensor: %o", hansl)
            IOT.push(hansl);
            checkIfDouble(IOT, CLIENTS);
}

//checks only Sensors
function checkIfDouble(IOT, CLIENTS) {
    //find Sensor IDs which are double (dead Connection)
    const arrayOfIds =  IOT.map((value)=>{ return value.deviceID});
    console.log("All connected Sensors: ")
    console.log(arrayOfIds)
    let arrayWithoutDouplicates = [...new Set(arrayOfIds)]

    // console.log(arrayWithoutDouplicates)
    if(arrayWithoutDouplicates.length < arrayOfIds.length){ //Set macht ein neues Array aus einem bestehenden, ohne Duplikate
        for(var i=0; i < arrayOfIds.length; i++){
           if(arrayWithoutDouplicates[i] != arrayOfIds[i]){
            console.log("removing douplicate connection with deviceID: "+ arrayOfIds[i])  
            IOT.forEach(function(element, index) {
                if(element["deviceID"]==arrayOfIds[i]){ //es werden zwei arrays miteinenader verglichen. das original und das ohne duplikate. bei der ersten abweichung kann im Original die deviceID festgestellt werden, allerdings ist dies die zweite (aktive) Verbindung. gekillt muss die erste (inaktive) Verbindung dieses Geräts werden
                    rmConnection(IOT[index]);
                    return;
                }
            }); 
            return
            } //ohne return würden viel mehr connections getötet       
        }
    }else {
        // console.log("no dead connections");
        return false; //no dead connections
    }
} 