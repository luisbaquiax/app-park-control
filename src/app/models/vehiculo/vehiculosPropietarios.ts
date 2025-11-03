import { UsuarioPersonaRolResponse } from "../cliente/usuarioPersonaRolResponse";
import { VehiculoResponse } from "./vehiculoResponse";

export interface VehiculosPropietario {
  usuario: UsuarioPersonaRolResponse;
  vehiculos: VehiculoResponse[];
}
