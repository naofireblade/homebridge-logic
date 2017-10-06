var inherits = require('util').inherits;
var	debug = require('debug')('homebridge-logic');

module.exports = function (Service, Characteristic, CustomCharacteristic, CustomUUID) {
	
	VariableAddSensorService = function(displayName, subtype) {
		Service.call(this, displayName, CustomUUID.VariableAddSensorService, subtype);
		this.addCharacteristic(CustomCharacteristic.VariableName);
		this.addCharacteristic(CustomCharacteristic.SensorType);
		this.addCharacteristic(CustomCharacteristic.VariableAdd);
	};
	inherits(VariableAddSensorService, Service);

	CustomCharacteristic.SensorType = function() {
		Characteristic.call(this, 'Type', CustomUUID.SensorTypeCharacteristic);
		this.setProps({
			format: Characteristic.Formats.UINT8,
			maxValue: 6,
			minValue: 1,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE]
		});
		this.value = this.getDefaultValue();
	}
	inherits(CustomCharacteristic.SensorType, Characteristic);

	return VariableAddSensorService;
}