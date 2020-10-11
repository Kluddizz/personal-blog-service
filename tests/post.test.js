const fetch = require("node-fetch");
const db = require("../db");

const post = {
  title: "Test post",
  slug: "test",
  author: "Florian Hansen",
  categories: ["IoT", "Software-Entwicklung"],
  content: "## Test title",
};

const comment = {
  author: "Florian Hansen",
  content: "Test comment",
};

const insertPost = async (post) => {
  const query = await db.query(
    `
    INSERT INTO article (title, slug, author, content)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
    `,
    [post.title, post.slug, post.author, post.content]
  );

  return query.rows[0]?.id;
};

const deletePost = async (post) => {
  const query = await db.query(
    `
    DELETE FROM article
    WHERE slug = $1;
    `,
    [post.slug]
  );
};

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

  test("Create comment to post", async () => {
    expect.assertions(2);
    const postId = await insertPost(post);

    const request = await fetch(
      `http://localhost:5002/post/${post.slug}/comment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(comment),
      }
    );

    const response = await request.json();

    const checkQuery = await db.query(
      `
      SELECT *
      FROM comment
      WHERE article_id = $1;
      `,
      [postId]
    );

    await deletePost(post);

    expect(response.status).toBe(200);
    expect(checkQuery.rows.length).toBe(1);
  });

  test("Get all comments of a post", async () => {
    expect.assertions(3);
    await insertPost(post);

    await fetch(`http://localhost:5002/post/${post.slug}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(comment),
    });

    const request = await fetch(
      `http://localhost:5002/post/${post.slug}/comments`
    );
    const response = await request.json();
    await deletePost(post);

    expect(response.status).toBe(200);
    expect(response.comments).not.toBeUndefined();
    expect(response.comments.length).toBeGreaterThan(0);
  });
});
