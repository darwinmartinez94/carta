const PARRAFOS_CARTA = [
  "Desde el primer instante en que nuestros caminos se cruzaron, mi cosa hermosa, supe que mi vida había encontrado su verdadera luz. Cada vez que sonríe, mi mundo se detiene por completo y se llena de una paz infinita; su sonrisa es el refugio donde siempre quiero estar.",
  "Aún guardo en mi memoria cada instante compartido, cada risa y cada momento que hace que nuestros días sean especiales, asi como caundo nos miramos debajo de aquel arbol en Catacamas. quiero decirle Gracias por ser esa mujer tan única, fuerte y maravillosa, por su ternura inagotable y por la forma tan hermosa en que ilumina mi vida entera.",
  "Tambien me gustaria darle las gracias por el dia que nos miramos en tegucigalpa, fue uno de los mejores dias de mi vida, usted es lo más valioso que tengo. y para cerrar este detalle, le invito a descubrir la sorpresa que guardé al final de esta carta.",
];

const VELOCIDAD_LETRA_MS = 28;
const PAUSA_ENTRE_PARRAFOS_MS = 380;
const DURACION_CIERRE_MODAL_MS = 330;

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const el = {
    envelope: $("envelope"),
    heartTrigger: $("heart-trigger"),
    introScreen: $("intro-screen"),
    letterScreen: $("letter-screen"),
    audio: $("bg-music"),
    musicToggle: $("music-toggle"),
    musicIcon: $("music-icon"),
    musicLabel: $("music-label"),
    typewriter: $("typewriter-container"),
    skipContainer: $("skip-container"),
    skipButton: $("skip-typewriter-btn"),
    footer: $("letter-footer"),
    openPhoto: $("open-photo-btn"),
    modal: $("photo-modal"),
    backdrop: $("modal-backdrop"),
    closeTop: $("close-modal-top"),
    closeBottom: $("close-modal-bottom"),
    petalsCanvas: $("petals-canvas"),
  };

  let cartaAbierta = false;
  let escrituraCompletada = false;
  let timerEscritura = null;
  let fadeAudioTimer = null;
  let modalTimer = null;
  let elementoQueAbrioModal = null;
  let animacionPetalos = null;
  let contextoPetalos = null;
  let anchoCanvas = 0;
  let altoCanvas = 0;
  let dpr = 1;
  let petalos = [];

  // ---------- Utilidades ----------
  const reducirMovimiento =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function limpiarTimerEscritura() {
    if (timerEscritura !== null) {
      window.clearTimeout(timerEscritura);
      timerEscritura = null;
    }
  }

  // ---------- Música ----------
  function actualizarBotonMusica(reproduciendo) {
    if (!el.musicToggle || !el.musicIcon || !el.musicLabel) return;
    el.musicIcon.textContent = reproduciendo ? "🔊" : "🔇";
    el.musicLabel.textContent = reproduciendo ? "Pausar" : "Música";
    el.musicToggle.setAttribute(
      "aria-label",
      reproduciendo ? "Pausar música" : "Reproducir música",
    );
    el.musicToggle.setAttribute("aria-pressed", String(reproduciendo));
  }

  function detenerFadeAudio() {
    if (fadeAudioTimer !== null) {
      window.clearInterval(fadeAudioTimer);
      fadeAudioTimer = null;
    }
  }

  function iniciarFadeAudio() {
    if (!el.audio) return;
    detenerFadeAudio();

    // En Safari de iOS el control programático de volumen puede estar limitado.
    try {
      el.audio.volume = 0.05;
    } catch (_) {}

    const promesa = el.audio.play();
    if (promesa && typeof promesa.then === "function") {
      promesa
        .then(() => {
          if (el.musicToggle) el.musicToggle.classList.remove("hidden");
          actualizarBotonMusica(true);

          let volumen = 0.05;
          fadeAudioTimer = window.setInterval(() => {
            if (!el.audio || el.audio.paused) {
              detenerFadeAudio();
              return;
            }
            volumen = Math.min(0.85, volumen + 0.05);
            try {
              el.audio.volume = volumen;
            } catch (_) {}
            if (volumen >= 0.85) detenerFadeAudio();
          }, 180);
        })
        .catch(() => {
          if (el.musicToggle) el.musicToggle.classList.remove("hidden");
          actualizarBotonMusica(false);
        });
    } else {
      if (el.musicToggle) el.musicToggle.classList.remove("hidden");
      actualizarBotonMusica(!el.audio.paused);
    }
  }

  if (el.musicToggle && el.audio) {
    el.musicToggle.addEventListener("click", () => {
      if (el.audio.paused) {
        const promesa = el.audio.play();
        if (promesa && typeof promesa.then === "function") {
          promesa
            .then(() => actualizarBotonMusica(true))
            .catch(() => actualizarBotonMusica(false));
        } else {
          actualizarBotonMusica(true);
        }
      } else {
        el.audio.pause();
        detenerFadeAudio();
        actualizarBotonMusica(false);
      }
    });

    el.audio.addEventListener("pause", () => actualizarBotonMusica(false));
    el.audio.addEventListener("play", () => actualizarBotonMusica(true));
  }

  // ---------- Máquina de escribir ----------
  function mostrarPieCarta() {
    if (el.footer) el.footer.classList.remove("invisible");
    if (el.skipContainer) el.skipContainer.classList.add("hidden");
  }

  function finalizarEscrituraCompleta() {
    if (escrituraCompletada || !el.typewriter) return;
    escrituraCompletada = true;
    limpiarTimerEscritura();
    el.typewriter.replaceChildren();

    PARRAFOS_CARTA.forEach((texto) => {
      const p = document.createElement("p");
      p.className = "parrafo-carta";
      p.textContent = texto;
      el.typewriter.appendChild(p);
    });

    mostrarPieCarta();
  }

  function iniciarMaquinaDeEscribir() {
    if (!el.typewriter) return;
    limpiarTimerEscritura();
    escrituraCompletada = false;
    el.typewriter.replaceChildren();
    if (el.footer) el.footer.classList.add("invisible");
    if (el.skipContainer) el.skipContainer.classList.remove("hidden");

    if (reducirMovimiento) {
      finalizarEscrituraCompleta();
      return;
    }

    const textos = PARRAFOS_CARTA.filter(
      (p) => typeof p === "string" && p.length > 0,
    );
    if (textos.length === 0) {
      finalizarEscrituraCompleta();
      return;
    }

    let indiceParrafo = 0;
    let indiceLetra = 0;
    let parrafoActual = document.createElement("p");
    parrafoActual.className = "parrafo-carta";
    el.typewriter.appendChild(parrafoActual);

    const cursor = document.createElement("span");
    cursor.className = "typewriter-cursor";
    cursor.setAttribute("aria-hidden", "true");
    parrafoActual.appendChild(cursor);

    function escribirCaracter() {
      if (escrituraCompletada) return;

      const texto = textos[indiceParrafo];
      if (indiceLetra < texto.length) {
        cursor.insertAdjacentText("beforebegin", texto.charAt(indiceLetra));
        indiceLetra += 1;
        timerEscritura = window.setTimeout(
          escribirCaracter,
          VELOCIDAD_LETRA_MS,
        );
        return;
      }

      indiceParrafo += 1;
      indiceLetra = 0;

      if (indiceParrafo >= textos.length) {
        finalizarEscrituraCompleta();
        return;
      }

      parrafoActual = document.createElement("p");
      parrafoActual.className = "parrafo-carta";
      el.typewriter.appendChild(parrafoActual);
      parrafoActual.appendChild(cursor);
      timerEscritura = window.setTimeout(
        escribirCaracter,
        PAUSA_ENTRE_PARRAFOS_MS,
      );
    }

    escribirCaracter();
  }

  if (el.skipButton)
    el.skipButton.addEventListener("click", finalizarEscrituraCompleta);
  if (el.typewriter)
    el.typewriter.addEventListener("click", finalizarEscrituraCompleta);

  // ---------- Apertura del sobre ----------
  function abrirCarta() {
    if (cartaAbierta || !el.envelope || !el.introScreen || !el.letterScreen)
      return;
    cartaAbierta = true;

    // Se llama directamente desde el toque/clic del usuario para cumplir la política de autoplay.
    iniciarFadeAudio();
    el.heartTrigger?.setAttribute("disabled", "disabled");
    el.envelope.classList.add("is-opening");

    window.setTimeout(() => {
      el.introScreen.classList.add("fade-out");
      window.setTimeout(() => {
        el.introScreen.classList.add("hidden");
        el.letterScreen.classList.remove("hidden");
        window.scrollTo({
          top: 0,
          behavior: reducirMovimiento ? "auto" : "smooth",
        });
        iniciarMaquinaDeEscribir();
      }, 560);
    }, 850);
  }

  if (el.heartTrigger) el.heartTrigger.addEventListener("click", abrirCarta);

  // ---------- Modal de fotografía ----------
  function abrirModalFoto() {
    if (!el.modal) return;
    if (modalTimer !== null) {
      window.clearTimeout(modalTimer);
      modalTimer = null;
    }

    elementoQueAbrioModal = document.activeElement;
    el.modal.hidden = false;
    el.modal.classList.remove("hidden");
    el.modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    window.requestAnimationFrame(() => {
      el.modal.classList.add("visible");
      if (el.closeTop) el.closeTop.focus({ preventScroll: true });
    });
  }

  function cerrarModalFoto() {
    if (!el.modal || el.modal.hidden) return;
    el.modal.classList.remove("visible");
    el.modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    if (modalTimer !== null) window.clearTimeout(modalTimer);
    modalTimer = window.setTimeout(() => {
      el.modal.classList.add("hidden");
      el.modal.hidden = true;
      modalTimer = null;
      if (
        elementoQueAbrioModal &&
        typeof elementoQueAbrioModal.focus === "function"
      ) {
        elementoQueAbrioModal.focus({ preventScroll: true });
      }
    }, DURACION_CIERRE_MODAL_MS);
  }

  if (el.openPhoto) el.openPhoto.addEventListener("click", abrirModalFoto);
  if (el.closeTop) el.closeTop.addEventListener("click", cerrarModalFoto);
  if (el.closeBottom) el.closeBottom.addEventListener("click", cerrarModalFoto);
  if (el.backdrop) el.backdrop.addEventListener("click", cerrarModalFoto);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && el.modal && !el.modal.hidden)
      cerrarModalFoto();
  });

  // ---------- Pétalos en canvas ----------
  function crearPetalo(aleatorio = false) {
    return {
      x: Math.random() * anchoCanvas,
      y: aleatorio ? Math.random() * altoCanvas : -25,
      size: 6 + Math.random() * 8,
      speedY: 0.55 + Math.random() * 1.0,
      speedX: -0.35 + Math.random() * 0.7,
      angle: Math.random() * Math.PI * 2,
      rotation: (Math.random() - 0.5) * 0.025,
      sway: Math.random() * Math.PI * 2,
      color: [
        "rgba(158,20,50,.65)",
        "rgba(217,4,41,.52)",
        "rgba(247,198,208,.5)",
        "rgba(232,141,156,.55)",
      ][Math.floor(Math.random() * 4)],
    };
  }

  function ajustarCanvas() {
    if (!el.petalsCanvas || !contextoPetalos) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    anchoCanvas = window.innerWidth;
    altoCanvas = window.innerHeight;
    el.petalsCanvas.width = Math.round(anchoCanvas * dpr);
    el.petalsCanvas.height = Math.round(altoCanvas * dpr);
    el.petalsCanvas.style.width = `${anchoCanvas}px`;
    el.petalsCanvas.style.height = `${altoCanvas}px`;
    contextoPetalos.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function dibujarPetalos() {
    if (!contextoPetalos || document.hidden) {
      animacionPetalos = null;
      return;
    }

    contextoPetalos.clearRect(0, 0, anchoCanvas, altoCanvas);
    for (let i = 0; i < petalos.length; i += 1) {
      const p = petalos[i];
      p.sway += 0.018;
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.sway) * 0.32;
      p.angle += p.rotation;
      if (p.y > altoCanvas + 25) {
        petalos[i] = crearPetalo(false);
        continue;
      }

      contextoPetalos.save();
      contextoPetalos.translate(p.x, p.y);
      contextoPetalos.rotate(p.angle);
      contextoPetalos.fillStyle = p.color;
      contextoPetalos.beginPath();
      contextoPetalos.moveTo(0, -p.size);
      contextoPetalos.bezierCurveTo(p.size, -p.size, p.size, p.size, 0, p.size);
      contextoPetalos.bezierCurveTo(
        -p.size,
        p.size,
        -p.size,
        -p.size,
        0,
        -p.size,
      );
      contextoPetalos.fill();
      contextoPetalos.restore();
    }

    animacionPetalos = window.requestAnimationFrame(dibujarPetalos);
  }

  function iniciarPetalos() {
    if (!el.petalsCanvas || reducirMovimiento) return;
    contextoPetalos = el.petalsCanvas.getContext("2d");
    if (!contextoPetalos) return;
    ajustarCanvas();
    petalos = Array.from({ length: 22 }, () => crearPetalo(true));
    if (animacionPetalos === null)
      animacionPetalos = window.requestAnimationFrame(dibujarPetalos);
  }

  function pausarPetalos() {
    if (animacionPetalos !== null) {
      window.cancelAnimationFrame(animacionPetalos);
      animacionPetalos = null;
    }
  }

  window.addEventListener("resize", ajustarCanvas, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pausarPetalos();
    else if (
      contextoPetalos &&
      !reducirMovimiento &&
      animacionPetalos === null
    ) {
      animacionPetalos = window.requestAnimationFrame(dibujarPetalos);
    }
  });

  iniciarPetalos();
});
