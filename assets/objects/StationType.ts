export enum StationType {
    Circle,
    Square,
    Triangle
}

export function getRandomStationType(stationTypeCounts: Map<StationType, number>): StationType {
    const enumValues = Object.values(StationType).filter(value => typeof value === 'number') as StationType[];
    let totalWeight = 0;
    let weightedStationTypes: { type: StationType; weight: number }[] = [];

    // Calculate weights for each station type
    enumValues.forEach((type) => {
        const count = stationTypeCounts.get(type) || 0;
        const weight = 1 / (count + 1); // Adding 1 to avoid division by zero
        weightedStationTypes.push({ type, weight });
        totalWeight += weight;
    });

    // Choose a random value based on the total weight
    let randomWeight = Math.random() * totalWeight;

    // Determine which station type corresponds to the random weight
    for (const item of weightedStationTypes) {
        randomWeight -= item.weight;
        if (randomWeight <= 0) {
            return item.type;
        }
    }

    // Fallback to a random type (should not normally be reached)
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    return enumValues[randomIndex];
}

