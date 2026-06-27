import { MAP_SIDE, teamColorFor } from '../config.js';
import { activeLanguage } from '../i18n.js';

const PLAYER_RADIUS = 4;
const PLAYER_BORDER_WIDTH = 1;
const LOCAL_BORDER_COLOR = 'rgb(255, 0, 0)';
const SELECTED_RING_COLOR = 'rgb(255, 255, 255)';
const SELECTED_RING_GAP = 1;
const SELECTED_RING_WIDTH = 1;
const BAR_WIDTH = 28;
const BAR_HEIGHT = 3;
const BAR_BORDER_WIDTH = 0.5;
const BAR_BORDER_COLOR = 'rgb(0, 0, 0)';
const TEXT_OUTLINE_WIDTH = 1;
const PLAYER_DECORATION_GAP = 3;
const LABEL_GAP = 2;
const LABEL_LINE_GAP = 2;
const SHIELD_TIERS = Object.freeze({
    50: Object.freeze({ widthScale: 0.5, color: 'rgb(224, 224, 224)' }),
    75: Object.freeze({ widthScale: 0.75, color: 'rgb(50, 133, 205)' }),
    100: Object.freeze({ widthScale: 1, color: 'rgb(135, 65, 177)' }),
    125: Object.freeze({ widthScale: 1.25, color: 'rgb(209, 17, 15)' })
});

function mapPoint(position, width, height) {
    const mapScale = Math.min(width, height) / MAP_SIDE;
    return {
        x: position.x * mapScale,
        y: position.y * mapScale
    };
}

function playerStatus(player, t) {
    if (player.is_dead) return t('player.dead');
    if (player.is_down) return t('player.down');
    return t('player.alive');
}

function compactValue(value) {
    if (value === null || value === undefined || value === '') return '';
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(1);
    return String(value);
}

function pushIfValue(parts, value) {
    const text = compactValue(value);
    if (text) parts.push(text);
}

function mapInfoLinesZhHans(player, settings) {
    const first = [];
    const second = [];
    if (settings.showName) pushIfValue(first, player.name);
    if (settings.showLegend) pushIfValue(first, player.legend);
    if (settings.showCombat) {
        const damage = compactValue(player.damage);
        const kills = compactValue(player.kills);
        if (damage) first.push(`伤${damage}`);
        if (kills) first.push(`K.${kills}`);
    }
    if (settings.showLevel) {
        const level = compactValue(player.level);
        if (level) second.push(`Lv.${level}`);
    }
    if (settings.showRank) pushIfValue(second, player.rank);
    if (settings.showRoster) pushIfValue(second, player.roster);
    return [first, second];
}

function mapInfoLinesZhHant(player, settings) {
    const first = [];
    const second = [];
    if (settings.showName) pushIfValue(first, player.name);
    if (settings.showLegend) pushIfValue(first, player.legend);
    if (settings.showCombat) {
        const damage = compactValue(player.damage);
        const kills = compactValue(player.kills);
        if (damage) first.push(`DMG${damage}`);
        if (kills) first.push(`K.${kills}`);
    }
    if (settings.showLevel) {
        const level = compactValue(player.level);
        if (level) second.push(`Lv.${level}`);
    }
    if (settings.showRank) pushIfValue(second, player.rank);
    if (settings.showRoster) pushIfValue(second, player.roster);
    return [first, second];
}

function mapInfoLinesEn(player, settings) {
    const first = [];
    const second = [];
    if (settings.showName) pushIfValue(first, player.name);
    if (settings.showLegend) pushIfValue(first, player.legend);
    if (settings.showCombat) {
        const damage = compactValue(player.damage);
        const kills = compactValue(player.kills);
        if (damage) first.push(`DMG${damage}`);
        if (kills) first.push(`K.${kills}`);
    }
    if (settings.showLevel) {
        const level = compactValue(player.level);
        if (level) second.push(`Lv.${level}`);
    }
    if (settings.showRank) pushIfValue(second, player.rank);
    if (settings.showRoster) pushIfValue(second, player.roster);
    return [first, second];
}

function mapInfoLines(player, settings) {
    const groups = activeLanguage === 'zh-Hans'
        ? mapInfoLinesZhHans(player, settings)
        : activeLanguage === 'zh-Hant'
            ? mapInfoLinesZhHant(player, settings)
            : mapInfoLinesEn(player, settings);
    return groups.map((parts) => parts.join(' ')).filter(Boolean);
}

function drawBar(ctx, x, y, width, height, value, maximum, color) {
    const ratio = maximum > 0 ? Math.min(1, Math.max(0, value / maximum)) : 0;
    const innerWidth = Math.max(0, width - BAR_BORDER_WIDTH * 2);
    const innerHeight = Math.max(0, height - BAR_BORDER_WIDTH * 2);
    const fillWidth = innerWidth * ratio;
    if (fillWidth > 0 && innerHeight > 0) {
        ctx.fillStyle = color;
        ctx.fillRect(
            x + BAR_BORDER_WIDTH,
            y + BAR_BORDER_WIDTH,
            fillWidth,
            innerHeight
        );
    }
    ctx.strokeStyle = BAR_BORDER_COLOR;
    ctx.lineWidth = BAR_BORDER_WIDTH;
    ctx.strokeRect(x, y, width, height);
}

export function shieldBarStyle(maxShield) {
    const numericMaximum = Number(maxShield);
    if (!Number.isFinite(numericMaximum) || numericMaximum <= 0) return null;
    const tier = SHIELD_TIERS[numericMaximum];
    return tier ? { width: BAR_WIDTH * tier.widthScale, color: tier.color } : null;
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

    if (selectedPlayer?.position) {
        const selectedPoint = mapPoint(selectedPlayer.position, width, height);
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.58)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(selectedPoint.x, 0);
        ctx.lineTo(selectedPoint.x, height);
        ctx.moveTo(0, selectedPoint.y);
        ctx.lineTo(width, selectedPoint.y);
        ctx.stroke();
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
        ctx.strokeStyle = player.self ? LOCAL_BORDER_COLOR : 'rgba(2, 6, 23, 0.95)';
        ctx.lineWidth = PLAYER_BORDER_WIDTH;
        ctx.beginPath();
        ctx.arc(point.x, point.y, PLAYER_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (selected) {
            ctx.strokeStyle = SELECTED_RING_COLOR;
            ctx.lineWidth = SELECTED_RING_WIDTH;
            ctx.beginPath();
            ctx.arc(
                point.x,
                point.y,
                PLAYER_RADIUS + PLAYER_BORDER_WIDTH / 2 + SELECTED_RING_GAP + SELECTED_RING_WIDTH / 2,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }

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

        const shieldStyle = settings.showShield ? shieldBarStyle(player.max_shield) : null;
        const visibleBarCount = Number(Boolean(shieldStyle)) + Number(Boolean(settings.showHealth));
        let barY = point.y - PLAYER_RADIUS - PLAYER_DECORATION_GAP - visibleBarCount * BAR_HEIGHT;
        if (shieldStyle) {
            drawBar(
                ctx,
                point.x - BAR_WIDTH / 2,
                barY,
                shieldStyle.width,
                BAR_HEIGHT,
                player.shield,
                Number(player.max_shield),
                shieldStyle.color
            );
            barY += BAR_HEIGHT;
        }
        if (settings.showHealth) {
            drawBar(ctx, point.x - BAR_WIDTH / 2, barY, BAR_WIDTH, BAR_HEIGHT, player.hp, player.max_hp, '#FFFFFF');
        }

        const lines = mapInfoLines(player, settings);
        if (lines.length) labels.push({ point, color: player.self ? '#FFFFFF' : teamColor, lines, alpha, player });
        ctx.restore();
    }

    ctx.save();
    ctx.font = `600 ${settings.fontSize}px "Microsoft YaHei", Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (const label of labels) {
        ctx.globalAlpha = label.alpha;
        const y = label.point.y + PLAYER_RADIUS + LABEL_GAP;
        const lineHeight = settings.fontSize + LABEL_LINE_GAP;
        label.lines.forEach((line, index) => {
            const text = line.slice(0, 72);
            const lineY = y + index * lineHeight;
            ctx.strokeStyle = 'rgba(2, 6, 23, 0.92)';
            ctx.lineWidth = TEXT_OUTLINE_WIDTH;
            ctx.strokeText(text, label.point.x, lineY);
            ctx.fillStyle = label.color;
            ctx.fillText(text, label.point.x, lineY);
        });
    }
    ctx.restore();
}

export function formatPlayerStatus(player, t) {
    return playerStatus(player, t);
}

