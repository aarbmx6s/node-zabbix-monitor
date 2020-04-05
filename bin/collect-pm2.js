#!/usr/bin/env node

require("./../src/js/pm2.js").run().catch(function(error) {
    console.error(error);
    process.exit(1);
});