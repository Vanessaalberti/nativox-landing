import type { Idioma } from "@nativox/compartido/contratos";

// Los textos de cada paso de la prueba (el recuadro del centro): descarga, listo, grabando,
// revisar lo grabado y procesar.
interface TextosEscenario {
  descargando: { titulo: string; ayuda: string };
  listo: { titulo: string; ayuda: string; grabar: string; cancelar: string; cuenta: string };
  grabando: {
    titulo: string;
    ayuda: string;
    quedan: (segundos: number) => string;
    terminar: string;
  };
  revisando: {
    titulo: string;
    escuchar: string;
    silencio: string;
    referencia: string;
    referenciaAyuda: string;
    placeholder: string;
    enviar: string;
    grabarDeNuevo: string;
  };
  procesando: { titulo: string; ayuda: string };
  sinIntentos: string;
  error: string;
  volver: string;
  probarDeNuevo: string;
}

export const TEXTOS_ESCENARIO: Record<Idioma, TextosEscenario> = {
  es: {
    descargando: {
      titulo: "Descargando los modelos",
      ayuda:
        "Solo la primera vez: después quedan guardados en tu navegador y funcionan sin internet. Cuando termine, te avisamos para que grabes.",
    },
    listo: {
      titulo: "Todo listo para grabar",
      ayuda:
        "Cuando quieras, grabá hasta 15 segundos. Al apretar «Grabar» el navegador te va a pedir permiso para usar el micrófono.",
      grabar: "● Grabar",
      cancelar: "Cancelar",
      cuenta: "Cada grabación cuenta como una de tus 4 pruebas de hoy.",
    },
    grabando: {
      titulo: "Grabando: hablá ahora",
      ayuda: "Hablá con normalidad. Si terminás antes, cortá la grabación cuando quieras.",
      quedan: (segundos) => `Quedan ${String(segundos)} s`,
      terminar: "■ Terminar de grabar",
    },
    revisando: {
      titulo: "Escuchá tu grabación",
      escuchar: "Tu grabación",
      silencio:
        "Casi no se escuchó nada: revisá que el micrófono sea el correcto y grabá de nuevo, más cerca.",
      referencia: "Lo que dijiste (opcional)",
      referenciaAyuda:
        "Escribí lo que dijiste para calcular el WER y los términos bien escritos, y compararlo con lo que entendió Whisper. Podés dejarlo vacío.",
      placeholder: "Escribí acá, tal cual lo dijiste…",
      enviar: "Enviar",
      grabarDeNuevo: "Grabar de nuevo (cuenta como otra prueba)",
    },
    procesando: {
      titulo: "Procesando tu audio",
      ayuda:
        "Lo transcribimos y traducimos como si lo estuvieras diciendo en vivo, con el nivel de velocidad que elegiste. Mirá abajo cómo va apareciendo.",
    },
    sinIntentos:
      "Ya usaste tus 4 pruebas con micrófono de hoy. Volvé mañana; mientras tanto podés probar la transcripción en la nube desde la portada.",
    error: "Algo falló",
    volver: "Volver",
    probarDeNuevo: "Probar de nuevo",
  },
  en: {
    descargando: {
      titulo: "Downloading the models",
      ayuda:
        "Only the first time: after that they stay saved in your browser and work offline. When it finishes, we'll let you know so you can record.",
    },
    listo: {
      titulo: "Ready to record",
      ayuda:
        "Whenever you want, record up to 15 seconds. When you press “Record” the browser will ask for permission to use the microphone.",
      grabar: "● Record",
      cancelar: "Cancel",
      cuenta: "Each recording counts as one of your 4 tries today.",
    },
    grabando: {
      titulo: "Recording: speak now",
      ayuda: "Speak normally. If you finish early, stop the recording whenever you want.",
      quedan: (segundos) => `${String(segundos)} s left`,
      terminar: "■ Stop recording",
    },
    revisando: {
      titulo: "Listen to your recording",
      escuchar: "Your recording",
      silencio:
        "Almost nothing was picked up: check that the microphone is the right one and record again, closer.",
      referencia: "What you said (optional)",
      referenciaAyuda:
        "Type what you said to compute the WER and the correctly written terms, and compare it with what Whisper understood. You can leave it empty.",
      placeholder: "Type here, exactly as you said it…",
      enviar: "Send",
      grabarDeNuevo: "Record again (counts as another try)",
    },
    procesando: {
      titulo: "Processing your audio",
      ayuda:
        "We transcribe and translate it as if you were saying it live, with the speed level you chose. Watch below as it shows up.",
    },
    sinIntentos:
      "You used your 4 microphone tries for today. Come back tomorrow; meanwhile you can try cloud transcription from the home page.",
    error: "Something failed",
    volver: "Back",
    probarDeNuevo: "Try again",
  },
  pt: {
    descargando: {
      titulo: "Baixando os modelos",
      ayuda:
        "Só na primeira vez: depois ficam salvos no seu navegador e funcionam sem internet. Quando terminar, avisamos para você gravar.",
    },
    listo: {
      titulo: "Tudo pronto para gravar",
      ayuda:
        "Quando quiser, grave até 15 segundos. Ao apertar «Gravar» o navegador vai pedir permissão para usar o microfone.",
      grabar: "● Gravar",
      cancelar: "Cancelar",
      cuenta: "Cada gravação conta como um dos seus 4 testes de hoje.",
    },
    grabando: {
      titulo: "Gravando: fale agora",
      ayuda: "Fale normalmente. Se terminar antes, pare a gravação quando quiser.",
      quedan: (segundos) => `Restam ${String(segundos)} s`,
      terminar: "■ Parar de gravar",
    },
    revisando: {
      titulo: "Ouça a sua gravação",
      escuchar: "A sua gravação",
      silencio:
        "Quase nada foi captado: confira se o microfone é o certo e grave de novo, mais perto.",
      referencia: "O que você disse (opcional)",
      referenciaAyuda:
        "Escreva o que você disse para calcular o WER e os termos escritos corretamente, e comparar com o que o Whisper entendeu. Pode deixar vazio.",
      placeholder: "Escreva aqui, exatamente como você disse…",
      enviar: "Enviar",
      grabarDeNuevo: "Gravar de novo (conta como outro teste)",
    },
    procesando: {
      titulo: "Processando o seu áudio",
      ayuda:
        "Transcrevemos e traduzimos como se você estivesse falando ao vivo, com o nível de velocidade escolhido. Veja abaixo como vai aparecendo.",
    },
    sinIntentos:
      "Você usou seus 4 testes com microfone de hoje. Volte amanhã; enquanto isso, pode testar a transcrição na nuvem na página inicial.",
    error: "Algo falhou",
    volver: "Voltar",
    probarDeNuevo: "Testar de novo",
  },
};
