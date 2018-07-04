// @flow
import crypto from 'crypto';
import { WrongPasswordException } from './salt-hash.exceptions';

export function genRandomString(length: number): string {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0, length); /** return required number of characters */
}

export function sha512(password: string, salt: string) {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  const value = hash.digest('hex');
  return value;
}

type SaltHash = {
  hash: string | number,
  salt: string
};

type VerifyPayload = {
  enteredPassword: string,
  salt: string,
  password: string
};

export function verifyPassword({
  enteredPassword,
  salt,
  password
}: VerifyPayload): void {
  const hashedPassword = sha512(enteredPassword, salt);
  if (password === hashedPassword) return undefined;
  throw new WrongPasswordException();
}

export default (password: string): SaltHash => {
  const salt = genRandomString(16); /** Gives us salt of length 16 */
  const hash = sha512(password, salt);
  return {
    hash,
    salt
  };
};
