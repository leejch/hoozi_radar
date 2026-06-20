const DEFAULT_CONFIG_WIDTH = 300;
const DEFAULT_COLUMN_GAP = 5;
const DEFAULT_TABLE_MIN_WIDTH = 180;
const DEFAULT_TABLE_MAX_RATIO = 0.25;

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
    tableContentWidth = DEFAULT_TABLE_MIN_WIDTH,
    configWidth = DEFAULT_CONFIG_WIDTH,
    columnGap = DEFAULT_COLUMN_GAP,
    tableMinWidth = DEFAULT_TABLE_MIN_WIDTH,
    tableMaxRatio = DEFAULT_TABLE_MAX_RATIO
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
