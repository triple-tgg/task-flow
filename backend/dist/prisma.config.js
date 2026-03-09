"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const config_1 = require("prisma/config");
function getDatabaseUrl() {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    const host = process.env.DB_HOST || "localhost";
    const port = process.env.DB_PORT || "5432";
    const name = process.env.DB_NAME || "taskflow";
    const user = process.env.DB_USER || "taskflow_user";
    const password = process.env.DB_PASSWORD || "";
    const schema = process.env.DB_SCHEMA || "public";
    return `postgresql://${user}:${password}@${host}:${port}/${name}?schema=${schema}`;
}
exports.default = (0, config_1.defineConfig)({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: getDatabaseUrl(),
    },
});
//# sourceMappingURL=prisma.config.js.map