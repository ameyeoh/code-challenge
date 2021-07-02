import { render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { act } from "react-dom/test-utils";
import { useForm } from "src/components/useForm";
import userEvent from "@testing-library/user-event";
import fetchMock from "jest-fetch-mock";
import CreateAccount from "src/pages/create_account";
import { ChangeEvent } from "react";

interface TestData {
  username: string;
  password: string;
}

describe("useForm", () => {
  const getTestEvent = (value: any = "") =>
    ({
      preventDefault: jest.fn(),
      target: { value },
    } as unknown as ChangeEvent<any>);

  const sampleValidations = {
    username: {
      pattern: {
        value: "^.{10,50}$",
        message: "Username should be between 10 and 50 characters long",
      },
      custom: {
        isValid: (value) => !/\s/.test(value),
        message: "Username should not contain whitespace",
      },
    },
    password: {
      pattern: {
        value: "^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[$@$!%*?&.]).{1,}$",
        message:
          "Password should contain at least 1 symbol, 1 letter and 1 number",
      },
      custom: {
        isValid: (value) =>
          !value ? false : value.length >= 20 && value.length <= 50,
        message: "Password should be between 20 and 50 characters long",
      },
    },
  };

  const setup = (option) => {
    return renderHook(() => useForm<TestData>(option));
  };

  test("hook should initialize data", () => {
    const { result } = setup({
      initialValues: {
        username: "",
        password: "",
      },
    });
    expect(result.current.data.username).toBe("");
    expect(result.current.data.password).toBe("");
  });

  test("hook should update state", () => {
    const { result } = setup({});
    expect(result.current.data.username).toBeUndefined();
    act(() => {
      result.current.handleChange("username")(getTestEvent("usernamejohndoe"));
    });
    expect(result.current.data.username).toBe("usernamejohndoe");
  });

  test("hook should generate and clear errors", () => {
    const { result } = renderHook(() =>
      useForm<TestData>({ validations: sampleValidations })
    );

    act(() => {
      result.current.handleChange("username")(getTestEvent("john doe"));
    });
    act(() => {
      result.current.handleChange("password")(getTestEvent("samplepassword"));
    });
    act(() => {
      result.current.getErrors();
    });
    expect(result.current.errors.username[0]).toBe(
      "Username should be between 10 and 50 characters long"
    );
    expect(result.current.errors.username[1]).toBe(
      "Username should not contain whitespace"
    );
    expect(result.current.errors.password[0]).toBe(
      "Password should contain at least 1 symbol, 1 letter and 1 number"
    );
    expect(result.current.errors.password[1]).toBe(
      "Password should be between 20 and 50 characters long"
    );

    act(() => {
      result.current.handleChange("username")(getTestEvent("usernameJohnDoe"));
    });
    act(() => {
      result.current.handleChange("password")(
        getTestEvent("samplepassword@123aaa")
      );
    });
    act(() => {
      result.current.getErrors();
    });
    expect(result.current.errors.username).toBeUndefined();
    expect(result.current.errors.password).toBeUndefined();
  });
});

describe("CreateAccount", () => {
  beforeEach(() => {
    fetchMock.enableMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  test("check for exposed password before form submission", async () => {
    await act(async () => {
      render(<CreateAccount />);
    });
    fetchMock.mockResponse(JSON.stringify({}));
    await act(async () => {
      userEvent.click(screen.getByText("Create Account"));
    });
    expect(fetchMock).toBeCalledTimes(1);
    expect(fetchMock).toBeCalledWith("/api/password_exposed", {
      body: "{}",
      method: "POST",
    });
  });

  test("render according to user workflow", async () => {
    await act(async () => {
      render(<CreateAccount />);
    });
    await act(async () => {
      userEvent.type(screen.getByLabelText("Username"), "usernamejohndoe");
    });
    await act(async () => {
      userEvent.type(screen.getByLabelText("Password"), "weakpass");
    });

    fetchMock.mockResponse(JSON.stringify({}));

    await act(async () => {
      userEvent.click(screen.getByText("Create Account"));
    });

    expect(fetchMock).toBeCalledTimes(2); // onblur and onsubmit
    expect(fetchMock).toBeCalledWith("/api/password_exposed", {
      body: JSON.stringify({ password: "weakpass" }),
      method: "POST",
    });

    await act(async () => {
      userEvent.type(screen.getByLabelText("Password"), "123@aaaaaaaa");
    });

    await act(async () => {
      userEvent.click(screen.getByText("Create Account"));
    });

    expect(fetchMock).toBeCalledTimes(5);
    expect(fetchMock).toHaveBeenLastCalledWith("/api/create_new_account", {
      body: JSON.stringify({
        username: "usernamejohndoe",
        password: "weakpass123@aaaaaaaa",
      }),
      method: "POST",
    });
  });
});
