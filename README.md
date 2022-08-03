# myterminal-cli

[![npm version](https://badge.fury.io/js/myterminal-cli.svg)](https://badge.fury.io/js/myterminal-cli)
[![npm downloads](https://img.shields.io/npm/dt/myterminal-cli.svg)](https://www.npmjs.com/package/myterminal-cli)
[![License](https://img.shields.io/github/license/myTerminal/myterminal-cli.svg)](https://opensource.org/licenses/MIT)  
[![Build Status](https://travis-ci.org/myTerminal/myterminal-cli.svg?branch=master)](https://travis-ci.org/myTerminal/myterminal-cli)
[![Code Climate](https://codeclimate.com/github/myTerminal/myterminal-cli.png)](https://codeclimate.com/github/myTerminal/myterminal-cli)
[![js-myterminal-style](https://img.shields.io/badge/code%20style-myterminal-blue.svg)](https://www.npmjs.com/package/eslint-config/myterminal)
[![Coverage Status](https://img.shields.io/coveralls/myTerminal/myterminal-cli.svg)](https://coveralls.io/r/myTerminal/myterminal-cli?branch=master)  
[![NPM](https://nodei.co/npm/myterminal-cli.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/myterminal-cli/)

An all-day command-line companion

![Demo](images/demo.gif)

## What is it?

*myterminal-cli* is a command-line application created to help you perform repetitive tasks that you might be performing all day long with the press of a single programmable key. It tends to be an interactive command-line interface that you can keep running in a terminal window on your workstation to perform a set of programmed tasks and present via a menu-driven interface.

## Features

* Configure long commands to be invoked with a single key-stroke
* Nest similar or related commands in a menu-based hierarchy
* Specify parameters for commands
* Configure working directories for commands or a group of commands
* Re-perform the last action with a *(\\)*
* Re-run the last command with a *(.)*
* Run a custom command, which can later also become the 'last' command

## Installation

*myterminal-cli* is available on *Npm*. You can install it globally with a simple command.

    npm install -g myterminal-cli

## How to Use

Run `myterminal-cli` or simply `myterminal` from the command line passing it a path to a JSON configuration file as shown in the [examples](examples). For example, if the configuration file is stored at your home directory, you can run it as

    myterminal-cli --config=~/configs.json

*myterminal-cli* will start and the rest should all be simple.

You can also start *myterminal-cli* without supplying the configuration file path, in which case it will start with a configuration file named *myterminal-cli-configs.json* placed at your home (~/) directory. If the file does not exist, it will be created when the application is started for the first time.

### Legacy Mode

Since version 2, *myterminal-cli* uses an entirely new interface which does not work well on Windows. Hence *myterminal-cli* starts in the legacy mode in Windows, which means almost the same functionality, with the old interface.

To force the modern mode in Windows, start *myterminal-cli* as

    myterminal-cli --modern

and to force legacy mode on a *better* computer, start it as

    myterminal-cli --legacy

**Note:** *Legacy mode is no longer available starting version 2.2.* If you need legacy mode, consider using older versions. One way of doing that is specifying the version during installation.

    npm install -g myterminal-cli@1.2

## Configuration

The configuration file should contain a valid JSON. It consists of nodes having a *title* and a subtree called *commands*. Each of these nodes holds a group of commands. The tree contains a single character with which the group can be selected while the application is running. When a node has a property *task* instead of *commands*, it is treated as a command to be executed, rather than a group of commands.

Each command has a *title*, a *task* and optionally an array of *params*. These params are prompted to be entered by the user while executing the *task* and are appended to the task separated by spaces, in sequence as they appear in the *params* array to form the final command to be executed.

Each of the items, be it a command or a group of commands, can have a defined *directory*, within which the command or the group of commands are executed. Note that when a *directory* is specified for a specific *task* and it also has a *directory* specified for the entire group containing the *task*, the *directory* for the *task* takes precedence.

## To-do

* Repeating tasks
