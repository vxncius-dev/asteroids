const nave =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAA+klEQVR4nN3UsS4EURSA4RFisYVaIojEE9AoqDYShVfQUfIIlAqJeAWlTkg8ACWFjngAOhGNTaxPcydZ7OzMnZlt9q8n/5+cc+YmydCAHcwPMnCMDi6xPIjApt/cYqvOQBNt/7nDNkbriNzI5hn7aFQJHMrnJXw3XSawpjjvOMVMTGAcH+L4xBmWikaulaMTTnwlL3CgGt+4wnpW4KJioI1zrPaSN0rsIOUVR5jtN54N8dxjFxNFFnxSUPoVFtrKlf4JPOWI38Ltz0WJg3yxj/gxPBNT0eKuwF7GXbcwUlrc4wdLn4CFytIu+SQewhiatYlTMFbLGJJh5AfYJTFYlvD1YQAAAABJRU5ErkJggg==";
const vel = 1;
const commands = document.getElementById("commands");
const pause_ = document.getElementById("pause");
const play_ = document.getElementById("play");
const controlsButton = document.getElementById("controls");
const modal = document.getElementById("optionsControls");
const pauseModal = document.getElementById("pauseModal");

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
		window.innerWidth <= 766 ? this.controleTouch() : this.controleMouse();
		this.pausarJogo = this.pausarJogo.bind(this);
		this.continuarJogo = this.continuarJogo.bind(this);
		this.sair();
		pause_.addEventListener("click", this.pausarJogo);
		play_.addEventListener("click", this.continuarJogo);
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
				alert("You Lose!");
				this.pausarJogo();
				gameState("pause");
				pauseModal.style.display = "none";
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
			this.atualizarAsteroides(true);
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

	controleMouse() {
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

	controleTouch() {
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
			const angle = Math.atan2(deltaY, deltaX);
			this.nave.rotation = ((angle * 180) / Math.PI + 360) % 360;
			this.nave.x += deltaX;
			this.nave.y += deltaY;
			touchStartX = touchX;
			touchStartY = touchY;
		});

		this.canvas.addEventListener("touchstart", () => {
			if (this.contadorPonto % 10 === 0) this.criarPonto();
			this.contadorPonto++;
		});
	}

	iniciarJogo() {
		if (pauseModal.style.display === "flex") pauseModal.style.display = "none";
		gameState("start");
		controlsButton.style.display = "none";
		this.estadoJogo = "jogando";
		this.loop();
	}

	pausarJogo() {
		if (this.estadoJogo === "jogando") {
			this.estadoJogo = "pausado";
			this.atualizarAsteroides(false);
			pauseModal.style.display = "flex";
			pause_.style.display = "none";
			setTimeout(() => {
				pauseModal.style.opacity = "1";
			}, 200);
		}
	}

	continuarJogo() {
		pause_.style.display = "block";
		this.estadoJogo = "jogando";
		jogo.atualizarAsteroides(true);
		if (pauseModal.style.display === "flex") pauseModal.style.display = "none";
	}

	sair() {
		pauseModal.style.opacity = "0";
		setTimeout(() => {
			pauseModal.style.display = "none";
		}, 200);
		gameState("pause");
		this.estadoJogo = "pausado";
	}
}

const jogo = new JogoAsteroides("canvas");

controlsButton.querySelector("img").src =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAB50lEQVR4nO3WPWgUQRTA8UsipFHQQtugnaQxWJgYG+MHGFu1sra0sLEz8aPSRkvLiJVgF8uEQzBFjEmjEDBpJVYWQlAh+cmad/Fx7undeXeF+IeDuZ2Z999583Z2K5X/NAFOYjp+Y5VegDvY9pOiPd2LlW4naZaPdlN8W2O6t2o7e9qIqW6KxxqkegsnuiZOq64vrluVXoDRuIGprq+0BvpwOP3fbXcFHMA1vMNSur6E97iJQ50UHsdjbKZ9rRfX+IpnOFtkph3Z/ljd2waPTiNxpvksKF9du+I/ZwHnsZoGf8BTPMfnvxRnVgtXFr9MnR+xL/UNlwRYTv3LWqOaxWewnlJzFXtxEHdLJm/GC+NUE9uSWcdEfbr7cTkel06zFsW6p156DiPpBi5hpQPClYjVH7FHcCGLX8eZO1v7oogT6iIW2hAuxNy+9HKZDcduYRYdi3UT53A69U9gvgnhXN7DIkZcyyxm8XhRbX7lFSbTnRcVfi/GrsUhUY1rwylTkzG3nmrhKjtAxlNKMm+i8AZLT56duYMxphibKWK9KBWWBDkWp03xgs98wgxuhORKtGeiL7MVMX4UbUvgCB7hi+b5hic42pqtBAzhITZ+I9yIMUOVToOBqPDreID70S6qd6Djwsq/xHdlzM/fqvNlJQAAAABJRU5ErkJggg==";

document.querySelector("#touch img").src =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAACbUlEQVR4nO2avWsUQRTAnx9EDNpLYkQQtBBTCgGxEQsJaKcxNmIlMUYQG60s/RfsBAsFGxuJwYiiiUlplS5Wflt5ajzzcT8Z962sY8zNxZvJ29UfHMe9N8O9H7M7Ozu7IqsE2AqMAA+B18C8frvf54EtYh1gAHjHyrwFjotVgCtAQ4t9CpwAuoAOoFslJzTv2l0Wa5AV6YpbAIaatB3Wdg1TI0N2TuSH01Bgn3Pa/o2Zc4bsxP5xOLXYLz/MhsUCZLORY8CL7wRGdbTuATu8/KD2eyAWIJtaHV1e/Ik3W/1SsE4AjldiAaCuBXV4cXf9KPLVy2/S+LxYAHihBXV78d/w8ts1/EEsAIxpQSdbFDll7Rw5owVNAutCRFw7YErDp8UCQCfwXosaCRS5oCE3o20WKwD9eqVeDBRZ1PZHxBrAJWApUGQJuChWAY4FihyVskCTWas08C+IAD3u+gF8BMb9dViZRMa81P1CbhfwGPgMPAP2rplEgEi+PsupL7OazplaM4kAkfyWOKdRyM15uZ+LSmCP3ka70ZpOMlp/IbKwQr9HXmqyrCKfvNS3sorU/5SzIuLoA/Y36Vc3IQIc0E+rHGwmmVqk7ch/kSYA64GzpR4Rsp2RW6kkYorcITESQeJQaolYIjepiMhsVUS+VEVkriois1URuV0VkcGqiHQGPJq2L+Jw26CJPWoSA2Aj8DyhyEwUEZXp0932FNyIJqIyVxOJ9McW2bDM1k27mS4+IYsps63w6Lrd1IDe6BIFmX0RZGrA4WQS3osBd9skMQHsTi7hCfUC13Tv9qV7gSCgcLfHOwNcdzduq/nj7+NY4KdxGT+/AAAAAElFTkSuQmCC";

document.querySelector("#mouse img").src =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAACU0lEQVR4nO3by6tNYRjH8celI/dLOCZGciuUMpBQGMvIJcXglHNOxFAm/gF/ABkoM5cyESMZCTFFJAZyKWTAROicj1b7PXXoxN7b2du79lrfWrXa61K/73re1XrXenZETU2pwA6siiqCpRjBg6gi2KzB7agiOJ0EnImqgcX4iFFsjCqBhbiTrv6lqAKYiuU4htcp/BPMj14E03EYN/EOP/zK9aISohfBajz+LfBXPMdF7IxeRSP8pxT6KQ5hSVQBTMOjcSU+M6qExtUueIlZUTVwIwkYiiqCN0nAiqgi+JYEzIkqgu9JwOyoImoBqlEBWIZBXEiPurcwY1wFLEq/3Uz7HEF/lB3049wEz/UFs8YJWDLB9mLb2eItUJQRbMCrCYI1K2CMt9gUZQJr8fkPoVoRIJ1rTZQBjbH97C+BWhUwNlHqi9zBiSbCtCOg4FjkjsYcvlMCnkXOYGWTQdoVkPe8AXu6IGB35AoGuiBgIHIFw10QMBy5ohag1Qr4nKpgQVUrYCt2pfWeELAd55tcZow7rq+F47b/35Q1f50EDXZ4WRs9cg9ol6zvAcNtx6oFNE1dAZEr6iGgvgfoPPUQiFxRDwFDXRgC+fYSYF8XBOyNXMG2LgjYEpl/BB3tYPiR7D+a4mEHBdyP3MGpDgo4GbmDuXjfgfAfMC/KAI53QMDRKAuYgsuTGP5acc4oE5iNe5MQ/m5pu0g1egWKbu92udQT/cM4kPqBm+UF9kcvofHu/yCu4ssEoYuvRFfSPvl3gkzSn6DWY12x/s8nrKmpqYnW+QlLeKaD93YpeAAAAABJRU5ErkJggg==";

document.querySelector("#play img").src =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABFklEQVR4nO3ZsW3CQBjF8Q8hoIEuLU0GyAJswBCskAIGyAop06ZMmwW8AAzgmtYdjWXFf4TgpEgpUODu7HfcbwI/yfa9+z6zLMuy34ANMDZ1nJXA0hII4nwDz6aIv2rgHZiZeBBnD6yAgSngugJ4sQSCnPwAn8CT9RX/UwGvwNDEgzg7YGF9wu1a4AuYm3gQ5wC8ARP1IPSiHeBfN+2AMOK3A8KK1w6IowjeDoinAT6CtQPiq4K0A7qz89oO6FbrrR3kIPfbqr9alfrH3qTw+y3UD0T5ilJfSuM0eAAnQAj5Gl+qX6wO6lfdNoXhw1Z9HFSpD+iaoKeyD48wxN6rrxXq6KeyD6mt3soUlqFrYNT1c2RZ9uCOorLyFKJbgmwAAAAASUVORK5CYII=";

document.querySelector("#exit img").src =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA+0lEQVR4nO3YsQ3CMBBGYUswBnPS0rIHFMhUNIwAA2SghyJRoBASUxzk7v6vTeN7seLIpYiIiEgLnChWcEIBrOCEAljBCQWwghMKYAUnFMAKTiiAFf7vAmyBW8YAu5d1rIBDpgAdsB6sZQ2csgTonUcijO6EqAGaI0QO0BQheoDZCBkCTEbIEoDnKfB2OmQKMLoTFhOgRIMCfG1TIuF711ARWKa62I/gD6Q+BuuHH6FjhgD10/D9w+gB6tTw0QPUueEjB6gtw0cN0OlKDPZzbz7yDhhei9+ZEDlAEwWwghMKYAUnFMAKTiiAFZxQACs4oQBWyB5ARESkhPIAzQjhA4ohO+YAAAAASUVORK5CYII=";

document.querySelector("#pause img").src =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAVklEQVR4nO3SoRHAMBAEMfffdEK2gIBzkMQf/NyeAwA/ej66dT/jkVhkTVqR1pq0Iq01aUVaa9KKtNakFWmtSSvSWpNWpLUmrUhrTVqR1pq0Ii0AOPe8ZXiV98fYlvIAAAAASUVORK5CYII=";

const modalControls = () => {
	if (modal.style.display === "flex") {
		modal.style.opacity = "0";
		setTimeout(() => {
			modal.style.display = "none";
		}, 300);
	} else {
		modal.style.display = "flex";
		setTimeout(() => {
			modal.style.opacity = "1";
		}, 200);
	}
};

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape") {
		modal.style.opacity = "0";
		setTimeout(() => {
			modal.style.display = "none";
		}, 300);
	}
});

document.addEventListener("keydown", (event) => {
	if (event.key === "o") modalControls();
});

window.addEventListener("resize", function () {
	const windowWidth = window.innerWidth;
	controlsButton.style.display = windowWidth >= 766 ? "none" : "flex";
});
