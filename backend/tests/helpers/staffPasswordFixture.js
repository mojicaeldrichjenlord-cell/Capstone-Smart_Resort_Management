// Shared synthetic bcrypt hash for isolated authentication regression tests.
// Never use this fixed test password/hash in the application or production.
// Matches "ValidHousekeeping123!" for the Housekeeping login fixtures.
// Created once per Node test process, so signed staff tokens and fake DB users
// share the same hash, including across beforeEach() resets.
module.exports = require("bcrypt").hashSync("ValidHousekeeping123!", 8);
