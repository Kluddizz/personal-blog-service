const fetch = require("node-fetch");
const db = require("../db");
const { post, comment } = require("./helpers/dummies");
const { insertPost, deletePost } = require("./helpers/functions");

describe("Post", () => {
  beforeAll(async () => {
    await deletePost(post);
  });

  afterAll(async () => {
    await deletePost(post);
  });

  test("Create new post", async () => {
    expect.assertions(1);

    const request = await fetch("http://localhost:5002/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post),
    });

    const response = await request.json();
    await deletePost(post);

    expect(response.status).toBe(200);
  });

  test("Update post", async () => {
    expect.assertions(2);
    const postId = await insertPost(post);
    const updatedPost = { ...post, categories: ["IoT"] };

    const request = await fetch(`http://localhost:5002/post/${post.slug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedPost),
    });

    const response = await request.json();

    const categoryQuery = await db.query(
      `
      SELECT *
      FROM article_category_map
      WHERE article_id = $1;
      `,
      [postId]
    );

    await deletePost(updatedPost);
    await deletePost(post);

    expect(response.status).toBe(200);
    expect(categoryQuery.rows.length).toBe(1);
  });

  test("Get post", async () => {
    expect.assertions(2);
    await insertPost(post);

    const request = await fetch(`http://localhost:5002/post/${post.slug}`, {
      method: "GET",
    });

    const response = await request.json();
    await deletePost(post);

    expect(response.status).toBe(200);
    expect(response.post).not.toBeUndefined();
  });

  test("Get post", async () => {
    expect.assertions(2);

    const request = await fetch(`http://localhost:5002/post`, {
      method: "GET",
    });

    const response = await request.json();

    expect(response.status).toBe(200);
    expect(response.posts).not.toBeUndefined();
  });

  test("Get categories", async () => {
    expect.assertions(2);
    await insertPost(post);

    const request = await fetch(
      `http://localhost:5002/post/${post.slug}/categories`
    );

    const response = await request.json();
    await deletePost(post);

    expect(response.status).toBe(200);
    expect(response.categories).not.toBeUndefined();
  });
});
