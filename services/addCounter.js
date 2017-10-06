var inherits = require('util').inherits;
var	debug = require('debug')('homebridge-logic');

module.exports = function (Service, Characteristic, CustomCharacteristic, CustomUUID) {
	
	VariableAddCounterService = function(displayName, subtype) {
		Service.call(this, displayName, CustomUUID.VariableAddCounterService, subtype);
		this.addCharacteristic(CustomCharacteristic.VariableName);
		this.addCharacteristic(CustomCharacteristic.CounterMin);
		this.setCharacteristic(CustomCharacteristic.CounterMin, 0);
		this.addCharacteristic(CustomCharacteristic.CounterMax);
		this.setCharacteristic(CustomCharacteristic.CounterMax, 100);
		this.addCharacteristic(CustomCharacteristic.CounterUp);
		this.setCharacteristic(CustomCharacteristic.CounterUp, true);
		this.addCharacteristic(CustomCharacteristic.CounterDown);
		this.setCharacteristic(CustomCharacteristic.CounterDown, true);
		this.addCharacteristic(CustomCharacteristic.VariableAdd);
	};
	inherits(VariableAddCounterService, Service);

	// Minimum value of a slider variable
	CustomCharacteristic.CounterMin = function() {
		Characteristic.call(this, '› Min', CustomUUID.CounterMinCharacteristic);
		this.setProps({
			format: Characteristic.Formats.INT,
			maxValue: 0,
			minValue: -100,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE]
		});
		this.value = this.getDefaultValue();
	}
	inherits(CustomCharacteristic.CounterMin, Characteristic);

	// TODO Max Unlimited Option
	// Maximum value of a slider variable
	CustomCharacteristic.CounterMax = function() {
		Characteristic.call(this, '› Max', CustomUUID.CounterMaxCharacteristic);
		this.setProps({
			format: Characteristic.Formats.INT,
			maxValue: 100,
			minValue: 0,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE]
		});
		this.value = this.getDefaultValue();
	}
	inherits(CustomCharacteristic.CounterMax, Characteristic);

	// Does the Slider should have a count up button?
	CustomCharacteristic.CounterUp = function() {
		Characteristic.call(this, '› Count Up', CustomUUID.CounterUpCharacteristic);
		this.setProps({
			format: Characteristic.Formats.BOOL,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE]
		});
		this.value = this.getDefaultValue();
	}
	inherits(CustomCharacteristic.CounterUp, Characteristic);

	// Does the Slider should have a count down button?
	CustomCharacteristic.CounterDown = function() {
		Characteristic.call(this, '› Count Down', CustomUUID.CounterDownCharacteristic);
		this.setProps({
			format: Characteristic.Formats.BOOL,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE]
		});
		this.value = this.getDefaultValue();
	}
	inherits(CustomCharacteristic.CounterDown, Characteristic);

	return VariableAddCounterService;
}