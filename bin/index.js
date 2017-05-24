#!/usr/bin/env node
var path=require("path"),os=require("os"),stdin=process.stdin,spawn=require("child_process").spawn,version=require("../package.json").version,prompt=require("prompt"),clear=require("clear"),chalk=require("chalk"),fse=require("fs-extra"),args=process.argv,suppliedRelativeConfigPath=args[2],defaultConfigFilePath=path.resolve(os.homedir(),"myterminal-configs.json"),myterminalCliCompanion=function(){var n,e,o,t=[],i=function(){fse.copySync(path.resolve(__dirname,"../examples/configs.json"),defaultConfigFilePath,{overwrite:!1})},r=function(e){n=e},c=function(){a(),d()},a=function(){s(),u(),m()},s=function(){var n=l("myterminal-cli v"+version);clear(),console.log(chalk.inverse.cyan(j(" "))),console.log(chalk.inverse.cyan(n)),console.log(chalk.inverse.cyan(j(" "))+"\n")},l=function(n){var e=j(" ").length-n.length;return x(" ",Math.floor(e/2))+n+x(" ",Math.ceil(e/2))},u=function(){var e=t.map(function(n,e){return t.slice(0,e+1)}).map(function(e,o){return e.reduce(function(n,e){return n.commands[e]},n)}).map(function(n){return n.title});console.log(chalk.cyan([n.title].concat(e).join(" -> ")+"\n"))},m=function(){var o=f();p().forEach(function(n){o.commands[n].command?console.log(chalk.yellow(n+": ["+o.commands[n].title+"]")):console.log(chalk.yellow(n+": "+o.commands[n].title))}),console.log(chalk.yellow("\nPress '/' to run a custom command")),e&&console.log(chalk.yellow("Press [space] to re-run the last command")),o!==n?console.log(chalk.red("\nq: Go back...")+"\n"):console.log(chalk.red("\nq: Quit")+"\n")},f=function(){return t.length?t.reduce(function(n,e){return n.commands[e]},n):n},p=function(){return Object.keys(f().commands)},d=function(){y(),stdin.on("data",k)},h=function(){stdin.removeListener("data",k)},g=function(){y(),stdin.on("data",C)},v=function(){stdin.removeListener("data",C)},y=function(){stdin.setRawMode(!0),stdin.resume(),stdin.setEncoding("utf8")},k=function(n){if(h(),""===n)S();else if("/"===n)a(),q();else if(" "===n)e?(a(),P(e)):c();else if("q"===n)t.length||S(),t.pop(),c();else if(p().indexOf(n)>-1){var o=w(n),i=o.task;i?(a(),P(o)):(t.push(n),c())}else c()},C=function(n){""===n&&N()},w=function(e){return t.length?t.reduce(function(n,e){return n.commands[e]},n).commands[e]:n.commands[e]},q=function(){prompt.start(),prompt.get(["custom-command","directory"],function(n,e){P({title:e["custom-command"]+" in "+e.directory,task:e["custom-command"],directory:e.directory})})},P=function(n){e=n,console.log(chalk.inverse.green(l("Command: "+n.title))+"\n"),n.params?I(n):F(n.task,n.directory)},j=function(n){return new Array(process.stdout.columns-1).join(",").split(",").map(function(){return n}).join("")},x=function(n,e){return new Array(e).join(",").split(",").map(function(){return n}).join("")},F=function(n,e){var t=n.split(" "),i=t[0],r=t.slice(1);o=spawn(i,r,{cwd:e,stdio:[0,1,2],shell:!0}),o.on("close",b),g()},N=function(){o.kill(),o=null},b=function(){console.log("\n"+chalk.green(j("-"))),o=null,v(),d()},I=function(n){prompt.start(),prompt.get(n.params,function(e,o){var t=[n.task].concat(n.params.map(function(e,t){return o[n.params[t]]})).join(" ");F(t,n.directory)})},R=function(){process.on("SIGINT",function(){o?N():process.exit()})},S=function(){clear(),process.exit()};return R(),{copyConfigFileIfNotPresent:i,setConfigs:r,showNextScreen:c}}();prompt.message="Enter the value for ",prompt.delimiter="";var absoluteConfigPath=suppliedRelativeConfigPath?path.resolve(process.cwd(),suppliedRelativeConfigPath):defaultConfigFilePath;myterminalCliCompanion.copyConfigFileIfNotPresent(),myterminalCliCompanion.setConfigs(require(absoluteConfigPath)),myterminalCliCompanion.showNextScreen();