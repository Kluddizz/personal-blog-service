const db = require("../db");
const path = require("path");
const ash = require("../wrap-async");
const matter = require("gray-matter");
const express = require("express");
const router = express.Router();

router.post(
  "/",
  ash(async (req, res) => {
    const { title, slug, author, categories, content } = req.body;

    const postQuery = await db.query(
      `
      INSERT INTO article (title, slug, author, content)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
      `,
      [title, slug, author, content]
    );

    const postId = postQuery.rows[0]?.id;

    if (categories) {
      for (let cat of categories) {
        const catQuery = await db.query(
          `
          SELECT id
          FROM category
          WHERE name = $1
          LIMIT 1;
          `,
          [cat]
        );

        if (catQuery.rows.length > 0) {
          const mapQuery = await db.query(
            `
            INSERT INTO article_category_map (article_id, category_id)
            VALUES ($1, $2);
            `,
            [postId, catQuery.rows[0].id]
          );
        }
      }
    }

    res.status(200).json({
      status: 200,
      message: "Post has been created successfully",
    });
  })
);

router.get(
  "/",
  ash(async (req, res) => {
    const query = await db.query(
      `
    SELECT *
    FROM article;
    `,
      []
    );

    res.status(200).json({
      status: 200,
      posts: query.rows,
    });
  })
);

router.get(
  "/:slug/categories",
  ash(async (req, res) => {
    const { slug } = req.params;

    const query = await db.query(
      `
    SELECT category.name
    FROM category
    JOIN article_category_map
      ON category.id = article_category_map.category_id
    JOIN article
      ON article.id = article_category_map.article_id
    WHERE article.slug = $1;
    `,
      [slug]
    );

    res.status(200).json({
      status: 200,
      categories: query.rows.map((c) => c.name),
    });
  })
);

router.get(
  "/:slug",
  ash(async (req, res) => {
    const { slug } = req.params;

    const getQuery = await db.query(
      `
    SELECT *
    FROM article
    WHERE slug = $1;
    `,
      [slug]
    );

    const catQuery = await db.query(
      `
    SELECT category.name
    FROM category
    JOIN article_category_map
      ON category.id = article_category_map.category_id
    JOIN article
      ON article.id = article_category_map.article_id
    WHERE article.slug = $1;
    `,
      [slug]
    );

    if (getQuery.rows.length > 0) {
      const post = getQuery.rows[0];
      const categories = catQuery.rows.map((c) => c.name);

      const matterString = matter.stringify(post.content, {
        title: post.title,
        author: post.author,
        date: post.creation_date,
        categories: categories,
        slug: post.slug,
      });

      res.status(200).json({
        status: 200,
        post: matterString,
      });
    } else {
      res.status(500).json({
        status: 500,
        message: "There is no post with the given slug",
      });
    }
  })
);

module.exports = router;
