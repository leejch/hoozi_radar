import {
    LAYOUT_ORIENTATION_LANDSCAPE,
    LAYOUT_ORIENTATION_PORTRAIT,
    normalizeLayoutOrientation
} from '../config.js';

const DEFAULT_CONFIG_WIDTH = 300;
const DEFAULT_COLUMN_GAP = 5;
const DEFAULT_TABLE_MIN_WIDTH = 180;
const DEFAULT_TABLE_MAX_RATIO = 0.25;
export const AUTO_LANDSCAPE_ASPECT_RATIO = 1.12;
export const AUTO_PORTRAIT_ASPECT_RATIO = 1 / AUTO_LANDSCAPE_ASPECT_RATIO;

function finiteNonNegative(value) {
    return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function resolveResponsiveLayoutOrientation(
    { width, height },
    preferredOrientation = LAYOUT_ORIENTATION_LANDSCAPE
) {
    const contentWidth = finiteNonNegative(width);
    const contentHeight = finiteNonNegative(height);
    if (!contentWidth || !contentHeight) return normalizeLayoutOrientation(preferredOrientation);

    const aspectRatio = contentWidth / contentHeight;
    if (aspectRatio >= AUTO_LANDSCAPE_ASPECT_RATIO) return LAYOUT_ORIENTATION_LANDSCAPE;
    if (aspectRatio <= AUTO_PORTRAIT_ASPECT_RATIO) return LAYOUT_ORIENTATION_PORTRAIT;
    return normalizeLayoutOrientation(preferredOrientation);
}

export function allocateDesktopLayout({
    width,
    height,
    configVisible = true,
    tableVisible,
    tableContentWidth = DEFAULT_TABLE_MIN_WIDTH,
    configWidth = DEFAULT_CONFIG_WIDTH,
    columnGap = DEFAULT_COLUMN_GAP,
    tableMinWidth = DEFAULT_TABLE_MIN_WIDTH,
    tableMaxRatio = DEFAULT_TABLE_MAX_RATIO
}) {
    const contentWidth = finiteNonNegative(width);
    const contentHeight = finiteNonNegative(height);
    const fixedConfigWidth = configVisible ? finiteNonNegative(configWidth) : 0;
    const gap = finiteNonNegative(columnGap);
    const gapCount = Number(Boolean(configVisible)) + Number(Boolean(tableVisible));
    const mapAndTableWidth = Math.max(1, contentWidth - fixedConfigWidth - gap * gapCount);

    if (!tableVisible) {
        const mapHeight = Math.floor(Math.min(contentHeight, mapAndTableWidth));
        return {
            configWidth: fixedConfigWidth,
            mapWidth: mapAndTableWidth,
            mapHeight,
            tableWidth: 0
        };
    }

    const ratio = clamp(finiteNonNegative(tableMaxRatio), 0, 1);
    const maximumTableWidth = Math.max(0, Math.min(
        mapAndTableWidth - 1,
        contentWidth * ratio
    ));
    const minimumTableWidth = Math.min(finiteNonNegative(tableMinWidth), maximumTableWidth);
    const requestedTableWidth = Math.max(minimumTableWidth, finiteNonNegative(tableContentWidth));
    const tableCapacityAtFullMapHeight = mapAndTableWidth - contentHeight;
    const maximumTableWidthAtFullMapHeight = Math.max(
        minimumTableWidth,
        Math.min(maximumTableWidth, tableCapacityAtFullMapHeight)
    );
    const tableWidth = Math.floor(clamp(
        requestedTableWidth,
        minimumTableWidth,
        maximumTableWidthAtFullMapHeight
    ));
    const mapWidth = mapAndTableWidth - tableWidth;
    const mapHeight = Math.floor(Math.min(contentHeight, mapWidth));

    return {
        configWidth: fixedConfigWidth,
        mapWidth,
        mapHeight,
        tableWidth
    };
}
