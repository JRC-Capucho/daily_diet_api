import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { randomUUID } from "crypto";

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook("preHandler", (request, reply, done) => {
    const { sessionId } = request.cookies;

    if (!sessionId)
      return reply.status(401).send({
        error: "Unauthorized.",
      });

    done();
  });

  app.post("/", async (request, reply) => {
    const mealsRequestBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      is_diet: z.boolean(),
    });

    const { name, is_diet, description } = mealsRequestBodySchema.parse(
      request.body,
    );

    const { sessionId } = request.cookies;

    await knex("meals").insert({
      id: randomUUID(),
      name,
      is_diet,
      description,
      user_id: sessionId,
    });

    return reply.status(201).send();
  });

  app.put("/:id", async (request, reply) => {
    const mealsRequestParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const mealsRequestBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      is_diet: z.boolean(),
    });

    const { id } = mealsRequestParamsSchema.parse(request.params);

    const { name, description, is_diet } = mealsRequestBodySchema.parse(
      request.body,
    );

    const { sessionId } = request.cookies;

    await knex("meals")
      .where({
        id,
        user_id: sessionId,
      })
      .update({
        name,
        description,
        is_diet,
      });

    return reply.status(204).send();
  });

  app.delete("/:id", async (request, reply) => {
    const mealsRequestParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { sessionId } = request.cookies;

    const { id } = mealsRequestParamsSchema.parse(request.params);

    await knex("meals")
      .where({
        id,
        user_id: sessionId,
      })
      .delete();

    return reply.status(204).send();
  });

  app.get("/", async (request, reply) => {
    const { sessionId } = request.cookies;

    const meals = await knex("meals")
      .where({
        user_id: sessionId,
      })
      .select();

    return { meals };
  });

  app.get("/:id", async (request, reply) => {
    const { sessionId } = request.cookies;

    const mealsRequestParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = mealsRequestParamsSchema.parse(request.params);

    const meal = await knex("meals")
      .where({
        id,
        user_id: sessionId,
      })
      .first();

    return { meal };
  });

  app.get("/metrics", async (request) => {
    const { sessionId } = request.cookies;

    const meals = await knex("meals")
      .where("user_id", sessionId)
      .count("*", { as: "total" })
      .first();

    const mealsDiet = await knex("meals")
      .where({
        user_id: sessionId,
        is_diet: true,
      })
      .count("*", { as: "total" })
      .first();

    const mealsWithoutDiet = await knex("meals")
      .where({
        user_id: sessionId,
        is_diet: false,
      })
      .count("*", { as: "total" })
      .first();

    const streakMealsDiet = await knex("meals")
      .where("user_id", sessionId)
      .orderBy("created_at", "asc");

    let streak = 0;
    const countStreak = streakMealsDiet.map((item) => {
      if (item.is_diet) streak++;
      else streak = 0;

      return streak;
    });

    return {
      meals,
      mealsDiet,
      mealsWithoutDiet,
      countStreak: countStreak[countStreak.length - 1],
    };
  });
}
