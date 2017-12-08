"use strict";var path=require("path"),os=require("os"),spawn=require("child_process").spawn,stdin=process.stdin,prompt=require("prompt"),chalk=require("chalk"),clear=require("clear"),fse=require("fs-extra"),version=require("../package.json").version,defaultConfigFilePath=path.resolve(os.homedir(),"myterminal-configs.json");module.exports=function(){var n,e,o,t,r=[],c=function(){i(),y()},i=function(){clear(),s(),a(),l(),u()},s=function(){var n=p("myterminal-cli v"+version);console.log(chalk.inverse.cyan(h(" "))),console.log(chalk.inverse.cyan(n)),console.log(chalk.inverse.cyan(h(" "))+"\n")},a=function(){var e=r.map(function(n,e){return r.slice(0,e+1)}).map(function(e,o){return e.reduce(function(n,e){return n.commands[e]},n)}).map(function(n){return n.title});console.log(chalk.cyan([n.title].concat(e).join(" -> ")+"\n"))},l=function(){console.log("Press a marked key to perform the respective operation\n")},u=function(){var t=k();v().forEach(function(n){return console.log(chalk.green("("+n+") ")+t.commands[n].title+(t.commands[n].commands?"...":""))}),d(),e&&console.log(chalk.green("(;) ")+"Select the last action"),o&&console.log(chalk.green("(.) ")+"Re-run the last command"),console.log(chalk.green("(/) ")+"Run a custom command"),t!==n?console.log(chalk.red("\n(q) ")+"Go back...\n"):console.log(chalk.red("\n(q) ")+"Quit\n")},f=function(n){console.log(chalk.inverse.green(p("Command: "+(n.title||n.task)))),console.log(chalk.inverse.white(p("Directory: "+x(n.directory)))),d()},m=function(){console.log("You can press ^-C to abort current task\n")},d=function(){console.log("")},p=function(n){var e=h(" ").length-n.length;return g(" ",Math.floor(e/2))+n+g(" ",Math.ceil(e/2))},h=function(n){return new Array(process.stdout.columns-1).join(",").split(",").map(function(){return n}).join("")},g=function(n,e){return new Array(e).join(",").split(",").map(function(){return n}).join("")},k=function(){return r.length?r.reduce(function(n,e){return n.commands[e]},n):n},v=function(){return Object.keys(k().commands)},y=function(){q(),stdin.on("data",j)},q=function(){stdin.setRawMode(!0),stdin.resume(),stdin.setEncoding("utf8")},j=function(t){if(stdin.removeListener("data",j),""===t)I();else if("/"===t)i(),m(),F();else if(";"===t)e?(i(),m(),C(e)):c();else if("."===t)o?(i(),m(),f(o),P(o.task,o.directory)):c();else if("q"===t)r.length||I(),r.pop(),c();else if(v().indexOf(t)>-1){var s=function(e){return r.length?r.reduce(function(n,e){return n.commands[e]},n).commands[e]:n.commands[e]}(t);s.task?(i(),m(),C(s)):(r.push(t),c())}else c()},w=function(n){""===n&&b()},x=function(n){return n||k().directory||"."},C=function(n){e=n,f(n),n.params?function(n){prompt.start(),prompt.get(n.params,function(e,o){try{var t=[n.task].concat(n.params.map(function(e,t){return o[n.params[t]]})).join(" ");P(t,n.directory)}catch(n){c()}})}(n):P(n.task,n.directory)},F=function(){prompt.start(),prompt.get(["custom-command","directory"],function(n,e){try{var o=x(e.directory);d(),C({title:e["custom-command"],task:e["custom-command"],directory:o})}catch(n){c()}})},P=function(n,e){var r=n.split(" "),c=r[0],i=r.slice(1),s=x(e);o={task:n,directory:s},(t=spawn(c,i,{cwd:s,stdio:[0,1,2],shell:!0})).on("close",A),q(),stdin.on("data",w)},b=function(){t.kill(),t=null},A=function(){console.log("\n"+chalk.green(h("-"))),t=null,stdin.removeListener("data",w),y()},I=function(){clear(),process.exit()};return process.on("SIGINT",function(){t?b():process.exit()}),{copyConfigFileIfNotPresent:function(){fse.copySync(path.resolve(__dirname,"../examples/configs.json"),defaultConfigFilePath,{overwrite:!1})},setConfigs:function(e){n=e},promptForAction:c}}();