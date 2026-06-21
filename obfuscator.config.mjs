function commaSeparatedEnvironment(name) {
    return String(process.env[name] || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
}

const configuredSeed = String(process.env.HOOZI_OBFUSCATION_SEED || '').trim();
const seed = configuredSeed && Number.isFinite(Number(configuredSeed))
    ? Number(configuredSeed)
    : configuredSeed || 0;

// Balanced production profile: materially raises reverse-engineering cost
// without property renaming, debugger traps, or global console modification.
export default Object.freeze({
    target: 'browser-no-eval',
    compact: true,
    optionsPreset: 'default',

    identifierNamesGenerator: 'hexadecimal',
    identifiersPrefix: '_h3_',
    renameGlobals: false,
    renameProperties: false,
    transformObjectKeys: false,

    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.25,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.06,
    numbersToExpressions: true,
    simplify: true,

    stringArray: true,
    stringArrayThreshold: 0.72,
    stringArrayEncoding: ['rc4'],
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayIndexShift: true,
    stringArrayIndexesType: ['hexadecimal-number'],
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.55,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 3,
    stringArrayWrappersType: 'function',
    splitStrings: true,
    splitStringsChunkLength: 8,

    selfDefending: true,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: false,
    unicodeEscapeSequence: false,
    sourceMap: false,

    domainLock: commaSeparatedEnvironment('HOOZI_DOMAIN_LOCK'),
    domainLockRedirectUrl: 'about:blank',
    seed
});
