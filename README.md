# homebridge-logic

This is a plugin for [homebridge](https://github.com/nfarina/homebridge) to create powerful variables like timers and counters within homekit. You can download it via [npm](https://www.npmjs.com/package/homebridge-logic).

Feel free to leave any feedback [here](https://github.com/naofireblade/homebridge-logic/issues).

## What can I do with this plugin?

- Add variables to homekit.
- Remove variables from homekit.
- Define options for variables.
- Do all this from within homekit without the need to configure the variables in a file.
- Do all this during runtime without the need to restart homebridge.
- List and use variables.
- Utilize the variables in homekit rules.

### Variable types and options

- Timer (Days, Hours, Minutes, Seconds)
- Counter (Min, Max, Count up, Count down)
- Switch (On, Off)
- Text (Value, Readonly)

### Compatible Homekit Apps

- [Elgato Eve](https://itunes.apple.com/de/app/elgato-eve/id917695792)
- [Home](https://itunes.apple.com/de/app/home-hausautomatisierung/id995994352) (no custom variable names, no rules)
- [Report new](https://github.com/naofireblade/homebridge-logic/issues)

### Troubleshooting

#### I cannot add my variable
Check if a variable with the same name already exists.

#### My added variable does not show up in the list
In the current Eve app you have to change the room twice and then open the variable list again to a refresh it.

## Installation

1. Install homebridge using: `npm install -g homebridge`
2. Install this plugin using: `npm install -g homebridge-logic`
3. Update your configuration file. See the sample below.

### Configuration

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

Find and add your own here [here](https://github.com/naofireblade/homebridge-logic/wiki)

## Screenshots
### Choose a variable type to add
![Variable types to add](https://i.imgur.com/WMUG97gl.png)

### Define variable options
![Define variable options for counter](https://i.imgur.com/t70hl4Zl.png) ![Define variable options for timer](https://i.imgur.com/sfIx3URl.png)

### List and use your variables
![List and use your variables](https://i.imgur.com/03B2tQHl.png)

### Remove a variable
![Remove a variable](https://i.imgur.com/bJhrD42l.png)

>(c) Screenshots are taken from Elgato Eve app
