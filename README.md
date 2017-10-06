# homebridge-logic

This is a plugin for [homebridge](https://github.com/nfarina/homebridge) to create powerful variables like timers or counters from within homekit. You can download it via [npm](https://www.npmjs.com/package/homebridge-logic).

Feel free to leave any feedback [here](https://github.com/naofireblade/homebridge-logic/issues).

## What can I do with this plugin?

- Add variables to homekit.
- Remove variables from homekit.
- Define options for variables.
- Do all this from within homekit without the need to configure the variables in a file.
- Do all this during runtime without the need to restart homebridge.
- List and use variables.
- Utilize the variables in homekit rules.

The following variable types and options are currently available.

- Timer (Days, Hours, Minutes, Seconds)
- Counter (Min, Max, Count up, Count down)
- Switch (On, Off)
- Text (Value, Readonly)

## Compatible Homekit Apps

- [Elgato Eve](https://itunes.apple.com/de/app/elgato-eve/id917695792)
- [Home](https://itunes.apple.com/de/app/home-hausautomatisierung/id995994352) (no custom variable names, no rules)
- [Report new](https://github.com/naofireblade/homebridge-logic/issues)

## Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-logic`
3. Update your configuration file. See the samples below.

## Configuration

Add the following information to your config file. Make sure to add your API key and provide your city or postal code.

```json
"platforms": [
	{
		"platform": "Logic",
		"name": "Logic"
	}
]
```

## Example use cases

- TODO

## Screenshots
![Variable types to add](https://i.imgur.com/WMUG97gl.png)
>Choose variable type to add

![Variable options counter](https://i.imgur.com/t70hl4Zl.png) ![Variable options timer](https://i.imgur.com/sfIx3URl.png)
>Variable options

![List and use your created variables](https://i.imgur.com/03B2tQHl.png)
>List and use your created variables

![Remove variable](https://i.imgur.com/bJhrD42l.png)
>Remove variable

(c) Screenshots are taken from Elgato Eve app