import { expect } from "@jest/globals";
import passwordExposed from "src/pages/api/password_exposed";
import { mockRequest } from "test/utils";

/**
 * You won't need to change anything in this file.
 * Use it as a reference for how to write tests for the "/api/create_new_account" endpoint.
 */
describe("/api/password_exposed", () => {
  test("returns true for exposed password", async () => {
    const { req, res } = mockRequest({
      method: "POST",
      body: {
        password: "weakpass",
      },
    });

    await passwordExposed(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      result: true,
    });
  });

  test("returns false for non-exposed password", async () => {
    const { req, res } = mockRequest({
      method: "POST",
      body: {
        password: "others",
      },
    });

    await passwordExposed(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      result: false,
    });
  });
});
