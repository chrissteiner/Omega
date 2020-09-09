//----------------------------------------------- SERVER FOR Web -------------------------
var app = require('express')();
var server = require('http').Server(app);
// var io = require('socket.io')(server);
const api_port = 8080;
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(api_port); 
console.log(`API-Server running at http://localhost:${api_port}`);


//----------------------------------------------- COMBINED -------------------------

var mosca = require('mosca');


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://user_chrizly:Chrizly12345678@chrizly.wtusg.mongodb.net/sensor_data?retryWrites=true&w=majority&useUnifiedTopology=true";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("sensor_data").collection("Temperatur");
  // perform actions on the collection object
  client.close();
});



var settings = {
  port: 1883,
  backend: client
};

var server = new mosca.Server(settings);

server.on('clientConnected', function(client) {
    console.log('client connected', client.id);
});

// fired when a message is received
server.on('published', function(packet, client) {
  console.log('Published', packet.payload);
});

server.on('ready', setup);

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running');
}



