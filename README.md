# myterminal

An all-day command-line companion

[![npm version](https://badge.fury.io/js/myterminal.svg)](https://badge.fury.io/js/myterminal)
[![npm downloads](https://img.shields.io/npm/dt/myterminal.svg)](https://www.npmjs.com/package/myterminal)  
[![Build Status](https://travis-ci.org/myTerminal/myterminal.svg?branch=master)](https://travis-ci.org/myTerminal/myterminal)
[![Code Climate](https://codeclimate.com/github/myTerminal/myterminal.png)](https://codeclimate.com/github/myTerminal/myterminal)
[![Package Quality](http://npm.packagequality.com/shield/myterminal.svg)](http://packagequality.com/#?package=myterminal)
[![Coverage Status](https://img.shields.io/coveralls/myTerminal/myterminal.svg)](https://coveralls.io/r/myTerminal/myterminal?branch=master)
[![bitHound Overall Score](https://www.bithound.io/github/myTerminal/myterminal/badges/score.svg)](https://www.bithound.io/github/myTerminal/myterminal)
[![bitHound Code](https://www.bithound.io/github/myTerminal/myterminal/badges/code.svg)](https://www.bithound.io/github/myTerminal/myterminal)  
[![Dependency Status](https://david-dm.org/myTerminal/myterminal.svg)](https://david-dm.org/myTerminal/myterminal)
[![devDependency Status](https://david-dm.org/myTerminal/myterminal/dev-status.svg)](https://david-dm.org/myTerminal/myterminal#info=devDependencies)
[![peer Dependency Status](https://david-dm.org/myTerminal/myterminal/peer-status.svg)](https://david-dm.org/myTerminal/myterminal#info=peerDependencies)  
[![License](https://img.shields.io/badge/LICENSE-GPL%20v3.0-blue.svg)](https://www.gnu.org/licenses/gpl.html)
[![Gratipay](http://img.shields.io/gratipay/myTerminal.svg)](https://gratipay.com/myTerminal)  
[![NPM](https://nodei.co/npm/myterminal.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/myterminal/)

## What is it?

*myterminal* is designed to be a command-line application that would help you perform repetitive tasks that you do all day long with the press of a single programmable key. It tends to be an interactive command-line interface that you would (hopefully) keep running in a terminal window on your workstation to perform a set of programmed tasks and present them to the user in a nested manner.

## Installation

*myterminal* is available on *Npm*. You can install it globally with a simple command.

    npm install -g myterminal

## How to Use

Run `myterminal-cli` or simply `myterminal` from the command line passing it a path to a JSON configuration file as shown in the [examples](examples). For example, if the configuration file is stored at your home directory, you can run it as

    myterminal-cli ~/configs.json

*myterminal* will start and the rest should be simple.

## Dependencies

* prompt
* clear

## To-do

* A lot of things, ideas floating around all over my mind

This is just a start!
