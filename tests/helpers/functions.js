const fetch = require("node-fetch");
const path = require("path");
const db = require("../../db");

const LOGIN_SERVICE = "http://localhost:5003";

const login = async () => {
  const credentialFile = path.join(
    process.cwd(),
    "tests/helpers/loginCredentials.json"
  );
  const credentials = require(credentialFile);

  const request = await fetch(`${LOGIN_SERVICE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const response = await request.json();
  return response.token;
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

const insertComment = async (comment, postId) => {
  const query = await db.query(
    `
    INSERT INTO comment (author, content, article_id)
    VALUES ($1, $2, $3)
    RETURNING id;
    `,
    [comment.author, comment.content, postId]
  );

  return query.rows[0]?.id;
};

const deleteComment = async (id) => {
  const query = await db.query(
    `
    DELETE FROM comment
    WHERE id = $1;
    `,
    [id]
  );
};

module.exports = {
  login,
  insertPost,
  deletePost,
  insertComment,
  deleteComment,
};
