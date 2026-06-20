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

export function renderEntities(ctx, snapshot, settings, selectedPlayer, dimensions, t) {
    const { width, height } = dimensions;
    ctx.clearRect(0, 0, width, height);
    if (!snapshot) return;

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

        let barY = point.y + 8;
        if (settings.showHealth) {
            drawBar(ctx, point.x - 14, barY, 28, 4, player.hp, player.max_hp, '#4ADE80');
            barY += 5;
        }
        if (settings.showShield) {
            drawBar(ctx, point.x - 14, barY, 28, 4, player.shield, player.max_shield, '#60A5FA');
        }

        const parts = [];
        if (settings.showName) parts.push(player.name);
        if (settings.showLegend && player.legend) parts.push(player.legend);
        if (settings.showLevel) parts.push(`${t('table.columns.level')} ${player.level}`);
        if (settings.showRank && player.rank) parts.push(`${t('table.columns.rank')} ${player.rank}`);
        if (settings.showCombat) parts.push(`${t('table.columns.kills')} ${player.kills} · ${t('table.columns.damage')} ${player.damage}`);
        if (settings.showRoster) parts.push(`${t('table.columns.roster')} ${player.roster}`);
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

