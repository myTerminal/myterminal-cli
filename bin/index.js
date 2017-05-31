#!/usr/bin/env node
var path=require("path"),os=require("os"),stdin=process.stdin,spawn=require("child_process").spawn,version=require("../package.json").version,prompt=require("prompt"),clear=require("clear"),chalk=require("chalk"),fse=require("fs-extra"),args=process.argv,suppliedRelativeConfigPath=args[2],defaultConfigFilePath=path.resolve(os.homedir(),"myterminal-configs.json"),myterminalCliCompanion=function(){var n,e,o,t,r=[],i=function(){fse.copySync(path.resolve(__dirname,"../examples/configs.json"),defaultConfigFilePath,{overwrite:!1})},c=function(e){n=e},a=function(){s(),P()},s=function(){clear(),l(),u(),m(),f()},l=function(){var n=h("myterminal-cli v"+version);console.log(chalk.inverse.cyan(v(" "))),console.log(chalk.inverse.cyan(n)),console.log(chalk.inverse.cyan(v(" "))+"\n")},u=function(){var e=r.map(function(n,e){return r.slice(0,e+1)}).map(function(e,o){return e.reduce(function(n,e){return n.commands[e]},n)}).map(function(n){return n.title});console.log(chalk.cyan([n.title].concat(e).join(" -> ")+"\n"))},m=function(){console.log("Press a marked key to perform the respective operation\n")},f=function(){var t=k();C().forEach(function(n){console.log(chalk.green("("+n+") ")+t.commands[n].title+(t.commands[n].commands?"...":""))}),g(),console.log(chalk.green("(/) ")+"Run a custom command"),o&&console.log(chalk.green("(.) ")+"Re-run the last command"),e&&console.log(chalk.green("[space] ")+"Select the last action"),t!==n?console.log(chalk.red("\n(q) ")+"Go back...\n"):console.log(chalk.red("\n(q) ")+"Quit\n")},p=function(n){console.log(chalk.inverse.green(h("Command: "+n))+"\n")},d=function(){console.log("You can press ^-C to abort current task\n")},g=function(){console.log("")},h=function(n){var e=v(" ").length-n.length;return y(" ",Math.floor(e/2))+n+y(" ",Math.ceil(e/2))},v=function(n){return new Array(process.stdout.columns-1).join(",").split(",").map(function(){return n}).join("")},y=function(n,e){return new Array(e).join(",").split(",").map(function(){return n}).join("")},k=function(){return r.length?r.reduce(function(n,e){return n.commands[e]},n):n},C=function(){return Object.keys(k().commands)},q=function(e){return r.length?r.reduce(function(n,e){return n.commands[e]},n).commands[e]:n.commands[e]},P=function(){R(),stdin.on("data",x)},j=function(){stdin.removeListener("data",x)},w=function(){R(),stdin.on("data",A)},F=function(){stdin.removeListener("data",A)},R=function(){stdin.setRawMode(!0),stdin.resume(),stdin.setEncoding("utf8")},b=function(){process.on("SIGINT",function(){t?S():process.exit()})},x=function(n){if(j(),""===n)G();else if("/"===n)s(),d(),M();else if(" "===n)e?(s(),d(),E(e)):a();else if("."===n)o?(s(),d(),p("(previously run command)"),N(o.command,o.directory)):a();else if("q"===n)r.length||G(),r.pop(),a();else if(C().indexOf(n)>-1){var t=q(n),i=t.task;i?(s(),d(),E(t)):(r.push(n),a())}else a()},A=function(n){""===n&&S()},I=function(n){prompt.start(),prompt.get(n.params,function(e,o){try{var t=[n.task].concat(n.params.map(function(e,t){return o[n.params[t]]})).join(" ");N(t,n.directory)}catch(n){a()}})},E=function(n){e=n,p(n.title),n.params?I(n):N(n.task,n.directory)},M=function(){prompt.start(),prompt.get(["custom-command","directory"],function(n,e){try{var o=e.directory||".";g(),E({title:e["custom-command"]+" in "+o,task:e["custom-command"],directory:o})}catch(n){a()}})},N=function(n,e){var r=n.split(" "),i=r[0],c=r.slice(1);o={command:n,directory:e},t=spawn(i,c,{cwd:e,stdio:[0,1,2],shell:!0}),t.on("close",_),w()},S=function(){t.kill(),t=null},_=function(){console.log("\n"+chalk.green(v("-"))),t=null,F(),P()},G=function(){clear(),process.exit()};return b(),{copyConfigFileIfNotPresent:i,setConfigs:c,promptForAction:a}}();prompt.message="Enter the value for ",prompt.delimiter="";var absoluteConfigPath=suppliedRelativeConfigPath?path.resolve(process.cwd(),suppliedRelativeConfigPath):defaultConfigFilePath;myterminalCliCompanion.copyConfigFileIfNotPresent(),myterminalCliCompanion.setConfigs(require(absoluteConfigPath)),myterminalCliCompanion.promptForAction();