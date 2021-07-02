import type { NextApiRequest, NextApiResponse } from "next";

interface CreateNewAccountParameters {
  username: string;
  password: string;
}

interface BooleanResult {
  result: boolean;
  errors?: Record<string, string>;
}

export default function createNewAccount(
  req: NextApiRequest,
  res: NextApiResponse<BooleanResult>
) {
  const { username, password }: CreateNewAccountParameters = JSON.parse(
    req.body
  );

  if (username && password) {
    res.status(200).json({ result: true });
  } else {
    res.status(400).json({ result: false });
  }
}
