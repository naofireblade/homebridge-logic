var inherits = require('util').inherits;
var	debug = require('debug')('homebridge-logic');

module.exports = function (Service, Characteristic, CustomCharacteristic, CustomUUID) {
	
	VariableAddSwitchService = function(displayName, subtype) {
		Service.call(this, displayName, CustomUUID.VariableAddSwitchService, subtype);
		this.addCharacteristic(CustomCharacteristic.VariableName);
		this.addCharacteristic(CustomCharacteristic.VariableAdd);
	};
	inherits(VariableAddSwitchService, Service);

	return VariableAddSwitchService;
}