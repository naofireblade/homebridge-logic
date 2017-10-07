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

	return VariableRemoveAccessory;
}

// TODO list variables and delete button instead of asking for name to delete?
function VariableRemoveAccessory(platform) {
	this.log = platform.log;
	this.name = "Remove Variable";
	this.variableNamePlaceholder = platform.variableNamePlaceholder;

	// Get other services from platform that will be used in this accessory
	this.informationService = platform.informationService;
	this.variableListService = platform.variableListService;
	let VariableRemoveService = require('../services/remove')(Service, Characteristic, CustomCharacteristic, CustomUUID);
	this.variableRemoveService = new VariableRemoveService(this.name);
	this.variableRemoveService.getCharacteristic(CustomCharacteristic.VariableRemove).on('set', this.removeVariable.bind(this));
}

VariableRemoveAccessory.prototype = {
	identify: function (callback) {
		this.log("Identify requested");
		callback();
	},

	getServices: function () {
		return [this.informationService, this.variableRemoveService];
	},

	removeVariable: function(on, callback) {
		let that = this;
		if (on) {
			let name = this.variableRemoveService.getCharacteristic(CustomCharacteristic.VariableName).value.toUpperCase();
			setTimeout(function() {
				that.variableRemoveService.setCharacteristic(CustomCharacteristic.VariableName, that.variableNamePlaceholder);
				that.variableRemoveService.setCharacteristic(CustomCharacteristic.VariableRemove, false);
			},2000);

			let removeList = [];
			for (var i in this.variableListService.characteristics) {
				if (this.variableListService.characteristics[i].displayName.toUpperCase() === name
					|| this.variableListService.characteristics[i].displayName.toUpperCase() === name + ' +'
					|| this.variableListService.characteristics[i].displayName.toUpperCase() === name + ' -')
				{
					removeList.push(this.variableListService.characteristics[i]);
				}
			}
			for (var i in removeList) {
				this.variableListService.removeCharacteristic(removeList[i]);
				debug("Removed variable with name \"%s\"", removeList[i].displayName);
			}

			// TODO remove variable from cache

			// re-add hint text if last variable was deleted, because homekit hides services with no characteristics
			if(this.variableListService.characteristics.length == 1)
			{
				this.variableListService.addCharacteristic(CustomCharacteristic.VariableListHint)
			}
		}
		callback();
	}
}