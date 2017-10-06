var inherits = require('util').inherits;
var	debug = require('debug')('homebridge-logic');

module.exports = function (Service, Characteristic, CustomCharacteristic, CustomUUID) {

	VariableAddTextService = function(displayName, subtype) {
		Service.call(this, displayName, CustomUUID.VariableAddTextService, subtype);
		this.addCharacteristic(CustomCharacteristic.VariableName);
		this.addCharacteristic(CustomCharacteristic.TextReadonly);
		this.addCharacteristic(CustomCharacteristic.VariableAdd);
	};
	inherits(VariableAddTextService, Service);

	CustomCharacteristic.TextReadonly = function() {
		Characteristic.call(this, '› Readonly', CustomUUID.TextReadonlyCharacteristic);
		this.setProps({
			format: Characteristic.Formats.BOOL,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE]
		});
		this.value = this.getDefaultValue();
	}
	inherits(CustomCharacteristic.TextReadonly, Characteristic);

	return VariableAddTextService;
}