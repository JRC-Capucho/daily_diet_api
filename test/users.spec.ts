import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { execSync } from "child_process";

describe("Users routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    execSync("npm run knex migrate:rollback --all");
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able to create user", async () => {
    await request(app.server)
      .post("/users")
      .send({
        name: "joao",
      })
      .expect(201);
  });
});
