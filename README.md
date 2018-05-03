# myterminal

[![npm version](https://badge.fury.io/js/myterminal.svg)](https://badge.fury.io/js/myterminal)
[![npm downloads](https://img.shields.io/npm/dt/myterminal.svg)](https://www.npmjs.com/package/myterminal)  
[![Build Status](https://travis-ci.org/myTerminal/myterminal.svg?branch=master)](https://travis-ci.org/myTerminal/myterminal)
[![Code Climate](https://codeclimate.com/github/myTerminal/myterminal.png)](https://codeclimate.com/github/myTerminal/myterminal)
[![Coverage Status](https://img.shields.io/coveralls/myTerminal/myterminal.svg)](https://coveralls.io/r/myTerminal/myterminal?branch=master)  
[![Dependency Status](https://david-dm.org/myTerminal/myterminal.svg)](https://david-dm.org/myTerminal/myterminal)
[![devDependency Status](https://david-dm.org/myTerminal/myterminal/dev-status.svg)](https://david-dm.org/myTerminal/myterminal#info=devDependencies)
[![peer Dependency Status](https://david-dm.org/myTerminal/myterminal/peer-status.svg)](https://david-dm.org/myTerminal/myterminal#info=peerDependencies)  
[![License](https://img.shields.io/badge/LICENSE-GPL%20v3.0-blue.svg)](https://www.gnu.org/licenses/gpl.html)  
[![NPM](https://nodei.co/npm/myterminal.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/myterminal/)

An all-day command-line companion

![Demo](images/demo.gif)

## What is it?

*myterminal* is designed to be a command-line application that would help you perform repetitive tasks that you do all day long with the press of a single programmable key. It tends to be an interactive command-line interface that you would (hopefully) keep running in a terminal window on your workstation to perform a set of programmed tasks and present them to the user in a nested manner.

## Features

* Configure long commands to be invoked with a single key-stroke
* Nest similar or related commands in a menu
* Specify parameters for commands
* Configure working directories for commands or a group of commands
* Re-perform the last action with a *(\\)*
* Re-run the last command with a *(.)*
* Run a custom command, which can later become the 'last' command

## Installation

*myterminal* is available on *Npm*. You can install it globally with a simple command.

    npm install -g myterminal

## How to Use

Run `myterminal-cli` or simply `myterminal` from the command line passing it a path to a JSON configuration file as shown in the [examples](examples). For example, if the configuration file is stored at your home directory, you can run it as

    myterminal-cli --config=~/configs.json

*myterminal* will start and the rest should be simple.

You can also start *myterminal* without supplying the configuration file path, in which case it will start with a configuration file named *myterminal-configs.json* placed at your home (~/) directory. If the file does not exist, it will be created when the application is started for the first time.

**Note:** Since the upgrade to version 2, *myterminal* uses an entirely new interface which does not work well on Windows. Hence *myterminal* starts in legacy mode in Windows, which means almost the same functionality, with the old interface.

To force the modern mode in Windows, start *myterminal* as

    myterminal-cli --modern

and to force legacy mode on a *better* computer, start it as

    myterminal-cli --legacy

## Configuration

The configuration file should contain a valid JSON. It consists of nodes having a *title* and a subtree called *commands*. Each of these nodes hold a group of commands. The tree within contains a single character with which the group can be selected while the application is running. When a node has a property *task* instead of *commands*, it is treated as a command to be executed, rather than a group of commands.

Each command has a *title*, a *task* and optionally an array of *params*. These params are prompted to be entered by the user while executing the *task* and are appended to the task separated by spaces, in sequence as they appear in the *params* array to form the final command to be executed.

Each of the items, be it a command or a group of commands, can have a defined *directory*, within which the command or the group of commands are executed. Note that when a *directory* is specified for a specific *task* and it also has a *directory* specified for the entire group containing the *task*, the *directory* for the *task* takes precedence.

## Dependencies

* [blessed](https://www.npmjs.com/package/blessed)
* [yargs](https://www.npmjs.com/package/yargs)
* [prompt](https://www.npmjs.com/package/prompt)
* [clear](https://www.npmjs.com/package/clear)
* [chalk](https://www.npmjs.com/package/chalk)
* [fs-extra](https://www.npmjs.com/package/fs-extra)

## To-do

* Repeating tasks
