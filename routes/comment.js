const db = require("../db");
const ash = require("../wrap-async");
const express = require("express");

const router = express.Router();

router.delete(
  "/:id",
  ash(async (req, res) => {
    const { id } = req.params;

    await db.query(
      `
    DELETE FROM comment
    WHERE id = $1;
    `,
      [id]
    );

    res.status(200).json({
      status: 200,
      message: "Comment was deleted successfully",
    });
  })
);

module.exports = router;
