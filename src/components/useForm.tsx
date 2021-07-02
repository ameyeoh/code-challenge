import { ChangeEvent, FormEvent, useState } from "react";

interface Validation {
  pattern?: {
    value: string;
    message: string;
  };
  custom?: {
    isValid: (value: string) => boolean;
    message: string;
  };
  warning?: {
    message: string;
  };
}

interface Warning {
  password?: string;
}

type ErrorRecord<T> = Record<keyof T, Array<string>>;
type Validations<T extends {}> = Partial<Record<keyof T, Validation>>;

export const useForm = <T extends Record<keyof T, any> = {}>(options?: { //TODO: Figure out typing and replace any
  validations?: Validations<T>;
  warnings?: Warning;
  initialValues?: Partial<T>;
  reroute?: () => void;
}) => {
  const [data, setData] = useState<any>(options?.initialValues || {}); //TODO: Figure out typing and replace any
  const [errors, setErrors] = useState<ErrorRecord<T>>({} as ErrorRecord<T>);
  const [warnings, setWarnings] = useState<ErrorRecord<T>>(
    {} as ErrorRecord<T>
  );
  const [checkedExposed, setCheckExposed] = useState<boolean>(false);

  const newErrors = {} as any; //TODO: Figure out typing and replace any
  const newWarnings = {} as any; //TODO: Figure out typing and replace any

  const handleChange =
    <S extends unknown>(key: keyof T, sanitizeFn?: (value: string) => S) =>
    (e: ChangeEvent<HTMLInputElement & HTMLSelectElement>) => {
      const value = sanitizeFn ? sanitizeFn(e.target.value) : e.target.value;
      setData({
        ...data,
        [key]: value,
      });
    };

  const getWarnings = async () => {
    const exposedPassword = await fetch("/api/password_exposed", {
      method: "POST",
      body: JSON.stringify({ password: data.password }),
    });
    const exposed = await exposedPassword.json();
    if (exposed.result) {
      setCheckExposed(true);
      const warningMessages = options?.warnings;
      for (const key in warningMessages) {
        newWarnings.password = [];
        newWarnings.password.push(warningMessages[key]);
      }
      setWarnings(newWarnings);
      return true;
    }
    setWarnings({} as ErrorRecord<T>);
    return false;
  };

  const getErrors = async () => {
    const allValidations = options?.validations;
    let valid = true;

    for (const key in allValidations) {
      const value = data[key];
      const validation = allValidations[key];

      newErrors[key] = [];
      const pattern = validation?.pattern;
      if (pattern?.value && !RegExp(pattern.value).test(value)) {
        valid = false;
        newErrors[key].push(pattern.message);
      }

      const custom = validation?.custom;
      if (custom?.isValid && !custom.isValid(value)) {
        valid = false;
        newErrors[key].push(custom.message);
      }
    }
    if (!valid) {
      setErrors(newErrors);
      return true;
    }
    setErrors({} as ErrorRecord<T>);
    return false;
  };

  const getValidations = async () => {
    await getWarnings();
    await getErrors();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isExposed = await getWarnings();
    const hasErrors = await getErrors();

    if (hasErrors) {
      return;
    }
    if (!checkedExposed && isExposed) {
      return;
    }

    const response = await fetch("/api/create_new_account", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const createResponse = await response.json();
    if (createResponse.result) {
      options.reroute();
    }
  };

  return {
    handleSubmit,
    handleChange,
    getValidations,
    getErrors,
    data,
    errors,
    warnings,
  };
};
