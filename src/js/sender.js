const { exec, spawn } = require("child_process");
const tools = require("./tools.js");

function mongostat() {
    let child = exec("mongostat 5 --humanReadable=false --json");

    child.on("error", function(error) {
        console.error(error);
        process.exit(100);
    });
    child.on("exit", function(code, signal) {
        console.error(new Error(`Process has been exited with ${code} code.`));
        process.exit(101);
    });

    child.stderr.pipe(child.stderr);

    child.stdout.on("data", function(chunk) {
        console.log(">>>");
        console.log(chunk);
        console.log("<<<");
    });
}

mongostat();