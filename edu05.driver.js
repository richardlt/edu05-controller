var HID = require('node-hid');

var EDU05Constant = require('./edu05.constant.js');

var EDU05 = function() {

    var _device = null;
    var _callbacks = [];

    this.init = function() {
        _device = new HID.HID(EDU05Constant.PATH);
        _device.on('data', _onReceiveData);
        _device.write([EDU05Constant.CONNECT, 5]);
        _device.write([EDU05Constant.LCD_INIT]);
        this.setLed(0);
        this.setLcdContrast(128);
    };

    var _executeCallbacks = function(event, data) {
        if( _callbacks[event] ) {
            _callbacks[event].forEach(function(callback) {
                callback(data);
            });
        }
    };

    var _onReceiveData = function(data){
        switch(data[0]) {
            case EDU05Constant.CONNECT:
                _executeCallbacks('connected', null);
                break;
            case EDU05Constant.DIGITAL_READ:
                _executeCallbacks('digitals-received', data[1]);
                break;
            case EDU05Constant.ANALOG_READ:
                if( data[1] === 0 ) {
                    _executeCallbacks('sens-received', data[2] + 256*data[3]);
                } else if( data[1] === 1 ) {
                    _executeCallbacks('rv2-received', data[2] + 256*data[3]);
                } else if( data[1] === 2 ) {
                    _executeCallbacks('rv1-received', data[2] + 256*data[3]);
                } else if( data[1] === 3 ) {
                    _executeCallbacks('ldr-received', data[2] + 256*data[3]);
                } else if( data[1] === 4 ) {
                    _executeCallbacks('ntc-received', data[2] + 256*data[3]);
                }
                break;
            default:
                console.log('Received unrecognized event from edu05');
        }
    };

    this.lcdClear = function() {
        _device.write([EDU05Constant.LCD_CLEAR]);
    };

    this.lcdWrite = function(index, string) {
        var tab = [EDU05Constant.LCD_WRITE, index, string.length];
        for (var i = 0; i < string.length; ++i) {
            tab.push(string.charCodeAt(i));
        }
        _device.write(tab);
    };

    var _setPWM = function(channel, value) {
        _device.write([EDU05Constant.PWM_SET, channel, value]);
    };

    this.setLcdContrast = function(value) {
        _setPWM(0, value)
    };

    this.setLed = function(value) {
        _setPWM(1, value)
    };

    var _setDigitalOutMode = function() {
        _device.write([EDU05Constant.DIGITAL_SET_MODE, 0]);
    };

    var _setDigitalInMode = function() {
        _device.write([EDU05Constant.DIGITAL_SET_MODE, 1]);
    };

    this.setDigitals = function(value) {
        _setDigitalOutMode();
        _device.write([EDU05Constant.DIGITAL_SET_ALL, value]);
    };

    this.askReadDigitals = function() {
        _setDigitalInMode();
        _device.write([EDU05Constant.DIGITAL_READ]);
    };

    var _askReadAnalog = function(channel) {
        _device.write([EDU05Constant.ANALOG_READ, channel]);
    };

    this.askReadSens = function() {
        _askReadAnalog(0);
    };

    this.askReadRV2 = function() {
        _askReadAnalog(1);
    };

    this.askReadRV1 = function() {
        _askReadAnalog(2);
    };

    this.askReadLDR = function() {
        _askReadAnalog(3);
    };

    this.askReadNTC = function() {
        _askReadAnalog(4);
    };

    var _on = function(event, callback) {
        var callbacks = _callbacks[event];
        if( !callbacks ) {
            callbacks = [];
        }
        callbacks.push(callback);
        _callbacks[event] = callbacks;
    };

    this.onConnected = function(callback) {
        _on('connected', callback);
        return this;
    }

    this.onDigitalsReceived = function(callback) {
        _on('digitals-received', callback);
        return this;
    };

    this.onSensReceived = function(callback) {
        _on('sens-received', callback);
        return this;
    };

    this.onRV2Received = function(callback) {
        _on('rv2-received', callback);
        return this;
    };

    this.onRV1Received = function(callback) {
        _on('rv1-received', callback);
        return this;
    };

    this.onLDRReceived = function(callback) {
        _on('ldr-received', callback);
        return this;
    };

    this.onNTCReceived = function(callback) {
        _on('ntc-received', callback);
        return this;
    };

    /*this.setDigital = function(number) {
        if( 0 <= number && number <= 7 ) {
            _setDigitalOutMode();
            _device.write([EDU05Constant.DIGITAL_SET_ONE, number]);
        }
    };*/

};

module.exports = EDU05;
