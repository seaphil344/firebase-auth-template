// lib/errors.ts
import { FirebaseError } from "firebase/app";

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof FirebaseError) {
    return error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}
 