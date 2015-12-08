var EDU05 = require('./edu05.driver.js');

var edu05 = new EDU05();
edu05.onConnected(function() {
    console.log('Received connected event from edu05');
}).init();

var LDR = '';
var NTC = '';
var SENS = '';

edu05.onDigitalsReceived(function(data) {
    edu05.setDigitals(data);
});

edu05.onSensReceived(function(value) {
    SENS = Math.round(((value - 155) * 10) / 31);
});

edu05.onRV2Received(function(value) {
    edu05.setLcdContrast((value/1024) * 255);
});

edu05.onRV1Received(function(value) {
    edu05.setLed((value/1024) * 255);
});

edu05.onLDRReceived(function(value) {
    LDR = Math.round(((1023 - value) * 10000) / value);
});

edu05.onNTCReceived(function(value) {
    NTC = Math.round(((1023 - value) * 10000) / value);
});

setInterval(edu05.askReadDigitals, 100);
setInterval(edu05.askReadSens, 100);
setInterval(edu05.askReadRV2, 10);
setInterval(edu05.askReadRV1, 10);
setInterval(edu05.askReadLDR, 100);
setInterval(edu05.askReadNTC, 100);

var redraw = function() {
    edu05.lcdClear();
    edu05.lcdWrite(0, 'LDR: ' + LDR + ' NTC: ' + NTC + ' SENS: ' + SENS);
}

setInterval(redraw, 1000);
