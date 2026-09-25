import type { Idioma } from "@nativox/compartido/contratos";

interface Paso {
  titulo: string;
  texto: string;
}

interface TextosComoFunciona {
  etiqueta: string;
  titulo: [string, string];
  // Lo que hay que saber antes del paso a paso.
  intro: { titulo: string; parrafos: string[]; puntos: { titulo: string; texto: string }[] };
  pasosTitulo: string;
  pasos: [Paso, Paso, Paso];
  volver: string;
  comparacion: string;
}

export const TEXTOS_COMO_FUNCIONA: Record<Idioma, TextosComoFunciona> = {
  es: {
    etiqueta: "02 — Guía de instalación",
    titulo: ["¿Cómo", "funciona?"],
    intro: {
      titulo: "Sin API keys, con modelos que corren en tu computadora",
      parrafos: [
        "Nativox no le pide ninguna API key a nadie. La transcripción y la traducción las hacen modelos que corren en el navegador, usando la placa de video de tu computadora: Whisper transcribe lo que se dice y Bergamot (o TranslateGemma, si la placa tiene margen) lo traduce. Los modelos se descargan una sola vez, quedan guardados en la computadora y, con eso, la sala sigue funcionando aunque se corte internet.",
        "Y para tenerlo funcionando no hay que clonar ningún repositorio ni instalar nada: con un clic en «Deploy to Cloudflare» y aceptar, se copia el repositorio a tu cuenta de GitHub y se despliega en tu cuenta de Cloudflare. Con ese clic y el aceptar, ya tenés casi todo armado.",
      ],
      puntos: [
        {
          titulo: "Un clic, sin clonar",
          texto:
            "El botón copia el código a tu GitHub y lo publica en tu Cloudflare. No necesitás una terminal.",
        },
        {
          titulo: "Todo en tu cuenta",
          texto:
            "Tu evento, tus salas y tus datos viven en tu propia instancia. Nada pasa por servidores nuestros.",
        },
        {
          titulo: "Muy personalizable",
          texto:
            "Como el código queda en tu cuenta, podés poner lo tuyo: el nombre y el logo del evento, el glosario técnico, los idiomas de cada sala e incluso el código.",
        },
      ],
    },
    pasosTitulo: "El paso a paso",
    pasos: [
      {
        titulo: "Desplegá tu instancia",
        texto:
          "Es lo mismo que el botón de la portada: un clic en «Deploy to Cloudflare» copia el repositorio a tu GitHub y arma todo lo que hace falta en tu cuenta (el Worker, la base de datos, las salas en tiempo real y la conexión con Workers AI).",
      },
      {
        titulo: "Hacé el deploy en Cloudflare",
        texto:
          "Cloudflare te pide conectar tu GitHub y aceptar, y hace el deploy solo. Cuando termina, entrá a tu Worker → Settings → Domains & Routes y activá «workers.dev»: esa es la dirección de tu instancia. Los pasos que ves ahí no hace falta copiarlos: Cloudflare te va guiando.",
      },
      {
        titulo: "Configurá tu evento",
        texto:
          "Abrí la dirección y creá tu evento: tu cuenta de administrador, el nombre y el logo, las fechas y cómo corre la IA (evaluás una computadora en un clic). Después creás las salas, cargás la agenda con el glosario de cada charla y, si armaste un equipo, invitás a tus operadores con su código.",
      },
    ],
    volver: "Volver al inicio",
    comparacion: "Ver la comparación",
  },
  en: {
    etiqueta: "02 — Installation guide",
    titulo: ["How does", "it work?"],
    intro: {
      titulo: "No API keys, with models that run on your own computer",
      parrafos: [
        "Nativox does not ask anyone for an API key. Transcription and translation are done by models that run in the browser, using your computer's graphics card: Whisper transcribes what is said and Bergamot (or TranslateGemma, if the card has room for it) translates it. The models are downloaded once and kept on the computer, so the room keeps working even if the internet drops.",
        "And to get it running you do not clone any repository or install anything: one click on “Deploy to Cloudflare” and accepting copies the repository to your GitHub account and deploys it to your Cloudflare account. With that click and the accept, you already have almost everything set up.",
      ],
      puntos: [
        {
          titulo: "One click, no cloning",
          texto:
            "The button copies the code to your GitHub and publishes it on your Cloudflare. You do not need a terminal.",
        },
        {
          titulo: "Everything in your account",
          texto:
            "Your event, your rooms and your data live in your own instance. Nothing goes through our servers.",
        },
        {
          titulo: "Very customizable",
          texto:
            "Since the code ends up in your account, you can make it yours: the event name and logo, the technical glossary, the languages of each room and even the code.",
        },
      ],
    },
    pasosTitulo: "Step by step",
    pasos: [
      {
        titulo: "Deploy your instance",
        texto:
          "It is the same as the button on the home page: one click on “Deploy to Cloudflare” copies the repository to your GitHub and sets up everything needed in your account (the Worker, the database, the real-time rooms and the Workers AI connection).",
      },
      {
        titulo: "Do the deploy on Cloudflare",
        texto:
          "Cloudflare asks you to connect your GitHub and accept, and does the deploy by itself. When it finishes, go to your Worker → Settings → Domains & Routes and enable “workers.dev”: that is your instance’s address. You do not need to copy the steps you see there: Cloudflare guides you.",
      },
      {
        titulo: "Set up your event",
        texto:
          "Open the address and create your event: your administrator account, the name and logo, the dates and how the AI runs (you check a computer in one click). Then you create the rooms, load the agenda with each talk’s glossary and, if you built a team, invite your operators with their code.",
      },
    ],
    volver: "Back to home",
    comparacion: "See the comparison",
  },
  pt: {
    etiqueta: "02 — Guia de instalação",
    titulo: ["Como", "funciona?"],
    intro: {
      titulo: "Sem API keys, com modelos que rodam no seu computador",
      parrafos: [
        "O Nativox não pede nenhuma API key a ninguém. A transcrição e a tradução são feitas por modelos que rodam no navegador, usando a placa de vídeo do seu computador: o Whisper transcreve o que é dito e o Bergamot (ou o TranslateGemma, se a placa tiver folga) traduz. Os modelos são baixados uma única vez e ficam guardados no computador, então a sala continua funcionando mesmo se a internet cair.",
        "E para deixá-lo funcionando não é preciso clonar nenhum repositório nem instalar nada: com um clique em «Deploy to Cloudflare» e aceitando, o repositório é copiado para a sua conta do GitHub e publicado na sua conta da Cloudflare. Com esse clique e o aceite, você já tem quase tudo pronto.",
      ],
      puntos: [
        {
          titulo: "Um clique, sem clonar",
          texto:
            "O botão copia o código para o seu GitHub e o publica na sua Cloudflare. Você não precisa de terminal.",
        },
        {
          titulo: "Tudo na sua conta",
          texto:
            "O seu evento, as suas salas e os seus dados vivem na sua própria instância. Nada passa pelos nossos servidores.",
        },
        {
          titulo: "Muito personalizável",
          texto:
            "Como o código fica na sua conta, você pode colocar o que é seu: o nome e o logo do evento, o glossário técnico, os idiomas de cada sala e até o código.",
        },
      ],
    },
    pasosTitulo: "Passo a passo",
    pasos: [
      {
        titulo: "Publique a sua instância",
        texto:
          "É o mesmo botão da página inicial: um clique em «Deploy to Cloudflare» copia o repositório para o seu GitHub e monta tudo o que é preciso na sua conta (o Worker, o banco de dados, as salas em tempo real e a conexão com o Workers AI).",
      },
      {
        titulo: "Faça o deploy na Cloudflare",
        texto:
          "A Cloudflare pede para conectar o seu GitHub e aceitar, e faz o deploy sozinha. Quando terminar, vá ao seu Worker → Settings → Domains & Routes e ative «workers.dev»: esse é o endereço da sua instância. Não é preciso copiar os passos que você vê ali: a Cloudflare vai guiando.",
      },
      {
        titulo: "Configure o seu evento",
        texto:
          "Abra o endereço e crie o seu evento: a sua conta de administrador, o nome e o logo, as datas e como a IA roda (você avalia um computador em um clique). Depois cria as salas, carrega a agenda com o glossário de cada palestra e, se montou uma equipe, convida os seus operadores com o código deles.",
      },
    ],
    volver: "Voltar ao início",
    comparacion: "Ver a comparação",
  },
};
