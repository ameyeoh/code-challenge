import Head from "next/head";
import styles from "src/styles/create_account.module.scss";
import Image from "next/image";
import { useRouter } from "next/router";
import { useForm } from "../components/useForm";

interface User {
  username: string;
  password: string;
}
export default function CreateAccount() {
  const router = useRouter();

  const {
    handleSubmit,
    handleChange,
    getErrors,
    getValidations,
    errors,
    warnings,
  } = useForm<User>({
    validations: {
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
    },
    warnings: {
      password:
        "Warning: password exposed. Consider using a different password",
    },
    reroute: () => router.push("/create_account_success"),
  });
  const usernameErrors =
    errors.username &&
    errors.username.map((text, i) => (
      <span className={styles.error} key={i}>
        {text}
      </span>
    ));
  const passwordErrors =
    errors.password &&
    errors.password.map((text, i) => (
      <span className={styles.error} key={i}>
        {text}
      </span>
    ));
  const passwordWarnings =
    warnings.password &&
    warnings.password.map((text, i) => (
      <span className={styles.warning} key={i}>
        {text}
      </span>
    ));

  return (
    <>
      <Head>
        <title>Create Account</title>
      </Head>
      <article className={styles.article}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.logo}>
            <Image src='/logo.png' alt="logo" width="50" height="50" />
          </div>
          <h2 className={styles.h2}>Create New Account</h2>
          <div className={styles.formFields}>
            <label className={styles.label} htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className={
                errors.username && errors.username.length > 0
                  ? styles.inputError
                  : styles.input
              }
              type="text"
              onChange={handleChange("username")}
              onBlur={getErrors}
            />
            {usernameErrors}
          </div>
          <div className={styles.formFields}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className={
                errors.password && errors.password.length > 0
                  ? styles.inputError
                  : styles.input
              }
              type="password"
              onChange={handleChange("password")}
              onBlur={getValidations}
            />
            {passwordErrors}
            {passwordWarnings}
          </div>
          <button className={styles.button} type="submit">
            Create Account
          </button>
        </form>
      </article>
    </>
  );
}
