import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { execSync } from "child_process";

describe("Meals routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able to create meals", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "joao",
    });

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .send({
        name: "banana",
        description: "fruit",
        is_diet: true,
      })
      .set("Cookie", cookies)
      .expect(201);
  });

  it("should be able to list all meals", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "joao",
    });

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .send({
        name: "banana",
        description: "fruit",
        is_diet: true,
      })
      .set("Cookie", cookies);

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: "banana",
        description: "fruit",
        is_diet: 1,
      }),
    ]);
  });

  it("should be able to list one meals", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "joao",
    });

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .send({
        name: "banana",
        description: "fruit",
        is_diet: true,
      })
      .set("Cookie", cookies);

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = listMealsResponse.body.meals[0].id;

    const getMeal = await request(app.server)
      .get(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getMeal.body.meal).toEqual(
      expect.objectContaining({
        name: "banana",
        description: "fruit",
        is_diet: 1,
      }),
    );
  });

  it("should be able to update meal", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "joao",
    });

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .send({
        name: "banana",
        description: "fruit",
        is_diet: true,
      })
      .set("Cookie", cookies);

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = listMealsResponse.body.meals[0].id;

    await request(app.server)
      .put(`/meals/${mealId}`)
      .send({
        name: "banana",
        description: "fruit",
        is_diet: false,
      })
      .set("Cookie", cookies)
      .expect(204);
  });

  it("should be able to delete one meal", async () => {
    const createUserResponse = await request(app.server).post("/users").send({
      name: "joao",
    });

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .send({
        name: "banana",
        description: "fruit",
        is_diet: true,
      })
      .set("Cookie", cookies);

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = listMealsResponse.body.meals[0].id;

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(204);
  });
});
