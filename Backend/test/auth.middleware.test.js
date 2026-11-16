import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { verifyToken } from "../src/middlewares/auth.middleware.js";

process.env.JWT_SECRET = "test-secret-with-more-than-32-characters";

const invoke = (authorization) => {
  const req = { headers: { authorization } };
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  let nextCalled = false;
  verifyToken(req, res, () => {
    nextCalled = true;
  });
  return { req, res, nextCalled };
};

test("rejects requests without a bearer token", () => {
  const { res, nextCalled } = invoke(undefined);
  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
});

test("sets the authenticated identity from a verified token", () => {
  const token = jwt.sign(
    { id: 12, companyId: 34 },
    process.env.JWT_SECRET,
    { expiresIn: "1m" }
  );
  const { req, nextCalled } = invoke(`Bearer ${token}`);
  assert.equal(nextCalled, true);
  assert.equal(req.user.id, 12);
  assert.equal(req.user.companyId, 34);
});

test("rejects invalid tokens", () => {
  const { res, nextCalled } = invoke("Bearer invalid-token");
  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
});
