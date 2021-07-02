import Head from "next/head";
import Image from "next/image";
import styles from "src/styles/create_account.module.scss";

export default function CreateAccountSuccess() {
  return (
    <>
      <Head>
        <title>Create Account Success</title>
      </Head>
      <article className={styles.article}>
        <form className={styles.form}>
          <div className={styles.logo}>
            <Image src='/logo.png' alt="logo" width="50" height="50" />
          </div>
          <h2 className={styles.h2}>Create New Account</h2>
          <p className={styles.successMessage}>User account successfully created!</p>
        </form>
      </article>
    </>
  );
}
