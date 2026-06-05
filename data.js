const subjects = [
    GED0031,
    GED0081,
    IT0202,
    IT0203,
    CCS0043
];

const otherLinks = typeof extraLinks !== "undefined" ? extraLinks : [];

const UI_STYLES = [
    { id: "neoskeuo", name: "Neo Skeuo" },
    { id: "modern", name: "Modern" },
    { id: "glass", name: "Neon Glass" },
    { id: "retroos", name: "Retro OS" }
];

const UI_PALETTES = [
    { id: "gray", name: "Gray" },
    { id: "copper", name: "Copper" },
    { id: "sage", name: "Sage" },
    { id: "blue", name: "Blue" },
    { id: "mono", name: "Mono" },

    { id: "peachglass", name: "Peach Glass" },
    { id: "sunsetglass", name: "Sunset Glass" },
    { id: "lavenderglass", name: "Lavender Glass" },
    { id: "cottonglass", name: "Cotton Glass" }
];

const OTHER_SORTS = [
    { id: "az", name: "A-Z" },
    { id: "za", name: "Z-A" },
    { id: "newest", name: "Newest" },
    { id: "oldest", name: "Oldest" },
    { id: "type", name: "Type" }
];