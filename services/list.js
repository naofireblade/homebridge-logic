var inherits = require('util').inherits;
var	debug = require('debug')('homebridge-logic');

module.exports = function (Service, Characteristic, CustomCharacteristic, CustomUUID, hintPlaceholder) {
	
	VariableListService = function(displayName, subtype) {
		Service.call(this, displayName, CustomUUID.VariableListService, subtype);
		this.addCharacteristic(CustomCharacteristic.VariableListHint);
	};
	inherits(VariableListService, Service);

	CustomCharacteristic.VariableListHint = function() {
		Characteristic.call(this, hintPlaceholder, CustomUUID.VariableListHintCharacteristic);
		this.setProps({
			format: Characteristic.Formats.STRING,
			perms: [Characteristic.Perms.READ]
		});
		this.value = this.getDefaultValue();
	}
	inherits(CustomCharacteristic.VariableListHint, Characteristic);

	return VariableListService;
}