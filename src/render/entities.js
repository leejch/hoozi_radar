import { MAP_SIDE, teamColorFor } from '../config.js';
import { activeLanguage } from '../i18n.js';
import { localPlayerTeam, playerForDisplay } from '../player-display.js';
import { rosterTags } from '../ui/roster.js';

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

function textSegment(text, color = '') {
    return Object.freeze({ text, color });
}

function pushIfValue(parts, value) {
    const text = compactValue(value);
    if (text) parts.push(textSegment(text));
}

function pushRosterIfValue(parts, value) {
    const tags = rosterTags(value, activeLanguage);
    const text = tags.map((tag) => tag.text).join('');
    if (text) parts.push(textSegment(text, tags[0]?.color || ''));
}

function lineFromParts(parts) {
    if (!parts.length) return null;
    const segments = [];
    parts.forEach((part, index) => {
        const segment = typeof part === 'string' ? textSegment(part) : part;
        if (index > 0) segments.push(textSegment(' '));
        segments.push(segment);
    });
    return Object.freeze({
        text: segments.map((segment) => segment.text).join(''),
        segments: Object.freeze(segments)
    });
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
        if (level) second.push(player.displayRedacted ? level : `Lv.${level}`);
    }
    if (settings.showRank) pushIfValue(second, player.rank);
    if (settings.showRoster) pushRosterIfValue(second, player.roster);
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
        if (level) second.push(player.displayRedacted ? level : `Lv.${level}`);
    }
    if (settings.showRank) pushIfValue(second, player.rank);
    if (settings.showRoster) pushRosterIfValue(second, player.roster);
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
        if (level) second.push(player.displayRedacted ? level : `Lv.${level}`);
    }
    if (settings.showRank) pushIfValue(second, player.rank);
    if (settings.showRoster) pushRosterIfValue(second, player.roster);
    return [first, second];
}

function mapInfoLines(player, settings) {
    const groups = activeLanguage === 'zh-Hans'
        ? mapInfoLinesZhHans(player, settings)
        : activeLanguage === 'zh-Hant'
            ? mapInfoLinesZhHant(player, settings)
            : mapInfoLinesEn(player, settings);
    return groups.map(lineFromParts).filter(Boolean);
}

function truncatedSegments(segments, maxLength) {
    const truncated = [];
    let remaining = maxLength;
    for (const segment of segments) {
        if (remaining <= 0) break;
        const text = String(segment.text || '');
        if (!text) continue;
        const nextText = text.slice(0, remaining);
        if (nextText) truncated.push(textSegment(nextText, segment.color || ''));
        remaining -= nextText.length;
    }
    return truncated;
}

function textWidth(ctx, text) {
    return typeof ctx.measureText === 'function' ? ctx.measureText(text).width : text.length;
}

function drawLabelLine(ctx, line, label, y) {
    const segments = truncatedSegments(line.segments, 72);
    if (!segments.length) return;
    const text = segments.map((segment) => segment.text).join('');
    ctx.strokeStyle = 'rgba(2, 6, 23, 0.92)';
    ctx.lineWidth = TEXT_OUTLINE_WIDTH;
    ctx.textAlign = 'center';
    ctx.strokeText(text, label.point.x, y);

    const segmentWidths = segments.map((segment) => textWidth(ctx, segment.text));
    let x = label.point.x - segmentWidths.reduce((total, width) => total + width, 0) / 2;
    ctx.textAlign = 'left';
    segments.forEach((segment, index) => {
        ctx.fillStyle = segment.color || label.color;
        ctx.fillText(segment.text, x, y);
        x += segmentWidths[index];
    });
    ctx.textAlign = 'center';
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

export function renderEntities(ctx, snapshot, settings, selectedPlayer, dimensions, t, { clear = true } = {}) {
    const { width, height } = dimensions;
    if (clear) ctx.clearRect(0, 0, width, height);
    if (!snapshot) return;
    const localTeam = localPlayerTeam(snapshot.players);

    const visiblePlayers = snapshot.players.filter((player) => {
        if (!player.position) return false;
        if (player.is_dead) return false;
        return true;
    });

    if (settings.showTeamLinks && selectedPlayer?.position) {
        const selectedPoint = mapPoint(selectedPlayer.position, width, height);
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
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
        ctx.fillStyle = teamColor;
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
            ctx.strokeStyle = '#FB7185';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(point.x - 5, point.y - 5);
            ctx.lineTo(point.x + 5, point.y + 5);
            ctx.moveTo(point.x + 5, point.y - 5);
            ctx.lineTo(point.x - 5, point.y + 5);
            ctx.stroke();
        }

        const showHealthBar = settings.showVitals && !player.is_dead;
        const shieldStyle = showHealthBar && !player.is_down ? shieldBarStyle(player.max_shield) : null;
        const visibleBarCount = Number(Boolean(shieldStyle)) + Number(showHealthBar);
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
        if (showHealthBar) {
            drawBar(ctx, point.x - BAR_WIDTH / 2, barY, BAR_WIDTH, BAR_HEIGHT, player.hp, player.max_hp, '#FFFFFF');
        }

        const lines = mapInfoLines(playerForDisplay(player, localTeam), settings);
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
            const lineY = y + index * lineHeight;
            drawLabelLine(ctx, line, label, lineY);
        });
    }
    ctx.restore();
}

export function formatPlayerStatus(player, t) {
    return playerStatus(player, t);
}

