const fetch = require("node-fetch");
const db = require("../db");

const post = {
  title: "Test post",
  slug: "test",
  author: "Florian Hansen",
  categories: ["IoT", "Software-Entwicklung"],
  content: "## Test title",
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
  deletePost(post);

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
  console.log(response.post);

  expect(response.status).toBe(200);
  expect(response.post).not.toBeUndefined();
});
