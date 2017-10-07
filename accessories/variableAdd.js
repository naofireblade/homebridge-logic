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

	CustomCharacteristic.VariableAdd = function() {
		Characteristic.call(this, '♦ ADD ♦', CustomUUID.VariableAddCharacteristic);
		this.setProps({
			format: Characteristic.Formats.BOOL,
    		perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
		});
		this.value = this.getDefaultValue();
	}
	inherits(CustomCharacteristic.VariableAdd, Characteristic);

	return VariableAddAccessory;
}

function VariableAddAccessory(platform, type) {
	this.log = platform.log;
	this.variableNamePlaceholder = platform.variableNamePlaceholder;
	this.hintPlaceholder = platform.hintPlaceholder;

	// Get other services from platform that will be used in this accessory
	this.informationService = platform.informationService;
	this.variableRemoveService = platform.variableRemoveService;
	this.variableListService = platform.variableListService;
	this.storage = platform.storage;

	switch(type)
	{
		case 1:
		{
			this.name = "New Counter";
			let VariableAddCounterService = require('../services/addCounter')(Service, Characteristic, CustomCharacteristic, CustomUUID);
			this.variableAddService = new VariableAddCounterService(this.name);
			break;
		}
		case 2:
		{
			this.name = "New Sensor";
			let VariableAddSensorService = require('../services/addSensor')(Service, Characteristic, CustomCharacteristic, CustomUUID);
			this.variableAddService = new VariableAddSensorService(this.name);
			break;
		}
		case 3:
		{
			this.name = "New Switch";
			let VariableAddSwitchService = require('../services/addSwitch')(Service, Characteristic, CustomCharacteristic, CustomUUID);
			this.variableAddService = new VariableAddSwitchService(this.name);
			break;
		}
		case 4:
		{
			this.name = "New Text";
			let VariableAddTextService = require('../services/addText')(Service, Characteristic, CustomCharacteristic, CustomUUID);
			this.variableAddService = new VariableAddTextService(this.name);
			break;
		}
		case 5:
		{
			this.name = "New Timer";
			let VariableAddTimerService = require('../services/addTimer')(Service, Characteristic, CustomCharacteristic, CustomUUID);
			this.variableAddService = new VariableAddTimerService(this.name);
			break;
		}
		default:
		{
			this.log.error("Unkown type \"" + type + "\" for new VariableAddService");
		}
	}
	this.type = type;
}

VariableAddAccessory.prototype = {
	identify: function (callback) {
		this.log("Identify requested");
		callback();
	},

	getServices: function () {
		debug("Get Services called");

		this.variableAddService.getCharacteristic(CustomCharacteristic.VariableAdd).on('set', this.addVariable.bind(this, this.type));

		return [this.informationService, this.variableAddService];
	},

	// TODO move case block to according service js
	addVariable: function(type, on, callback) {
		let that = this;
		if (on) {
			let uuid = this.generateUUID();
			let name = this.variableAddService.getCharacteristic(CustomCharacteristic.VariableName).value;
			let typeName;
			let readd = false;

			let cachedCharacteristic = this.storage.getItemSync("variable-" + name.toUpperCase());
			if (cachedCharacteristic !== undefined) {
				uuid = cachedCharacteristic.UUID;
				readd = true;
			}

			// TODO doubled code in case blocks, cleanup
			switch(type)
			{
				case 1:
				{
					typeName = "Counter";
					let min = this.variableAddService.getCharacteristic(CustomCharacteristic.CounterMin).value;
					let max = this.variableAddService.getCharacteristic(CustomCharacteristic.CounterMax).value;
					let countUp = this.variableAddService.getCharacteristic(CustomCharacteristic.CounterUp).value;
					let countDown = this.variableAddService.getCharacteristic(CustomCharacteristic.CounterDown).value;

					setTimeout(function() {
						that.variableAddService.setCharacteristic(CustomCharacteristic.VariableAdd, false);
					},1000);

					if (this.checkDuplicateVariableName(name)) {
						callback();
						return;
					}
					else if (max <= min) {
						debug("max <= min");
						callback();
						return;
					}

					setTimeout(function() {
						that.variableAddService.setCharacteristic(CustomCharacteristic.VariableName, that.variableNamePlaceholder);
					},1000);

					CustomCharacteristic.CounterValue = function() {
						Characteristic.call(this, name, uuid);
						this.setProps({
							format: Characteristic.Formats.INT,
							maxValue: max,
							minValue: min,
							minStep: 1,
							perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
						});
						this.value = this.getDefaultValue();
					}
					inherits(CustomCharacteristic.CounterValue, Characteristic);
					this.variableListService.addCharacteristic(CustomCharacteristic.CounterValue);

					if (countUp)
					{
						uuid = this.generateUUID();
						let buttonName = name + " +";
						CustomCharacteristic.CounterUpButton = function() {
							Characteristic.call(this, buttonName, uuid);
							this.setProps({
								format: Characteristic.Formats.BOOL,
								perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
							});
							this.value = this.getDefaultValue();
						}
						inherits(CustomCharacteristic.CounterUpButton, Characteristic);
						this.variableListService.addCharacteristic(CustomCharacteristic.CounterUpButton);
						this.variableListService.getCharacteristic(buttonName).on('set', this.count.bind(this, name, buttonName, true));
					}

					if (countDown)
					{
						uuid = this.generateUUID();
						let buttonName = name + " -";
						CustomCharacteristic.CounterDownButton = function() {
							Characteristic.call(this, buttonName, uuid);
							this.setProps({
								format: Characteristic.Formats.BOOL,
								perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
							});
							this.value = this.getDefaultValue();
						}
						inherits(CustomCharacteristic.CounterDownButton, Characteristic);
						this.variableListService.addCharacteristic(CustomCharacteristic.CounterDownButton);
						this.variableListService.getCharacteristic(buttonName).on('set', this.count.bind(this, name, buttonName, false));
					}
					break;
				}
				case 2:
				{
					typeName = "Sensor";
					let sensorType = this.variableAddService.getCharacteristic(CustomCharacteristic.SensorType).value;

					setTimeout(function() {
						that.variableAddService.setCharacteristic(CustomCharacteristic.VariableAdd, false);
					},1000);

					if (this.checkDuplicateVariableName(name)) {
						callback();
						return;
					}

					setTimeout(function() {
						that.variableAddService.setCharacteristic(CustomCharacteristic.VariableName, that.variableNamePlaceholder);
					},1000);

					// TODO try to add service instead of characteristic because more then one characteristics with same uuids are impossible
					// TODO Hint text to show which number means which sensor type
					// TODO add a button to set state of sensor
					switch (sensorType)
					{
						case 1:
						{
							this.variableListService.addCharacteristic(Characteristic.ContactSensorState);
							this.variableListService.getCharacteristic(Characteristic.ContactSensorState).displayName = name;
							break;
						}
						case 2:
						{
							this.variableListService.addCharacteristic(Characteristic.MotionDetected);
							this.variableListService.getCharacteristic(Characteristic.MotionDetected).displayName = name;
							break;
						}
						case 3:
						{
							this.variableListService.addCharacteristic(Characteristic.ObstructionDetected);
							this.variableListService.getCharacteristic(Characteristic.ObstructionDetected).displayName = name;
							break;
						}
						case 4:
						{
							this.variableListService.addCharacteristic(Characteristic.OccupancyDetected);
							this.variableListService.getCharacteristic(Characteristic.OccupancyDetected).displayName = name;
							break;
						}
						case 5:
						{
							this.variableListService.addCharacteristic(Characteristic.SmokeDetected);
							this.variableListService.getCharacteristic(Characteristic.SmokeDetected).displayName = name;
							break;
						}
						case 6:
						{
							this.variableListService.addCharacteristic(Characteristic.LeakDetected);
							this.variableListService.getCharacteristic(Characteristic.LeakDetected).displayName = name;
							break;
						}
					}

					break;
				}
				case 3:
				{
					typeName = "Switch";

					setTimeout(function() {
						that.variableAddService.setCharacteristic(CustomCharacteristic.VariableAdd, false);
					},1000);

					if (this.checkDuplicateVariableName(name)) {
						callback();
						return;
					}

					setTimeout(function() {
						that.variableAddService.setCharacteristic(CustomCharacteristic.VariableName, that.variableNamePlaceholder);
					},1000);

					CustomCharacteristic.Switch = function() {
						Characteristic.call(this, name, uuid);
						this.setProps({
							format: Characteristic.Formats.BOOL,
							perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
						});
						this.value = this.getDefaultValue();
					}
					inherits(CustomCharacteristic.Switch, Characteristic);
					this.variableListService.addCharacteristic(CustomCharacteristic.Switch);
					break;
				}
				case 4:
				{
					typeName = "Text";
					let readonly = this.variableAddService.getCharacteristic(CustomCharacteristic.TextReadonly).value;

					setTimeout(function() {
						that.variableAddService.setCharacteristic(CustomCharacteristic.VariableAdd, false);
					},1000);

					if (this.checkDuplicateVariableName(name)) {
						callback();
						return;
					}

					setTimeout(function() {
						that.variableAddService.setCharacteristic(CustomCharacteristic.VariableName, that.variableNamePlaceholder);
					},1000);

					CustomCharacteristic.Text = function() {
						Characteristic.call(this, name, uuid);
						let perms = [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY];
						if (!readonly) {
							perms.push( Characteristic.Perms.WRITE);
						}
						this.setProps({
							format: Characteristic.Formats.STRING,
							perms: perms
						});
						this.value = this.getDefaultValue();
					}
					inherits(CustomCharacteristic.Text, Characteristic);
					this.variableListService.addCharacteristic(CustomCharacteristic.Text);
					break;
				}
				case 5:
				{
					// New options
					typeName = "Timer";
					let timerDays = this.variableAddService.getCharacteristic(CustomCharacteristic.TimerDays).value;
					let timerHours = this.variableAddService.getCharacteristic(CustomCharacteristic.TimerHours).value;
					let timerMinutes = this.variableAddService.getCharacteristic(CustomCharacteristic.TimerMinutes).value;
					let timerSeconds = this.variableAddService.getCharacteristic(CustomCharacteristic.TimerSeconds).value;
					let time = ((timerDays * 24 * 60 * 60) + (timerHours * 60 * 60) + (timerMinutes * 60) + timerSeconds);

					// Cached options
					if (cachedCharacteristic !== undefined) {
						time = cachedCharacteristic.time;
					}

					setTimeout(function() {
						that.variableAddService.setCharacteristic(CustomCharacteristic.VariableAdd, false);
					}, 1000);

					if (this.checkDuplicateVariableName(name)) {
						callback();
						return;
					}

					setTimeout(function() {
						that.variableAddService.setCharacteristic(CustomCharacteristic.VariableName, that.variableNamePlaceholder);
					},1000);

					CustomCharacteristic.Switch = function() {
						Characteristic.call(this, name, uuid);
						this.setProps({
							format: Characteristic.Formats.BOOL,
							perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
						});
						this.value = this.getDefaultValue();
						this.type = type;
						this.time = time;
					}
					inherits(CustomCharacteristic.Switch, Characteristic);
					this.variableListService.addCharacteristic(CustomCharacteristic.Switch);

					if (!readd) {
						this.storage.setItemSync("variable-" + name.toUpperCase(), this.variableListService.getCharacteristic(name));
					}

					// timer time in seconds
					this.variableListService.getCharacteristic(name).on('set', this.startTimer.bind(this, name, time));
					break;
				}
				default:
				{
					this.log.error("Unkown type \"" + type + "\" for new VariableAddService");
				}
			}
			
			debug("Added variable " + (readd ? "from cache " : "") + "\n--------------\n Name: %s\n UUID: %s\n Type: %s\n--------------", name, uuid, typeName);

			// Remove dummy variable and reset placeholder text on callback
			this.variableRemoveService.setCharacteristic(CustomCharacteristic.VariableName, this.hintPlaceholder);
			this.variableRemoveService.setCharacteristic(CustomCharacteristic.VariableRemove, true);
		}
		callback();
	},

	/* Check if variable name already exists */
	checkDuplicateVariableName: function(name) {
		debug("Checking " + name);
		for (var i in this.variableListService.characteristics) {
			if (this.variableListService.characteristics[i].displayName.toUpperCase() === name.toUpperCase()) {
				this.log.warn("Check error: Variable with name \"%s\" already exists", name);
				return true;
			}
		}
		debug("Check successful");
		return false;
	},

	startTimer: function (buttonName, time, on, callback) {
		let that = this;
		if (on) {
			debug("Start timer for button " + buttonName + " with " + time + " seconds");

			setTimeout(function() {
				debug("Timer expired for button " + buttonName + " after " + time + " seconds");
				that.variableListService.setCharacteristic(buttonName, false);
			}, time * 1000);
		}
		callback();
	},

	/**
	 * Search for the given counter and count it up or down. Then switch the given button off.
	 * @param  {String}   counterName - Name of counter variable (characteristic)
	 * @param  {String}   buttonName - Name of button characteristic
	 * @param  {Boolean}  up - Count direction (true = up; false = down)
	 * @param  {Boolean}  on - Button event (true = on; false = off)
	 * @param  {Function} callback - Function to tell homekit button action is done
	 */
	count: function (counterName, buttonName, up, on, callback) {
		let that = this;
		if (on) {
			let old = this.variableListService.getCharacteristic(counterName).value;
			let result = old + (up ? 1 : (-1));
			debug("Count " + (up ? "up" : "down") + " from " + old + " to " + result);
			this.variableListService.setCharacteristic(counterName, result);

			setTimeout(function() {
				that.variableListService.setCharacteristic(buttonName, false);
			}, 1000);
		}
		callback();
	},

	generateUUID: function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
}