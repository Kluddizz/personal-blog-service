const db = require("../../db");

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

module.exports = { insertPost, deletePost, insertComment, deleteComment };
