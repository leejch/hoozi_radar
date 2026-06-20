const DEFAULT_CONFIG_WIDTH = 300;
const DEFAULT_COLUMN_GAP = 5;
const DEFAULT_TABLE_MIN_WIDTH = 180;
const DEFAULT_TABLE_PREFERRED_WIDTH = 320;

function finiteNonNegative(value) {
    return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function allocateDesktopLayout({
    width,
    height,
    tableVisible,
    configWidth = DEFAULT_CONFIG_WIDTH,
    columnGap = DEFAULT_COLUMN_GAP,
    tableMinWidth = DEFAULT_TABLE_MIN_WIDTH,
    tablePreferredWidth = DEFAULT_TABLE_PREFERRED_WIDTH
}) {
    const contentWidth = finiteNonNegative(width);
    const contentHeight = finiteNonNegative(height);
    const fixedConfigWidth = finiteNonNegative(configWidth);
    const gap = finiteNonNegative(columnGap);
    const gapCount = tableVisible ? 2 : 1;
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

    const maximumTableWidth = Math.max(0, mapAndTableWidth - 1);
    const minimumTableWidth = Math.min(finiteNonNegative(tableMinWidth), maximumTableWidth);
    const preferredTableWidth = Math.max(
        minimumTableWidth,
        Math.min(finiteNonNegative(tablePreferredWidth), maximumTableWidth)
    );
    const tableCapacityAtFullMapHeight = mapAndTableWidth - contentHeight;
    const tableWidth = Math.floor(clamp(
        tableCapacityAtFullMapHeight,
        minimumTableWidth,
        preferredTableWidth
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
