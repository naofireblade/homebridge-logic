var inherits = require('util').inherits;
var	debug = require('debug')('homebridge-logic');

module.exports = function (Service, Characteristic, CustomCharacteristic, CustomUUID) {
	
	VariableRemoveService = function(displayName, subtype) {
		Service.call(this, displayName, CustomUUID.VariableRemoveService, subtype);
		this.addCharacteristic(CustomCharacteristic.VariableName);
		this.addCharacteristic(CustomCharacteristic.VariableRemove);
	};
	inherits(VariableRemoveService, Service);

	CustomCharacteristic.VariableRemove = function() {
		Characteristic.call(this, '♦ REMOVE ♦', CustomUUID.VariableRemoveCharacteristic);
		this.setProps({
			format: Characteristic.Formats.BOOL,
    		perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	}
	inherits(CustomCharacteristic.VariableRemove, Characteristic);

	return VariableRemoveService;
}