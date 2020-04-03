#!/usr/bin/env node

require("./../src/js/index.js").run().catch(function(error) {
    console.error(error);
    process.exit(3);
});