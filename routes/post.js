const fs = require("fs");
const db = require("../db");
const path = require("path");
const ash = require("../wrap-async");
const matter = require("gray-matter");
const express = require("express");
const exprjwt = require("express-jwt");
const router = express.Router();

const verifyKeyFile = path.join(process.cwd(), "verify.key");
const verifyKey = fs.readFileSync(verifyKeyFile);

const jwt = exprjwt({ secret: verifyKey, algorithms: ["RS256"] });

router.post(
  "/",
  jwt,
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

router.put(
  "/:slug",
  jwt,
  ash(async (req, res) => {
    const { slug } = req.params;

    const updateQuery = await db.query(
      `
      UPDATE article
      SET content = $1,
          author = $2,
          title = $3,
          slug = $4,
          last_update = now()
      WHERE slug = $5
      RETURNING article.id;
      `,
      [req.body.content, req.body.author, req.body.title, req.body.slug, slug]
    );

    if (req.body.categories) {
      const postId = updateQuery.rows[0]?.id;
      await db.query(
        `
        DELETE FROM article_category_map
        WHERE article_id = $1;
        `,
        [postId]
      );

      for (let cat of req.body.categories) {
        await db.query(
          `
          INSERT
          INTO article_category_map (article_id, category_id)
          VALUES ($1, (SELECT id FROM category WHERE name = $2));
          `,
          [postId, cat]
        );
      }
    }

    res.status(200).json({
      status: 200,
      message: "Updated article successfully",
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
