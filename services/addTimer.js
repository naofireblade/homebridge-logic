var inherits = require('util').inherits;
var	debug = require('debug')('homebridge-logic');

module.exports = function (Service, Characteristic, CustomCharacteristic, CustomUUID) {

	VariableAddTimerService = function(displayName, subtype) {
		Service.call(this, displayName, CustomUUID.VariableAddTimerService, subtype);
		this.addCharacteristic(CustomCharacteristic.VariableName);
		this.addCharacteristic(CustomCharacteristic.TimerDays);
		this.addCharacteristic(CustomCharacteristic.TimerHours);
		this.addCharacteristic(CustomCharacteristic.TimerMinutes);
		this.addCharacteristic(CustomCharacteristic.TimerSeconds);
		this.addCharacteristic(CustomCharacteristic.VariableAdd);
	};
	inherits(VariableAddTimerService, Service);
	
	CustomCharacteristic.TimerDays = function() {
		Characteristic.call(this, '› Days', CustomUUID.TimerDaysCharacteristic);
		this.setProps({
			format: Characteristic.Formats.UINT8,
			maxValue: 31,
			minValue: 0,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE]
		});
		this.value = this.getDefaultValue();
	}
	inherits(CustomCharacteristic.TimerDays, Characteristic);

	CustomCharacteristic.TimerHours = function() {
		Characteristic.call(this, '› Hours', CustomUUID.TimerHoursCharacteristic);
		this.setProps({
			format: Characteristic.Formats.UINT8,
			maxValue: 24,
			minValue: 0,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE]
		});
		this.value = this.getDefaultValue();
	}
	inherits(CustomCharacteristic.TimerHours, Characteristic);

	CustomCharacteristic.TimerMinutes = function() {
		Characteristic.call(this, '› Minutes', CustomUUID.TimerMinutesCharacteristic);
		this.setProps({
			format: Characteristic.Formats.UINT8,
			maxValue: 60,
			minValue: 0,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE]
		});
		this.value = this.getDefaultValue();
	}
	inherits(CustomCharacteristic.TimerMinutes, Characteristic);

	CustomCharacteristic.TimerSeconds = function() {
		Characteristic.call(this, '› Seconds', CustomUUID.TimerSecondsCharacteristic);
		this.setProps({
			format: Characteristic.Formats.UINT8,
			maxValue: 60,
			minValue: 0,
			minStep: 1,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE]
		});
		this.value = this.getDefaultValue();
	}
	inherits(CustomCharacteristic.TimerSeconds, Characteristic);

	return VariableAddTimerService;
}