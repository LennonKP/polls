export interface JwtProvider {
  sign(payload: object): Promise<string>;
  verify(token: string): Promise<object | null>;
}