var inherits = require('util').inherits;
var	debug = require('debug')('homebridge-logic');

var Service,
	Characteristic,
	CustomCharacteristic,
	CustomUUID;

module.exports = function (_Service, _Characteristic, _CustomCharacteristic, _CustomUUID) {

	Service = _Service;
	Characteristic = _Characteristic;
	CustomCharacteristic = _CustomCharacteristic;
	CustomUUID = _CustomUUID;

	return VariableListAccessory;
}

function VariableListAccessory(platform) {
	this.log = platform.log;
	this.name = "My Variables";

	// Get other services from platform that will be used in this accessory
	this.informationService = platform.informationService;
	let VariableListService = require('../services/list')(Service, Characteristic, CustomCharacteristic, CustomUUID, platform.hintPlaceholder);
	this.variableListService = new VariableListService(this.name);
}

VariableListAccessory.prototype = {
	identify: function (callback) {
		this.log("Identify requested");
		callback();
	},

	getServices: function () {
		debug("Get Services called");
		return [this.informationService, this.variableListService];
	}
}