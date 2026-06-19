export type PapelUsuario = "cliente" | "admin";

export interface JwtPayload {
  id: number;
  email: string;
  nivelId: number;
  papel: PapelUsuario;
}
