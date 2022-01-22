var { decode } = require("./decoder");
var fs = require("fs");

var encodedData = "1144ff030074026009ec0005ff0001e800800cad7a14";
var decodedData = decode(encodedData);
console.log(decodedData);
return;

let rawFileData = fs.readFileSync('sampledata.json');
let dataArray = JSON.parse(rawFileData);
let resultArray = [];
let resultStr = "something;deviceSerialNumber;knxCtrl;sourceAddress;destinationAddress;npci;tpci;apci;temperature;dataOctet2";
for(let i=0; i<dataArray.length; i++){
    var decodedData = decode(dataArray[i].data);
    resultArray.push(decodedData);
    if(decodedData.temperature)
        resultStr += "\n" + decodedData.something 
                    + ";" + decodedData.deviceSerialNumber 
                    + ";" + decodedData.knxCtrl 
                    + ";" + decodedData.sourceAddress 
                    + ";" + decodedData.destinationAddress 
                    + ";" + decodedData.npci 
                    + ";" + decodedData.tpci 
                    + ";" + decodedData.apci 
                    + ";" + decodedData.temperature 
                    + ";" + decodedData.dataOctet2;
}

var jsonString = JSON.stringify(resultArray);
fs.writeFileSync('decoded_sampledata.json', jsonString);
fs.writeFileSync('decoded_sampledata.csv', resultStr);

return;