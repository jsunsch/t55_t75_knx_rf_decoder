var mqtt = require('mqtt')
var { decode } = require("./decoder");

let mqttHost, inputTopic;
[_, _, mqttHost, inputTopic] = process.argv;

console.info("Arguments", process.argv)

var client  = mqtt.connect('mqtt://192.168.1.194');
 
client.on('connect', function () {
  client.subscribe(inputTopic, function (err) {
    if (err) {
      throw "The MQTT connection crashed"
    }

    console.info("Connected to MQTT");
  })
})
 
client.on('message', function (topic, message) {
    let data = JSON.parse(message).data;
    console.info("Received MQTT message", data)
    if(data){
        let decodedData = decode(data);
        if(decodedData.type == "Reading")
            client.publish("floor-heating/"+decodedData.senderSerialNumber+"/reading", JSON.stringify(decodedData));
        else if(decodedData.type == "Setting")
            client.publish("floor-heating/"+decodedData.senderSerialNumber+"/setting", JSON.stringify(decodedData));
        else
            client.publish("floor-heating", JSON.stringify(decodedData));

        console.info("Published data", decodedData)
    }
})
