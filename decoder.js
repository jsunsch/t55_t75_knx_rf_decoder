/**
 * This module decodes KNX data output from an Uponor T-55 and T-75 thermostats.
 */

const knxDatapoints = require('knx-datapoints');

function decode(data){
    return splitToBlocks(data);
}

function splitToBlocks(data) {
    /*
    rtl433 
    // Outputs as data_length: 20 from rtl433
    [1144ff03 0074026009ec] [00 05ff] [0001] [e2] [00] [80] [0cb3 a6a1] // Sat til 19.0 C // aflæsning
    [1144ff03 0074026009ec] [00 05ff] [0002] [e4] [00] [80] [073a 9bfa] // Sat til 18.5 C // setting

    // output as data_length: 18 from rtl433, how to decode?
    0f44ff030074026009ec0005ff0004ec0081894a
    */

    if(!(data && data.length))
        return { error: "Unknown error occurred" };

    switch(data.length){
        case 44:
            return splitToBlocksFrom44Length(data);
        default:
            return { error: "Unsuported data format" };
    }
}

function splitToBlocksFrom44Length(data){
    let obj1 = decodeBlock1(data.substr(0, 20));
    let obj2 = decodeBlock2(data.substr(20, 24));

    return Object.assign({}, obj1, obj2);
}

function decodeBlock1(block1){
    // Octet 1 (Length)
    let length = hexToDecimal(block1.substr(0, 2));
    // Octet 2: skip Octet 2, it is always the hex value "44"
    // Octet 3: skip Octet 3, it is always the hex value "FF"
    // Octet 4 (RF-info)
    let batteryState = hexToBinary(block1.substr(6, 2)).substr(6,1) === "0" ? "Weak" : "OK";
    let batteryLow = hexToBinary(block1.substr(6, 2)).substr(6,1) === "0" ? true : false;
    // Octet 5+6+7+8+9+10
    let senderSerialNumber = block1.substr(8, 12);
    // Octet 11+12 (CRC octets) do not exists in the data returned from rtl433.

    return {
        length: length,
        batteryState: batteryState,
        batteryLow: batteryLow,
        senderSerialNumber: "0x" + senderSerialNumber
    };
}

function decodeBlock2(block2){
    // Octet 1 (KNX Ctrl)
    var octet1InBinary = hexToBinary(block2.substr(0,2));
    let knxCtrl = octet1InBinary.substr(0,4);
    let extendedFrameFormat = octet1InBinary.substr(4,4) == "0000" ? false : true;
    // Octet 2+3 (Source Address)
    let sourceAddress = block2.substr(2,4);
    // Octet 4+5 (Destination Address)
    let destinationAddress = block2.substr(6,4);
    // Octet 6 (LCPI)
    let octet6InBinary = hexToBinary(block2.substr(10, 2));
    let destinationIsGroupAddress = octet6InBinary.substr(0,1) == "1" ? true : false;
    let serialNumberIsDomainAddress = octet6InBinary.substr(6,1) == "1" ? true : false;
    // Octet 7+8 (APCI)
    let octet7_8InBinary = hexToBinary(block2.substr(12, 2)) + hexToBinary(block2.substr(14,2));
    let tpci;
    switch(octet7_8InBinary.substr(0,2)){
        case "00":
            tpci = "Unnumbered data";
            break;
        case "01":
            tpci = "numbered data";
            break;
        case "10":
            tpci = "unnumbered control";
            break;
        case "11":
            tpci = "numbered control";
            break;
        default:
            tpci = "unknown";
    }
    let frameNumer = parseInt(octet7_8InBinary.substr(2, 4), 2);
    let apci = octet7_8InBinary.substr(6, 10);
    
    // Octet 9+10 (Data: Temperature, encoded as Data Point Type 9.001
    let temperature = knxDatapoints.decode('9.001', Buffer.from(block2.substr(16, 4), 'hex'));
    // Octet 11+12 (Data: Unknown encoding)
    var unknownData = block2.substr(20,4);
    return {
        knxCtrl: knxCtrl + "b",
        isExtendedFrameFormat: extendedFrameFormat,
        sourceAddress: "0x" + sourceAddress,
        destinationAddress: "0x" + destinationAddress,
        destinationIsGroupAddress: destinationIsGroupAddress,
        serialNumberIsDomainAddress: serialNumberIsDomainAddress,
        tpci: tpci,
        frameNumer: frameNumer,
        apci: apci + "b",
        temperatureInC: temperature,
        unknownData: "0x" + unknownData,
        type: destinationAddress == "0001" ? "Reading" : destinationAddress == "0002" ? "Setting" : "Unknown"
    }
}

function hexToBinary(hexValue){
    return (parseInt(hexValue, 16).toString(2)).padStart(8, '0');
}

function hexToDecimal(hexValue)
{
    return parseInt("0x" + hexValue, 16);
}

module.exports = {
    decode
}