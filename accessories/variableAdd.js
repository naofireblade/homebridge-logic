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

	this.name = "New " + this.getTypeLabel(type);

	switch(type)
	{
		case 1:
		{
			let VariableAddCounterService = require('../services/addCounter')(Service, Characteristic, CustomCharacteristic, CustomUUID);
			this.variableAddService = new VariableAddCounterService(this.name);
			break;
		}
		case 2:
		{
			let VariableAddSensorService = require('../services/addSensor')(Service, Characteristic, CustomCharacteristic, CustomUUID);
			this.variableAddService = new VariableAddSensorService(this.name);
			break;
		}
		case 3:
		{
			let VariableAddSwitchService = require('../services/addSwitch')(Service, Characteristic, CustomCharacteristic, CustomUUID);
			this.variableAddService = new VariableAddSwitchService(this.name);
			break;
		}
		case 4:
		{
			let VariableAddTextService = require('../services/addText')(Service, Characteristic, CustomCharacteristic, CustomUUID);
			this.variableAddService = new VariableAddTextService(this.name);
			break;
		}
		case 5:
		{
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

		this.variableAddService.getCharacteristic(CustomCharacteristic.VariableAdd).on('set', this.addVariableCallback.bind(this, this.type));

		return [this.informationService, this.variableAddService];
	},

	// TODO move case block to according service js
	addVariableCallback: function (type, on, callback) {
		let that = this;
		if (on) {
			let name = this.variableAddService.getCharacteristic(CustomCharacteristic.VariableName).value;
			this.addVariable(type, name);
		}
		callback();
	},

	addVariable: function (type, name) {
		let that = this;

		// properties to fill from cache or new variable options
		let uuids,
			value,
			min,
			max,
			countUp,
			countDown,
			sensorType,
			readonly,
			time,
			cache;

		// look for variable in storage
		let cachedVariable = this.storage.getItemSync("variable-" + name.toLowerCase());

		if (cachedVariable !== undefined) {
			uuids = cachedVariable.uuids;
			value = cachedVariable.value;
			min = cachedVariable.min;
			max = cachedVariable.max;
			countUp = cachedVariable.countUp;
			countDown = cachedVariable.countDown;
			sensorType = cachedVariable.sensorType;
			readonly = cachedVariable.readonly;
			time = cachedVariable.time;
			cache = true;
		}
		else {
			uuids = [];
			uuids.push(this.generateUUID());
			uuids.push(this.generateUUID());
			uuids.push(this.generateUUID());
			cache = false;
		}

		// Reset add button
		setTimeout(function() {
			that.variableAddService.setCharacteristic(CustomCharacteristic.VariableAdd, false);
		},1000);

		// Check if variable already exists
		if (this.checkDuplicateVariableName(name)) {
			this.log("Variable with name " + name + " already exists.");
			return;
		}

		switch(type)
		{
			case 1:
			{
				if (!cache) {
					min = this.variableAddService.getCharacteristic(CustomCharacteristic.CounterMin).value;
					max = this.variableAddService.getCharacteristic(CustomCharacteristic.CounterMax).value;
					countUp = this.variableAddService.getCharacteristic(CustomCharacteristic.CounterUp).value;
					countDown = this.variableAddService.getCharacteristic(CustomCharacteristic.CounterDown).value;
				}

				if (max <= min) {
					debug("Option max cannot be smaller or equal compared to min.");
					callback();
					return;
				}

				CustomCharacteristic.CounterValue = function() {
					Characteristic.call(this, name, uuids[0]);
					this.setProps({
						format: Characteristic.Formats.INT,
						maxValue: max,
						minValue: min,
						minStep: 1,
						perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
					});
					this.value = (value !== undefined ? value : this.getDefaultValue());
				}
				inherits(CustomCharacteristic.CounterValue, Characteristic);
				this.variableListService.addCharacteristic(CustomCharacteristic.CounterValue);

				if (countUp)
				{
					let buttonName = name + " +";
					CustomCharacteristic.CounterUpButton = function() {
						Characteristic.call(this, buttonName, uuids[1]);
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
					let buttonName = name + " -";
					CustomCharacteristic.CounterDownButton = function() {
						Characteristic.call(this, buttonName, uuids[2]);
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
				if (!cache) {
					sensorType = this.variableAddService.getCharacteristic(CustomCharacteristic.SensorType).value;
				}

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
				CustomCharacteristic.Switch = function() {
					Characteristic.call(this, name, uuids[0]);
					this.setProps({
						format: Characteristic.Formats.BOOL,
						perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
					});
					this.value = (value !== undefined ? value : this.getDefaultValue());
				}
				inherits(CustomCharacteristic.Switch, Characteristic);
				this.variableListService.addCharacteristic(CustomCharacteristic.Switch);
				break;
			}
			case 4:
			{
				if (!cache) {
					readonly = this.variableAddService.getCharacteristic(CustomCharacteristic.TextReadonly).value;
				}

				CustomCharacteristic.Text = function() {
					Characteristic.call(this, name, uuids[0]);
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
				if (!cache) {
					let timerDays = this.variableAddService.getCharacteristic(CustomCharacteristic.TimerDays).value;
					let timerHours = this.variableAddService.getCharacteristic(CustomCharacteristic.TimerHours).value;
					let timerMinutes = this.variableAddService.getCharacteristic(CustomCharacteristic.TimerMinutes).value;
					let timerSeconds = this.variableAddService.getCharacteristic(CustomCharacteristic.TimerSeconds).value;
					time = ((timerDays * 24 * 60 * 60) + (timerHours * 60 * 60) + (timerMinutes * 60) + timerSeconds);
				}

				CustomCharacteristic.Switch = function() {
					Characteristic.call(this, name, uuids[0]);
					this.setProps({
						format: Characteristic.Formats.BOOL,
						perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
					});
					this.value = (value !== undefined ? value : this.getDefaultValue());

				}
				inherits(CustomCharacteristic.Switch, Characteristic);
				this.variableListService.addCharacteristic(CustomCharacteristic.Switch);

				// timer time in seconds
				this.variableListService.getCharacteristic(name).on('set', this.startTimer.bind(this, name, time));
				break;
			}
			default:
			{
				this.log.error("Unkown variable type \"" + type + "\"");
			}
		}
		
		// Store variable in cache
		if (!cache) {
			this.storage.setItemSync("variable-" + name.toLowerCase(), {
				type:type,
				typeLabel:that.getTypeLabel(type),
				name:name,
				uuids:uuids,
				min:min,
				max:max,
				countUp:countUp,
				countDown:countDown,
				sensorType:sensorType,
				readonly:readonly,
				time:time
			});
		}

		// Reset field for variable name
		setTimeout(function() {
			that.variableAddService.setCharacteristic(CustomCharacteristic.VariableName, that.variableNamePlaceholder);
		},1000);

		// Remove dummy variable and reset placeholder text
		this.variableRemoveService.setCharacteristic(CustomCharacteristic.VariableName, this.hintPlaceholder);
		this.variableRemoveService.setCharacteristic(CustomCharacteristic.VariableRemove, true);

		debug("Added variable " + (cache ? "from cache " : "") + "\n--------------\n Name: %s\n UUID: %s\n Type: %s\n--------------", name, uuids[0], this.getTypeLabel(type));
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
	},

	getTypeLabel: function(type) {
		switch (type)
		{
			case 1:
				return "Counter";
			case 2:
				return "Sensor";
			case 3:
				return "Switch";
			case 4:
				return "Text";
			case 5:
				return "Timer";
		}
	}
}