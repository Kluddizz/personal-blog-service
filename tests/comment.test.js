const db = require("../db");
const fetch = require("node-fetch");
const { post, comment } = require("./helpers/dummies");
const {
  insertPost,
  insertComment,
  deletePost,
  deleteComment,
} = require("./helpers/functions");

describe("Comments", () => {
  let postId = null;

  beforeAll(async () => {
    postId = await insertPost(post);
  });

  afterAll(async () => {
    await deletePost(post);
    postId = null;
  });

  test("Delete a comment", async () => {
    expect.assertions(1);
    const commentId = await insertComment(comment, postId);

    const request = await fetch(`http://localhost:5002/comment/${commentId}`, {
      method: "DELETE",
    });

    const response = await request.json();
    await deleteComment(commentId);

    expect(response.status).toBe(200);
  });
});
