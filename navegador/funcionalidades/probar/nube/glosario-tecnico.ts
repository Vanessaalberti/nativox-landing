import { leerGlosario } from "@nativox/compartido/glosario";
import texto from "../../../../glosario/tecnico.txt?raw";

// El glosario técnico general de la portada (`glosario/tecnico.txt`): se empaqueta con el sitio,
// porque la corrección y la protección al traducir corren en el navegador de quien visita.
export const GLOSARIO_TECNICO = leerGlosario(texto);
