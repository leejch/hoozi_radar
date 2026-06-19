import { MAP_SIDE, teamColorFor } from '../config.js';

function mapPoint(position, width, height) {
    return {
        x: (position.x / MAP_SIDE) * width,
        y: (position.y / MAP_SIDE) * height
    };
}

function playerStatus(player, t) {
    if (player.is_dead) return t('player.dead');
    if (player.is_down) return t('player.down');
    return t('player.alive');
}

function drawBar(ctx, x, y, width, height, value, maximum, color) {
    const ratio = maximum > 0 ? Math.min(1, Math.max(0, value / maximum)) : 0;
    ctx.fillStyle = 'rgba(2, 6, 23, 0.82)';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, Math.max(0, (width - 2) * ratio), Math.max(0, height - 2));
}

function drawRing(ctx, ring, width, height, t) {
    const center = mapPoint(ring, width, height);
    const radius = ring.radius / MAP_SIDE * Math.min(width, height);
    ctx.save();
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.95)';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.06)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    const seconds = Math.max(0, ring.t_end - ring.t_now);
    const label = t('map.ringRemaining', { seconds: seconds.toFixed(1) });
    ctx.font = '600 11px "Microsoft YaHei", Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.strokeStyle = 'rgba(2, 6, 23, 0.9)';
    ctx.lineWidth = 3;
    ctx.strokeText(label, center.x, Math.max(14, center.y - radius - 4));
    ctx.fillStyle = '#BAE6FD';
    ctx.fillText(label, center.x, Math.max(14, center.y - radius - 4));
    ctx.restore();
}

export function renderEntities(ctx, snapshot, settings, selectedPlayer, dimensions, t) {
    const { width, height } = dimensions;
    ctx.clearRect(0, 0, width, height);
    if (!snapshot) return;

    if (settings.showRing && snapshot.ring) drawRing(ctx, snapshot.ring, width, height, t);

    const visiblePlayers = snapshot.players.filter((player) => {
        if (!player.position) return false;
        if (!settings.showDead && player.is_dead) return false;
        if (!settings.showDown && player.is_down) return false;
        return true;
    });

    if (settings.showTeamLinks && selectedPlayer?.position) {
        const selectedPoint = mapPoint(selectedPlayer.position, width, height);
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1;
        for (const player of visiblePlayers) {
            if (player.id === selectedPlayer.id || player.team !== selectedPlayer.team) continue;
            const point = mapPoint(player.position, width, height);
            ctx.beginPath();
            ctx.moveTo(selectedPoint.x, selectedPoint.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        }
        ctx.restore();
    }

    const labels = [];
    for (const player of visiblePlayers) {
        const point = mapPoint(player.position, width, height);
        const teamColor = teamColorFor(player.team);
        const selected = player.id === selectedPlayer?.id;
        const alpha = player.is_dead ? 0.42 : 1;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = player.self ? '#FFFFFF' : teamColor;
        ctx.strokeStyle = selected ? '#FFFFFF' : 'rgba(2, 6, 23, 0.95)';
        ctx.lineWidth = selected ? 3 : 1.5;
        ctx.beginPath();
        ctx.arc(point.x, point.y, player.self ? 6 : 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (player.is_down) {
            ctx.strokeStyle = '#FBBF24';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(point.x - 6, point.y);
            ctx.lineTo(point.x + 6, point.y);
            ctx.stroke();
        } else if (player.is_dead) {
            ctx.strokeStyle = '#FB7185';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(point.x - 5, point.y - 5);
            ctx.lineTo(point.x + 5, point.y + 5);
            ctx.moveTo(point.x + 5, point.y - 5);
            ctx.lineTo(point.x - 5, point.y + 5);
            ctx.stroke();
        }

        if (settings.showVitals) {
            drawBar(ctx, point.x - 14, point.y + 8, 28, 4, player.hp, player.max_hp, '#4ADE80');
            drawBar(ctx, point.x - 14, point.y + 13, 28, 4, player.shield, player.max_shield, '#60A5FA');
        }

        const parts = [];
        if (settings.showName) parts.push(player.name);
        if (settings.showLegend && player.legend) parts.push(player.legend);
        if (settings.showStats) parts.push(`Lv ${player.level} · K ${player.kills} · Dmg ${player.damage}`);
        if (parts.length) labels.push({ point, color: player.self ? '#FFFFFF' : teamColor, text: parts.join(' · '), alpha, player });
        ctx.restore();
    }

    ctx.save();
    ctx.font = `600 ${settings.fontSize}px "Microsoft YaHei", Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    for (const label of labels) {
        ctx.globalAlpha = label.alpha;
        const y = label.point.y - 9;
        ctx.strokeStyle = 'rgba(2, 6, 23, 0.92)';
        ctx.lineWidth = 3;
        ctx.strokeText(label.text.slice(0, 72), label.point.x, y);
        ctx.fillStyle = label.color;
        ctx.fillText(label.text.slice(0, 72), label.point.x, y);
    }
    ctx.restore();
}

export function formatPlayerStatus(player, t) {
    return playerStatus(player, t);
}

