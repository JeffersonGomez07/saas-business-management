import test from "node:test";
import assert from "node:assert/strict";
import { generarCodigoVenta } from "../src/utils/generarCodigoVenta.js";

test("sale codes are unique across companies and increment per company", () => {
  assert.equal(generarCodigoVenta(undefined, 5), "V5-0001");
  assert.equal(generarCodigoVenta("V5-0001", 5), "V5-0002");
  assert.equal(generarCodigoVenta(undefined, 6), "V6-0001");
});
