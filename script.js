//gameFont - https://www.cdnfonts.com/eight-bit-dragon.font
//https://fontstruct.com/fontstructions/show/1534627/asteroids-display
//https://imageio.forbes.com/specials-images/imageserve/618ed11bde61f1b9de93c0c6/The-space-themed-multidirectional-shooter-arcade-game--Asteroids--/960x0.jpg?format=jpg&width=1440

const nave =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAA+klEQVR4nN3UsS4EURSA4RFisYVaIojEE9AoqDYShVfQUfIIlAqJeAWlTkg8ACWFjngAOhGNTaxPcydZ7OzMnZlt9q8n/5+cc+YmydCAHcwPMnCMDi6xPIjApt/cYqvOQBNt/7nDNkbriNzI5hn7aFQJHMrnJXw3XSawpjjvOMVMTGAcH+L4xBmWikaulaMTTnwlL3CgGt+4wnpW4KJioI1zrPaSN0rsIOUVR5jtN54N8dxjFxNFFnxSUPoVFtrKlf4JPOWI38Ltz0WJg3yxj/gxPBNT0eKuwF7GXbcwUlrc4wdLn4CFytIu+SQewhiatYlTMFbLGJJh5AfYJTFYlvD1YQAAAABJRU5ErkJggg==";
const vel = 1;
const commands = document.getElementById("commands");
const pause_ = document.getElementById("pause");
const gameState = (state_) => {
	if (state_ === "start") {
		commands.style.opacity = "0";
		pause_.style.opacity = "1";
		setTimeout(() => {
			pause_.style.display = "block";
		}, 300);
	} else if (state_ === "pause") {
		commands.style.opacity = "1";
		pause_.style.display = "none";
		setTimeout(() => {
			pause_.style.opacity = "0";
		}, 300);
	}
};

class JogoAsteroides {
	constructor(canvasId) {
		this.canvas = document.querySelector(canvasId);
		this.ctx = this.canvas.getContext("2d");
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.naveImage = new Image();
		this.naveImage.src = nave;
		this.naveImage.classList.add("nave");
		this.nave = {
			x: this.canvas.width / 2,
			y: this.canvas.height / 2,
			size: 30,
			rotation: 0,
			speed: 9
		};
		this.teclasPressionadas = {};
		this.estadoJogo = "pausado";
		this.asteroides = [];
		for (let i = 0; i < 5; i++) {
			const tamanho = Math.random() * 20 + 10;
			const velocidade = vel;
			const x = Math.random() * this.canvas.width;
			const y = Math.random() * this.canvas.height;
			this.asteroides.push(this.criarAsteroide(x, y, tamanho, velocidade));
		}
		this.pontos = [];
		for (let i = 0; i < 5; i++) {
			this.criarPonto();
		}
		this.cursor = {
			x: 0,
			y: 0
		};
		this.contadorPonto = 0;
		this.controleNave();
		this.loop();
	}

	criarAsteroide(x, y, tamanho, velocidade) {
		const lados = Math.floor(Math.random() * 8) + 3;
		const angulo = (Math.PI * 2) / lados;
		const vertices = [];

		for (let i = 0; i < lados; i++) {
			const raio = tamanho + Math.random() * 10;
			const vx = x + raio * Math.cos(i * angulo);
			const vy = y + raio * Math.sin(i * angulo);
			vertices.push({ x: vx, y: vy });
		}

		return {
			vertices,
			tamanho,
			velocidade,
			direcao: Math.random() * 360
		};
	}

	desenharNave() {
		this.ctx.save();
		this.ctx.translate(this.nave.x, this.nave.y);
		const radianAngle = (this.nave.rotation * Math.PI) / 180;
		this.ctx.rotate(radianAngle);
		this.ctx.drawImage(
			this.naveImage,
			-this.nave.size / 2,
			-this.nave.size / 2,
			this.nave.size,
			this.nave.size
		);

		this.ctx.restore();
	}

	desenharAsteroide(asteroide) {
		this.ctx.fillStyle = "#121212";
		this.ctx.strokeStyle = "white";
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		this.ctx.moveTo(asteroide.vertices[0].x, asteroide.vertices[0].y);
		for (let i = 1; i < asteroide.vertices.length; i++) {
			this.ctx.lineTo(asteroide.vertices[i].x, asteroide.vertices[i].y);
		}
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.stroke();
	}

	atualizarNave() {
		this.nave.x = (this.nave.x + this.canvas.width) % this.canvas.width;
		this.nave.y = (this.nave.y + this.canvas.height) % this.canvas.height;
	}

	atualizarAsteroides(debugMode) {
		for (let i = 0; i < this.asteroides.length; i++) {
			const asteroide = this.asteroides[i];
			const radianAngle = (asteroide.direcao * Math.PI) / 180;
			asteroide.vertices.forEach((vertice) => {
				vertice.x += asteroide.velocidade * Math.cos(radianAngle);
				vertice.y += asteroide.velocidade * Math.sin(radianAngle);
			});
			const colidiuNave = asteroide.vertices.some((vertice) => {
				const distancia = Math.sqrt(
					Math.pow(this.nave.x - vertice.x, 2) + Math.pow(this.nave.y - vertice.y, 2)
				);
				return distancia < this.nave.size / 2;
			});
			if (colidiuNave && debugMode) {
				alert("Você colidiu!");
				this.pausarJogo();
				gameState("pause");
				return;
			}
			if (
				asteroide.vertices.some(
					(vertice) =>
						vertice.x < 0 ||
						vertice.y < 0 ||
						vertice.x > this.canvas.width ||
						vertice.y > this.canvas.height
				)
			) {
				const novoTamanho = Math.random() * 20 + 10;
				const novaDirecao = Math.random() * 360;
				this.asteroides[i] = this.criarAsteroide(
					this.canvas.width / 2,
					this.canvas.height / 2,
					novoTamanho,
					vel
				);
				this.asteroides[i].direcao = novaDirecao;
			}
			this.desenharAsteroide(asteroide);
		}
	}

	resetarJogo() {
		this.nave.x = this.canvas.width / 2;
		this.nave.y = this.canvas.height / 2;
		this.asteroides.length = 0;
		for (let i = 0; i < 5; i++) {
			const tamanho = Math.random() * 20 + 10;
			const x = Math.random() * this.canvas.width;
			const y = Math.random() * this.canvas.height;
			this.asteroides.push(this.criarAsteroide(x, y, tamanho, vel));
		}
	}

	criarPonto() {
		const ponto = {
			x: this.nave.x,
			y: this.nave.y,
			velocidade: 3
		};
		if (this.cursor)
			ponto.direcao = Math.atan2(this.cursor.y - ponto.y, this.cursor.x - ponto.x);
		this.pontos.push(ponto);
	}

	atualizarPontos() {
		for (let i = this.pontos.length - 1; i >= 0; i--) {
			const ponto = this.pontos[i];
			ponto.x += ponto.velocidade * Math.cos(ponto.direcao);
			ponto.y += ponto.velocidade * Math.sin(ponto.direcao);
			if (
				ponto.x < 0 ||
				ponto.y < 0 ||
				ponto.x > this.canvas.width ||
				ponto.y > this.canvas.height
			) {
				this.pontos.splice(i, 1);
			}
		}
	}

	desenharPontos() {
		this.ctx.fillStyle = "white";
		this.ctx.lineWidth = 2;
		this.ctx.strokeStyle = "white";
		for (const ponto of this.pontos) {
			this.ctx.beginPath();
			this.ctx.arc(ponto.x, ponto.y, 2, 0, Math.PI * 2);
			this.ctx.fill();
			this.ctx.stroke();
		}
	}

	verificarColisoesAsteroides() {
		for (let i = this.asteroides.length - 1; i >= 0; i--) {
			const asteroide = this.asteroides[i];

			for (let j = this.pontos.length - 1; j >= 0; j--) {
				const ponto = this.pontos[j];
				const distancia = Math.sqrt(
					(ponto.x - asteroide.x) ** 2 + (ponto.y - asteroide.y) ** 2
				);
				if (distancia < 20) {
					this.asteroides.splice(i, 1);
					this.pontos.splice(j, 1);
				}
			}
		}
	}

	verificarColisoesPontosAsteroides() {
		for (let i = this.asteroides.length - 1; i >= 0; i--) {
			const asteroide = this.asteroides[i];
			for (let j = this.pontos.length - 1; j >= 0; j--) {
				const ponto = this.pontos[j];
				const distancia = Math.sqrt(
					(ponto.x - asteroide.vertices[0].x) ** 2 +
						(ponto.y - asteroide.vertices[0].y) ** 2
				);
				if (distancia < asteroide.tamanho) {
					this.asteroides.splice(i, 1);
					this.pontos.splice(j, 1);
				}
			}
		}
	}

	loop() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.desenharNave();
		this.desenharPontos();
		this.atualizarNave();
		this.atualizarPontos();

		if (this.estadoJogo === "jogando") {
			this.atualizarAsteroides(false);
			const numeroAsteroides = this.asteroides.length;
			const limiteAsteroides = 6;
			if (numeroAsteroides < limiteAsteroides) {
				const quantidadeAsteroidesFaltantes = limiteAsteroides - numeroAsteroides;
				for (let i = 0; i < quantidadeAsteroidesFaltantes; i++) {
					const tamanho = Math.random() * 20 + 10;
					const velocidade = vel;
					const x = Math.random() * this.canvas.width;
					const y = Math.random() * this.canvas.height;
					this.asteroides.push(this.criarAsteroide(x, y, tamanho, velocidade));
				}
			}

			if (window.innerWidth <= 766) {
				if (this.contadorPonto % 20 === 0) this.criarPonto();
				this.contadorPonto++;
			}
			this.verificarColisoesAsteroides();
			this.verificarColisoesPontosAsteroides();
		} else {
			this.atualizarAsteroides(false);
		}

		requestAnimationFrame(() => this.loop());
	}

	controleNave() {
		if (window.innerWidth <= 766) {
			let touchStartX = 0;
			let touchStartY = 0;

			this.canvas.addEventListener("touchstart", (event) => {
				touchStartX = event.touches[0].clientX;
				touchStartY = event.touches[0].clientY;
			});

			this.canvas.addEventListener("touchmove", (event) => {
				event.preventDefault();

				const touchX = event.touches[0].clientX;
				const touchY = event.touches[0].clientY;

				const deltaX = touchX - touchStartX;
				const deltaY = touchY - touchStartY;

				// Calcular o ângulo entre a posição atual e a posição anterior do toque
				const angle = Math.atan2(deltaY, deltaX);

				// Converter o ângulo para graus e ajustar para o intervalo de 0 a 360
				this.nave.rotation = ((angle * 180) / Math.PI + 360) % 360;

				// Atualiza a posição da nave com base no movimento
				this.nave.x += deltaX;
				this.nave.y += deltaY;

				touchStartX = touchX;
				touchStartY = touchY;
			});

			this.canvas.addEventListener("touchstart", () => {
				if (this.contadorPonto % 10 === 0) this.criarPonto();
				this.contadorPonto++;
			});
		} else {
			this.canvas.addEventListener("mousemove", (event) => {
				const mouseX = event.clientX - this.canvas.offsetLeft;
				const mouseY = event.clientY - this.canvas.offsetTop;
				this.nave.rotation =
					(Math.atan2(mouseY - this.nave.y, mouseX - this.nave.x) * 180) / Math.PI;
			});

			document.addEventListener("keydown", (event) => {
				const speed = this.nave.speed;
				const radianAngle = (this.nave.rotation * Math.PI) / 180;

				switch (event.key) {
					case "ArrowUp":
					case "w":
						this.nave.x += speed * Math.cos(radianAngle);
						this.nave.y += speed * Math.sin(radianAngle);
						break;
					case "ArrowDown":
					case "s":
						this.nave.x -= speed * Math.cos(radianAngle);
						this.nave.y -= speed * Math.sin(radianAngle);
						break;
					case "ArrowLeft":
					case "a":
						this.nave.rotation -= 10;
						break;
					case "ArrowRight":
					case "d":
						this.nave.rotation += 10;
						break;
				}
				this.atualizarNave();
			});

			this.canvas.addEventListener("mousemove", (event) => {
				this.cursor.x = event.clientX - this.canvas.offsetLeft;
				this.cursor.y = event.clientY - this.canvas.offsetTop;
			});

			document.addEventListener("keydown", (event) => {
				this.teclasPressionadas[event.key] = true;
				if (event.code === "Space" && this.estadoJogo === "pausado") {
					this.iniciarJogo();
				} else if (event.code === "Space" && this.estadoJogo === "jogando") {
					this.criarPonto();
				}
			});

			document.addEventListener("keyup", (event) => {
				this.teclasPressionadas[event.key] = false;
			});
		}

		document.addEventListener("mousedown", (e) => {
			if (this.estadoJogo === "jogando") {
				switch (e.buttons) {
					case 1:
						this.criarPonto();
						break;
				}
			}
		});
	}

	iniciarJogo() {
		gameState("start");
		this.estadoJogo = "jogando";
		this.loop();
	}

	pausarJogo() {
		gameState("pause");
		this.estadoJogo = "pausado";
	}
}

const jogo = new JogoAsteroides("canvas");

// const body = document.body;
// body.addEventListener("touchstart", () => (body.style.background = "red"));
// body.addEventListener("touchmove", () => (body.style.background = "blue"));
// body.addEventListener("touchend", () => (body.style.background = "green"));
