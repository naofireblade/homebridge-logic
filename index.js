"use strict";

var inherits = require('util').inherits;
var	debug = require('debug')('homebridge-logic');

var	Service,
	Characteristic,

	variableNamePlaceholder = "Tap here",
	hintPlaceholder = "Your variables will be shown here",

	CustomUUID = {
		// Services
		VariableAddCounterService: '306c302e-afda-4303-bd17-1696bef7bfb0',
		VariableAddSensorService: 'c2c707b5-f49d-4936-8efe-d04adc42d0f8',
		VariableAddSwitchService: '983d6f70-98f9-4640-b44f-0457593b2eea',
		VariableAddTextService: 'b5a6d62d-25f0-47bd-8d79-376e4dc65ed6',
		VariableAddTimerService: 'ab0d2259-2478-42cc-b3bd-30ead361a241',
		VariableRemoveService: '4573015f-171e-42dc-b765-231688eebebd',
		VariableListService: 'a4aeff58-198c-4e35-8c1c-66da49e2b512',

		// Common characteristics
		NameCharacteristic: '5fdff005-d1ba-4312-b27a-047f73a1296a',
		VariableListHintCharacteristic: '4d607e71-9ebb-440d-87b3-a4f8acb91690',
		VariableAddCharacteristic: '8842d640-09f2-4cb1-bdb0-049d91865f31',
		VariableRemoveCharacteristic: '63a3f329-4e56-49ad-9def-3144f9ca7326',

		// Type specific characteristics
		CounterMinCharacteristic: '0ac0b64f-1d42-4e48-a01b-efcbeb96ea57',
		CounterMaxCharacteristic: 'd1908b32-588a-477f-86ac-104d3d0da6a1',
		CounterUpCharacteristic: 'cc875a7d-9a8c-4c52-9c53-c2c6f73acaef',
		CounterDownCharacteristic: '380b0ca1-94ba-445a-8af2-ed757cd0b685',
		SensorTypeCharacteristic: '8e1950a7-2a45-4405-a5cb-e6d10b374e22',
		TimerDaysCharacteristic: 'df1e5378-f210-4fa3-9779-2728e5218494',
		TimerHoursCharacteristic: '4a4595fc-e227-4d57-b43a-373df4b0949e',
		TimerMinutesCharacteristic: '8cedc1d1-2381-4028-b747-6d508c2047f0',
		TimerSecondsCharacteristic: 'dd708928-33c1-4494-9466-3a4a8fd754fd',
		TextReadonlyCharacteristic: '794feef5-c879-49d6-bcd2-a265757471ba'
	},
	CustomCharacteristic = {};

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerPlatform("homebridge-logic", "Logic", LogicPlatform);

	// Displayname of a variable
	CustomCharacteristic.VariableName = function() {
		Characteristic.call(this, 'Name', CustomUUID.NameCharacteristic);
		this.setProps({
			format: Characteristic.Formats.STRING,
			perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE]
		});
		this.value = variableNamePlaceholder;
	}
	inherits(CustomCharacteristic.VariableName, Characteristic);
}

function LogicPlatform(log, config) {
	this.log = log;
	this.config = config;
}

LogicPlatform.prototype = {
	accessories: function(callback) {
		this.variableNamePlaceholder = variableNamePlaceholder;
		this.hintPlaceholder = hintPlaceholder;

		let directory = "/var/lib/homebridge-dev/logic";
		this.storage = require('node-persist');
		this.storage.initSync({dir:directory});

		// General information service for all accessories in this platform
		this.informationService = new Service.AccessoryInformation();
		this.informationService.setCharacteristic(Characteristic.Manufacturer, "Homebridge Logic");
		this.informationService.setCharacteristic(Characteristic.Model, "github.com/naofireblade/homebridge-logic");

		// Accessory to store all user defined variables as characteristics
		let VariableListAccessory = require('./accessories/variableList')(Service, Characteristic, CustomCharacteristic, CustomUUID);
		let variableListAccessory = new VariableListAccessory(this);
		this.variableListService = variableListAccessory.getServices()[1]; // service is also called in add and remove accessories

		// Accessory to remove a user defined variable
		let VariableRemoveAccessory = require('./accessories/variableRemove')(Service, Characteristic, CustomCharacteristic, CustomUUID);
		let variableRemoveAccessory = new VariableRemoveAccessory(this);
		this.variableRemoveService = variableRemoveAccessory.getServices()[1]; // service is also called in add accessory 

		// Accessories to add different types of user defined variables
		let VariableAddAccessory = require('./accessories/variableAdd')(Service, Characteristic, CustomCharacteristic, CustomUUID);
		let variableAddCounterAccessory = new VariableAddAccessory(this, 1);
		let variableAddSensorAccessory = new VariableAddAccessory(this, 2);
		let variableAddSwitchAccessory = new VariableAddAccessory(this, 3);
		let variableAddTextAccessory = new VariableAddAccessory(this, 4);
		let variableAddTimerAccessory = new VariableAddAccessory(this, 5);

		this.accessories = [];
		this.accessories.push(variableAddCounterAccessory);
		// this.accessories.push(variableAddSensorAccessory); // work in progress, currently not working
		this.accessories.push(variableAddSwitchAccessory);
		this.accessories.push(variableAddTextAccessory);
		this.accessories.push(variableAddTimerAccessory);
		this.accessories.push(variableRemoveAccessory);
		this.accessories.push(variableListAccessory);

		// re-add variables from cache after homebridge restart
		for (var i in this.storage.values()) {
			debug("blub");
			let cachedVariable = this.storage.values()[i];
			let addAccessory;

			switch (parseInt(cachedVariable.type))
			{
				case 1:
				{
					addAccessory = variableAddCounterAccessory;
					break;
				}
				case 2:
				{
					addAccessory = variableAddSensorAccessory;
					break;
				}
				case 3:
				{
					addAccessory = variableAddSwitchAccessory;
					break;
				}
				case 4:
				{
					addAccessory = variableAddTextAccessory;
					break;
				}
				case 5:
				{
					addAccessory = variableAddTimerAccessory;
					break;
				}
				default:
				{
					debug("Non compatible type " + cachedVariable.type + " found in cache.");
					debug(cachedVariable);
					return;
				}
			}
			addAccessory.addVariable(cachedVariable.type, cachedVariable.name);
		}
		callback(this.accessories);
	}
}