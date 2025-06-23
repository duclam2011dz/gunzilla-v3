export function drawBlackHoleEffect(ctx, x, y, player) {
	if (!player.particles) {
		player.particles = Array.from({ length: 30 }, () => ({
			angle: Math.random() * Math.PI * 2,
			radius: Math.random() * 30 + 10,
			speed: Math.random() * 0.5 + 0.3,
			opacity: Math.random()
		}));
	}

	for (let p of player.particles) {
		const px = x + Math.cos(p.angle) * p.radius;
		const py = y + Math.sin(p.angle) * p.radius;

		ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
		ctx.beginPath();
		ctx.arc(px, py, 2, 0, Math.PI * 2);
		ctx.fill();

		p.radius -= p.speed;
		p.opacity -= 0.01;

		if (p.radius <= 2 || p.opacity <= 0) {
			p.radius = Math.random() * 30 + 10;
			p.angle = Math.random() * Math.PI * 2;
			p.speed = Math.random() * 0.5 + 0.3;
			p.opacity = 1;
		}
	}

	// Black hole core
	ctx.fillStyle = "#000";
	ctx.beginPath();
	ctx.arc(x, y, 10, 0, Math.PI * 2);
	ctx.fill();
}

export function drawLavaEffect(ctx, x, y, time = 0) {
	const t = (Math.sin(time / 200 + x / 5) + 1) / 2;
	const brightness = 0.6 + t * 0.4;

	const color1 = `rgba(${255 * brightness}, ${80 * brightness}, 0, 1)`;
	const color2 = `rgba(${255 * brightness}, ${140 * brightness}, 0, 1)`;

	const gradient = ctx.createLinearGradient(x - 10, y - 10, x + 10, y + 10);
	gradient.addColorStop(0, color1);
	gradient.addColorStop(1, color2);

	ctx.shadowColor = `rgba(255, 80, 0, 0.8)`;
	ctx.shadowBlur = 20;

	ctx.fillStyle = gradient;
	ctx.fillRect(x - 10, y - 10, 20, 20);
	ctx.shadowBlur = 0;
}

export function drawNeonGlow(ctx, x, y, time = 0) {
	const glow = Math.sin(time / 200) * 8 + 12; // dao động blur

	ctx.fillStyle = "#0ff";
	ctx.shadowColor = "#0ff";
	ctx.shadowBlur = glow;
	ctx.fillRect(x - 10, y - 10, 20, 20);
	ctx.shadowBlur = 0;
}

export function drawGalaxySwirl(ctx, x, y, time = 0) {
	const offset = Math.sin(time / 400) * 10;

	const gradient = ctx.createLinearGradient(x - 10 + offset, y, x + 10 - offset, y);
	gradient.addColorStop(0, "purple");
	gradient.addColorStop(0.5, "navy");
	gradient.addColorStop(1, "black");

	ctx.fillStyle = gradient;
	ctx.fillRect(x - 10, y - 10, 20, 20);

	// particles lấp lánh
	for (let i = 0; i < 4; i++) {
		const px = x + Math.random() * 20 - 10;
		const py = y + Math.random() * 20 - 10;
		ctx.fillStyle = "rgba(255,255,255,0.1)";
		ctx.beginPath();
		ctx.arc(px, py, 1, 0, Math.PI * 2);
		ctx.fill();
	}
}