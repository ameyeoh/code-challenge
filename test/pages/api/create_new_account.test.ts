import { expect } from "@jest/globals";
import createNewAccount from "src/pages/api/create_new_account";
import { mockRequest } from "test/utils";

describe("/api/create_new_account", () => {
  test("return true for valid entries", async () => {
    const { req, res } = mockRequest({
      method: "POST",
      body: {
        username: "testusername",
        password: "weakpass@123%456&789",
      },
    });

    await createNewAccount(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      result: true,
    });
  });

  test("allow account creation for exposed password", async () => {
    const { req, res } = mockRequest({
      method: "POST",
      body: {
        username: "testusername",
        password: "weakpass",
      },
    });

    await createNewAccount(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      result: true,
    });
  });

  test("return false for missing entries", async () => {
    const { req, res } = mockRequest({
      method: "POST",
      body: {
        username: "",
        password: "weakpass@123%456&789",
      },
    });

    await createNewAccount(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({
      result: false,
    });
  });
});
