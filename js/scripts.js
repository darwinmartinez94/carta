// ========== EDITAR AQUÍ: PÁRRAFOS DE LA CARTA (LOREM IPSUM / TU TEXTO) ==========
// Cada elemento entre comillas es un párrafo separado que se escribirá con efecto
// de máquina de escribir. Puedes agregar o quitar párrafos fácilmente.
const PARRAFOS_CARTA = [
  "Lorem ipsum dolor: este primer párrafo está reservado para que escribas cómo comenzó todo y lo que sientes cada vez que la ves sonreír. Aquí tus palabras se irán dibujando letra por letra sobre el papel.",
  "Segundo párrafo de relleno romántico: puedes contarle algún recuerdo especial juntos, agradecerle por su forma de ser tan única y decirle cuánto admiras la mujer increíble que es.",
  "Tercer párrafo de cierre: un espacio ideal para dedicarle una promesa bonita, recordarle lo importante que es en tu vida y prepararla para ver la sorpresa que guardaste al final de esta carta.",
];

// Velocidad de la máquina de escribir en milisegundos (menor número = más rápido)
const VELOCIDAD_LETRA_MS = 28;
// ================================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Referencias del DOM
  const sobreInteractivo = document.getElementById("sobre-interactivo");
  const btnAbrirCorazon = document.getElementById("btn-abrir-corazon");
  const pantallaEntrada = document.getElementById("pantalla-entrada");
  const pantallaCarta = document.getElementById("pantalla-carta");

  const musicaFondo = document.getElementById("musica-fondo");
  const btnControlMusica = document.getElementById("btn-control-musica");
  const iconoMusica = document.getElementById("icono-musica");
  const textoMusica = document.getElementById("texto-musica");

  const contenedorEscritura = document.getElementById("contenedor-escritura");
  const envolturaSaltar = document.getElementById("envoltura-saltar");
  const btnMostrarTodo = document.getElementById("btn-mostrar-todo");
  const pieCarta = document.getElementById("pie-carta");

  const btnAbrirModal = document.getElementById("btn-abrir-modal");
  const modalEnamorados = document.getElementById("modal-enamorados");
  const btnCerrarSuperior = document.getElementById("btn-cerrar-superior");
  const btnCerrarInferior = document.getElementById("btn-cerrar-inferior");

  let cartaAbierta = false;
  let escrituraCompletada = false;
  let temporizadorEscritura = null;
  let intervaloFadeAudio = null;

  // ==================== 1. AUDIO CON FADE-IN (COMPATIBLE iOS / ANDROID) ====================
  function iniciarMusicaConFade() {
    if (!musicaFondo) return;

    musicaFondo.volume = 0.05;
    // Llamada síncrona dentro del evento de usuario para iOS Safari y Chrome Android
    const promesaPlay = musicaFondo.play();

    if (promesaPlay !== undefined) {
      promesaPlay
        .then(() => {
          btnControlMusica.classList.remove("oculto");
          actualizarEstadoBotonMusica(true);

          // Subida progresiva de volumen (fade-in)
          clearInterval(intervaloFadeAudio);
          intervaloFadeAudio = setInterval(() => {
            if (musicaFondo.volume < 0.85) {
              musicaFondo.volume = Math.min(0.85, musicaFondo.volume + 0.05);
            } else {
              clearInterval(intervaloFadeAudio);
            }
          }, 180);
        })
        .catch(() => {
          // Si no se ha subido aún el archivo musica.mp3, mostramos igual el botón
          btnControlMusica.classList.remove("oculto");
          actualizarEstadoBotonMusica(false);
        });
    }
  }

  function actualizarEstadoBotonMusica(reproduciendo) {
    iconoMusica.textContent = reproduciendo ? "🔊" : "🔇";
    textoMusica.textContent = reproduciendo ? "Pausar" : "Música";
  }

  btnControlMusica.addEventListener("click", () => {
    if (musicaFondo.paused) {
      musicaFondo
        .play()
        .then(() => actualizarEstadoBotonMusica(true))
        .catch(() => {});
    } else {
      musicaFondo.pause();
      actualizarEstadoBotonMusica(false);
    }
  });

  // ==================== 2. APERTURA DEL SOBRE Y TRANSICIÓN ====================
  btnAbrirCorazon.addEventListener("click", () => {
    if (cartaAbierta) return;
    cartaAbierta = true;

    // 1. Iniciar música inmediatamente en el toque
    iniciarMusicaConFade();

    // 2. Activar animación 3D del sobre abriéndose
    sobreInteractivo.classList.add("abriendo");

    // 3. Mostrar la carta tras la apertura del sobre
    setTimeout(() => {
      pantallaEntrada.style.opacity = "0";
      pantallaEntrada.style.transform = "scale(0.95)";

      setTimeout(() => {
        pantallaEntrada.classList.remove("pantalla-activa");
        pantallaEntrada.classList.add("pantalla-oculta");

        pantallaCarta.classList.remove("pantalla-oculta");
        pantallaCarta.classList.add("pantalla-activa");
        window.scrollTo({ top: 0, behavior: "smooth" });

        iniciarMaquinaDeEscribir();
      }, 550);
    }, 900);
  });

  // ==================== 3. EFECTO MÁQUINA DE ESCRIBIR ====================
  function iniciarMaquinaDeEscribir() {
    contenedorEscritura.innerHTML = "";
    let indiceParrafo = 0;
    let indiceLetra = 0;

    const cursor = document.createElement("span");
    cursor.className = "cursor-maquina";

    let parrafoActualDOM = document.createElement("p");
    parrafoActualDOM.className = "parrafo-carta";
    contenedorEscritura.appendChild(parrafoActualDOM);
    parrafoActualDOM.appendChild(cursor);

    function escribirSiguienteCaracter() {
      if (escrituraCompletada) return;

      const textoParrafo = PARRAFOS_CARTA[indiceParrafo];

      if (indiceLetra < textoParrafo.length) {
        cursor.insertAdjacentText(
          "beforebegin",
          textoParrafo.charAt(indiceLetra),
        );
        indiceLetra++;
        temporizadorEscritura = setTimeout(
          escribirSiguienteCaracter,
          VELOCIDAD_LETRA_MS,
        );
      } else {
        indiceParrafo++;
        indiceLetra = 0;

        if (indiceParrafo < PARRAFOS_CARTA.length) {
          parrafoActualDOM = document.createElement("p");
          parrafoActualDOM.className = "parrafo-carta";
          contenedorEscritura.appendChild(parrafoActualDOM);
          parrafoActualDOM.appendChild(cursor);
          temporizadorEscritura = setTimeout(escribirSiguienteCaracter, 380);
        } else {
          finalizarEscrituraCompleta();
        }
      }
    }

    escribirSiguienteCaracter();
  }

  function finalizarEscrituraCompleta() {
    if (escrituraCompletada) return;
    escrituraCompletada = true;
    clearTimeout(temporizadorEscritura);

    // Renderizar todos los párrafos completos sin cursor
    contenedorEscritura.innerHTML = "";
    PARRAFOS_CARTA.forEach((texto) => {
      const p = document.createElement("p");
      p.className = "parrafo-carta";
      p.textContent = texto;
      contenedorEscritura.appendChild(p);
    });

    if (envolturaSaltar) {
      envolturaSaltar.style.display = "none";
    }

    pieCarta.classList.remove("invisible");
  }

  // Permitir mostrar toda la carta de golpe con el botón o tocando el texto
  btnMostrarTodo.addEventListener("click", finalizarEscrituraCompleta);
  contenedorEscritura.addEventListener("click", finalizarEscrituraCompleta);

  // ==================== 4. MODAL DE LA FOTOGRAFÍA VERTICAL ====================
  function abrirModalFoto() {
    modalEnamorados.hidden = false;
    document.body.classList.add("sin-scroll");
    requestAnimationFrame(() => {
      modalEnamorados.classList.add("visible");
    });
  }

  function cerrarModalFoto() {
    modalEnamorados.classList.remove("visible");
    document.body.classList.remove("sin-scroll");
    setTimeout(() => {
      modalEnamorados.hidden = true;
    }, 320);
  }

  btnAbrirModal.addEventListener("click", abrirModalFoto);
  btnCerrarSuperior.addEventListener("click", cerrarModalFoto);
  btnCerrarInferior.addEventListener("click", cerrarModalFoto);

  // Cerrar también si toca el fondo oscuro fuera de la tarjeta del modal
  modalEnamorados.addEventListener("click", (evento) => {
    if (evento.target === modalEnamorados) {
      cerrarModalFoto();
    }
  });

  // Cerrar con tecla Escape por accesibilidad
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !modalEnamorados.hidden) {
      cerrarModalFoto();
    }
  });

  // ==================== 5. ANIMACIÓN LIGERA DE PÉTALOS EN CANVAS ====================
  const lienzo = document.getElementById("lienzo-petalos");
  const ctx = lienzo.getContext("2d");
  let ancho = (lienzo.width = window.innerWidth);
  let alto = (lienzo.height = window.innerHeight);

  window.addEventListener("resize", () => {
    ancho = lienzo.width = window.innerWidth;
    alto = lienzo.height = window.innerHeight;
  });

  const CANTIDAD_PETALOS = 24;
  const coloresPetalos = [
    "rgba(158, 20, 50, 0.65)",
    "rgba(217, 4, 41, 0.55)",
    "rgba(247, 198, 208, 0.5)",
    "rgba(232, 141, 156, 0.55)",
  ];

  const petalos = Array.from({ length: CANTIDAD_PETALOS }, () =>
    crearPetalo(true),
  );

  function crearPetalo(inicioAleatorio) {
    return {
      x: Math.random() * ancho,
      y: inicioAleatorio ? Math.random() * alto : -25,
      tamano: 7 + Math.random() * 9,
      velocidadY: 0.6 + Math.random() * 1.1,
      velocidadX: -0.4 + Math.random() * 0.8,
      angulo: Math.random() * Math.PI * 2,
      giro: (Math.random() - 0.5) * 0.02,
      oscilacion: Math.random() * Math.PI * 2,
      color: coloresPetalos[Math.floor(Math.random() * coloresPetalos.length)],
    };
  }

  function dibujarPetalos() {
    ctx.clearRect(0, 0, ancho, alto);

    for (let i = 0; i < petalos.length; i++) {
      const p = petalos[i];
      p.oscilacion += 0.02;
      p.y += p.velocidadY;
      p.x += p.velocidadX + Math.sin(p.oscilacion) * 0.35;
      p.angulo += p.giro;

      if (p.y > alto + 25) {
        petalos[i] = crearPetalo(false);
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angulo);
      ctx.fillStyle = p.color;

      // Silueta orgánica de pétalo de rosa
      ctx.beginPath();
      ctx.moveTo(0, -p.tamano);
      ctx.bezierCurveTo(p.tamano, -p.tamano, p.tamano, p.tamano, 0, p.tamano);
      ctx.bezierCurveTo(
        -p.tamano,
        p.tamano,
        -p.tamano,
        -p.tamano,
        0,
        -p.tamano,
      );
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame(dibujarPetalos);
  }

  dibujarPetalos();
});
