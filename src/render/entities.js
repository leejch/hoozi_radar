import { MAP_SIDE, teamColorFor } from '../config.js';
import { activeLanguage } from '../i18n.js';
import { playerForDisplay } from '../player-display.js';
import { rosterTags } from '../ui/roster.js';

const PLAYER_RADIUS = 4;
const PLAYER_BORDER_WIDTH = 1;
const LOCAL_BORDER_COLOR = 'rgb(255, 0, 0)';
const SELECTED_RING_COLOR = 'rgb(255, 255, 255)';
const SELECTED_RING_GAP = 1;
const SELECTED_RING_WIDTH = 1;
const HEADING_LENGTH = 10;
const HEADING_OUTLINE_WIDTH = 3;
const HEADING_WIDTH = 1.25;
const TEXT_OUTLINE_WIDTH = 1;
const LABEL_GAP = 2;
const LABEL_LINE_GAP = 2;

function mapPoint(position, width, height) {
    const mapScale = Math.min(width, height) / MAP_SIDE;
    return {
        x: position.x * mapScale,
        y: position.y * mapScale
    };
}

function playerStatus(player, t) {
    if (player.is_dead) return t('player.dead');
    return t('player.alive');
}

export function headingVector(yaw) {
    const numericYaw = Number(yaw);
    if (!Number.isFinite(numericYaw)) return null;
    const radians = numericYaw * Math.PI / 180;
    return Object.freeze({ x: Math.cos(radians), y: -Math.sin(radians) });
}

function drawHeading(ctx, point, yaw) {
    const direction = headingVector(yaw);
    if (!direction) return;
    const endX = point.x + direction.x * HEADING_LENGTH;
    const endY = point.y + direction.y * HEADING_LENGTH;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(2, 6, 23, 0.95)';
    ctx.lineWidth = HEADING_OUTLINE_WIDTH;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = HEADING_WIDTH;
    ctx.stroke();
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
    if (settings.showTeam) pushIfValue(first, player.team);
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
    if (settings.showTeam) pushIfValue(first, player.team);
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
    if (settings.showTeam) pushIfValue(first, player.team);
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

export function renderEntities(
    ctx,
    snapshot,
    settings,
    selectedPlayer,
    dimensions,
    t,
    { clear = true, localTeam = null } = {}
) {
    const { width, height } = dimensions;
    if (clear) ctx.clearRect(0, 0, width, height);
    if (!snapshot) return;
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
        drawHeading(ctx, point, player.yaw);

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

        const lines = mapInfoLines(playerForDisplay(player, localTeam, settings.anonymizeLocalTeam), settings);
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

