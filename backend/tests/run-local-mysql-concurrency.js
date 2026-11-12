// One-command local XAMPP MariaDB concurrency runner.
// Run inside backend: node tests/run-local-mysql-concurrency.js
// NEVER loads .env or opens the resort's Aiven database.
// Creates an ephemeral test user with privileges restricted to randomized
// smartresort_concurrency_ schemas, then cleans up the schema and user.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const mysql = require("mysql2/promise");

const HOST = "127.0.0.1";
const PORT = 3306;
const MACHINE = "Genesis";
const USER = "smartresort_lock_test";
const ACCOUNT = "'smartresort_lock_test'@'127.0.0.1'";
const SCHEMA = "smartresort_concurrency_" + crypto.randomBytes(7).toString("hex");
const tick = String.fromCharCode(96);
const GRANT_SCOPE = tick + "smartresort\\_concurrency\\_%" + tick + ".*";

async function main() {
  let root = null;
  let userCreated = false;
  let dbAbsent = false;
  try {
    assert.match(SCHEMA, /^smartresort_concurrency_[0-9a-f]{14}$/);
    root = await mysql.createConnection({
      host: HOST, port: PORT, user: "root", password: "",
      connectTimeout: 5000, multipleStatements: false
    });
    const [[server]] = await root.query(
      "SELECT @@hostname AS hostname, @@version AS version, " +
      "@@port AS port, DATABASE() AS selected_db, CURRENT_USER() AS login"
    );
    assert.equal(String(server.hostname).toLowerCase(), MACHINE.toLowerCase(),
      "Wrong server. Only the verified local XAMPP instance is allowed.");
    assert.match(String(server.version), /mariadb/i, "Not the expected XAMPP MariaDB.");
    assert.equal(Number(server.port), PORT);
    assert.equal(server.selected_db, null);
    assert.match(String(server.login), /^root@/i);
    const [[account]] = await root.query(
      "SELECT COUNT(*) AS n FROM mysql.user WHERE User = ? AND Host = ?",
      [USER, HOST]
    );
    assert.equal(Number(account.n), 0, "Test user already exists. Refusing to modify it.");
    const [[existing]] = await root.query(
      "SELECT COUNT(*) AS n FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?",
      [SCHEMA]
    );
    assert.equal(Number(existing.n), 0, "Generated schema already exists.");
    dbAbsent = true;

    const password = crypto.randomBytes(24).toString("hex");
    await root.query("CREATE USER " + ACCOUNT + " IDENTIFIED BY ?", [password]);
    userCreated = true;
    await root.query("GRANT CREATE, DROP, SELECT, INSERT, UPDATE, DELETE, " +
      "ALTER, INDEX, REFERENCES ON " + GRANT_SCOPE + " TO " + ACCOUNT);

    const verify = await mysql.createConnection({
      host: HOST, port: PORT, user: USER, password, connectTimeout: 5000
    });
    try {
      const [[login]] = await verify.query("SELECT CURRENT_USER() AS account");
      assert.match(String(login.account),
        /^smartresort_lock_test@127\.0\.0\.1$/i);
    } finally {
      await verify.end();
    }
    console.log("Verified local:", server.hostname, server.version);
    console.log("Running isolated real InnoDB concurrent booking tests...");
    const run = spawnSync(process.execPath, ["--test",
      path.join(__dirname, "frontdesk-mysql-concurrency.integration.test.js")], {
      stdio: "inherit", timeout: 60000,
      env: {
        ...process.env,
        SMARTRESORT_ALLOW_LOCAL_MYSQL_TEST: "LOCAL_DISPOSABLE_MYSQL_ONLY",
        SMARTRESORT_TEST_MYSQL_HOST: HOST,
        SMARTRESORT_TEST_MYSQL_PORT: String(PORT),
        SMARTRESORT_TEST_MYSQL_USER: USER,
        SMARTRESORT_TEST_MYSQL_PASSWORD: password,
        SMARTRESORT_TEST_EXPECTED_HOSTNAME: MACHINE,
        SMARTRESORT_TEST_SCHEMA: SCHEMA
      }
    });
    if (run.error) throw run.error;
    if (run.status !== 0) {
      console.error("Real MariaDB concurrency test FAILED. See results above.");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("Local test stopped safely:", error.message);
    process.exitCode = 1;
  } finally {
    if (root) {
      if (dbAbsent) {
        try {
          await root.query("DROP DATABASE IF EXISTS " + SCHEMA);
          console.log("Temporary test schema cleaned up.");
        } catch (e) {
          console.error("Manual review needed for test schema:", SCHEMA, e.message);
          process.exitCode = 1;
        }
      }
      if (userCreated) {
        try {
          await root.query("DROP USER " + ACCOUNT);
          console.log("Temporary test user cleaned up.");
        } catch (e) {
          console.error("Temporary test user cleanup error:", e.message);
          process.exitCode = 1;
        }
      }
      await root.end();
    }
  }
}
main().catch((error) => {
  console.error("Unexpected runner failure:", error.message);
  process.exitCode = 1;
});
