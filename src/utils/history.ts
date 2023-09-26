import {
  METRC_TAG_REGEX_PATTERN,
  PLANT_BATCH_NAME_REGEX_PATTERN,
  ZERO_PADDED_MANIFEST_NUMBER_REGEX_PATTERN,
} from "@/consts";
import { IHarvestHistoryData, IPackageHistoryData } from "@/interfaces";
import _ from "lodash-es";

// Single history entry methods

export function extractInitialPackageQuantityAndUnitOrNull(
  description: string
): [number, string] | null {
  const matcher = new RegExp(`^Packaged ([0-9,\.]+) ([a-zA-Z\s]+) of`);
  const match = description.match(matcher);

  return match ? [parseFloat(match[1].replaceAll(",", "")), match[2]] : null;
}

export function extractParentPackageLabelOrNull(description: string): string | null {
  const parentMatcher = new RegExp(`from Package (${METRC_TAG_REGEX_PATTERN})`);
  const match = description.match(parentMatcher);

  return match ? match[1] : null;
}

export function extractChildPackageLabelOrNull(description: string): string | null {
  const childMatcher = new RegExp(`for Package (${METRC_TAG_REGEX_PATTERN})`);
  const match = description.match(childMatcher);

  return match ? match[1] : null;
}

export function extractTestSamplePackageLabelOrNull(description: string): string | null {
  const testSampleMatcher = new RegExp(
    `Related Package's \\((${METRC_TAG_REGEX_PATTERN})\\) Lab Testing set to`
  );
  const match = description.match(testSampleMatcher);

  return match ? match[1] : null;
}

export function extractPlantBatchNameOrNull(description: string): string | null {
  const matchers = [
    // Order is important here: first match will be retunred
    new RegExp(`Plant Batch: (${PLANT_BATCH_NAME_REGEX_PATTERN}) > ${METRC_TAG_REGEX_PATTERN}`),
    new RegExp(`Plant Batch: "(${PLANT_BATCH_NAME_REGEX_PATTERN})" > ${METRC_TAG_REGEX_PATTERN}`),
    new RegExp(`Plant Batch: (${PLANT_BATCH_NAME_REGEX_PATTERN})`),
    new RegExp(`Plant Batch \\((${PLANT_BATCH_NAME_REGEX_PATTERN})\\)`),
    new RegExp(`Plant Batch: "(${PLANT_BATCH_NAME_REGEX_PATTERN})"`),
    new RegExp(`Plant Batch "(${PLANT_BATCH_NAME_REGEX_PATTERN})"`),
  ];
  for (const matcher of matchers) {
    const match = description.match(matcher);

    if (match) {
      return match[1];
    }
  }

  return null;
}

export function extractPlantLabelOrNull(description: string): string | null {
  const matchers = [
    new RegExp(`Plant "(${METRC_TAG_REGEX_PATTERN})"`),
    new RegExp(`Plant: ${PLANT_BATCH_NAME_REGEX_PATTERN} > (${METRC_TAG_REGEX_PATTERN})`),
    new RegExp(`Plant: "${PLANT_BATCH_NAME_REGEX_PATTERN}" > (${METRC_TAG_REGEX_PATTERN})`),
    new RegExp(`from Plant (${METRC_TAG_REGEX_PATTERN})`),
    new RegExp(`Plant (${METRC_TAG_REGEX_PATTERN})`),
  ];
  for (const matcher of matchers) {
    const match = description.match(matcher);

    if (match) {
      return match[1];
    }
  }

  return null;
}

export function extractPackageLabelOrNull(description: string): string | null {
  const matchers = [
    new RegExp(`Plant Batch Package "(${METRC_TAG_REGEX_PATTERN})"`),
    new RegExp(`Plant Batch: ${PLANT_BATCH_NAME_REGEX_PATTERN} > (${METRC_TAG_REGEX_PATTERN})`),
    new RegExp(`Plant Batch: "${PLANT_BATCH_NAME_REGEX_PATTERN}" > (${METRC_TAG_REGEX_PATTERN})`),
    new RegExp(`Related Package's \\((${METRC_TAG_REGEX_PATTERN})\\) Lab Testing set to`),
    new RegExp(`for Package (${METRC_TAG_REGEX_PATTERN})`),
    new RegExp(`from Package (${METRC_TAG_REGEX_PATTERN})`),
    new RegExp(`Packaged into (${METRC_TAG_REGEX_PATTERN})`),
    new RegExp(`Package (${METRC_TAG_REGEX_PATTERN})`),
  ];
  for (const matcher of matchers) {
    const match = description.match(matcher);

    if (match) {
      return match[1];
    }
  }

  return null;
}

export function extractOutgoingTransferManifestNumberOrNull(description: string): string | null {
  const matchers: RegExp[] = [
    new RegExp(`Manifest # (${ZERO_PADDED_MANIFEST_NUMBER_REGEX_PATTERN})`),
  ];
  for (const matcher of matchers) {
    const match = description.match(matcher);

    if (match) {
      return match[1];
    }
  }

  return null;
}

export function extractHarvestNameOrNull(description: string): string | null {
  const matchers: RegExp[] = [new RegExp(`Harvest "([^"]+)"`)];
  for (const matcher of matchers) {
    const match = description.match(matcher);

    if (match) {
      return match[1];
    }
  }

  return null;
}

export function extractHarvestPackageLabelOrNull(description: string): string | null {
  const matchers: RegExp[] = [new RegExp(`Package \\(?(${METRC_TAG_REGEX_PATTERN})\\)?`)];

  for (const matcher of matchers) {
    const match = description.match(matcher);

    if (match) {
      return match[1];
    }
  }

  return null;
}

export function extractChildPackageTagQuantityPairOrNull(
  description: string
): [string, number] | null {
  const pairMatcher = new RegExp(`Used ([\\d,\\.]+) .* for Package (${METRC_TAG_REGEX_PATTERN})`);

  const match = description.match(pairMatcher);

  return match ? [match[2] as string, parseFloat(match[1].replaceAll(",", ""))] : null;
}

export function extractChildPackageTagQuantityUnitSetOrNull(
  description: string
): [string, number, string] | null {
  const pairMatcher = new RegExp(
    `Used ([0-9,\.]+) ([a-zA-Z\s]+) for Package (${METRC_TAG_REGEX_PATTERN})`
  );

  const match = description.match(pairMatcher);

  return match ? [match[3], parseFloat(match[1].replaceAll(",", "")), match[2]] : null;
}

export function extractParentPackageTagQuantityUnitItemSetOrNull(
  description: string
): [string, number, string, string] | null {
  const pairMatcher = new RegExp(
    `Took ([0-9,\.]+) ([a-zA-Z\s]+) of (.*) from Package (${METRC_TAG_REGEX_PATTERN})`
  );

  const match = description.match(pairMatcher);

  return match ? [match[4], parseFloat(match[1].replaceAll(",", "")), match[2], match[3]] : null;
}

export function extractLocationNameOrNull(description: string): string | null {
  const matcher = new RegExp(`- Location: (.*)`);

  const match = description.match(matcher);

  return match ? match[1] : null;
}

// Full history methods

export function extractInitialPackageQuantityAndUnitFromHistoryOrError(
  historyList: IPackageHistoryData[]
): [number, string] {
  for (const history of historyList) {
    for (const description of history.Descriptions) {
      const match = extractInitialPackageQuantityAndUnitOrNull(description);

      if (match) {
        return match;
      }
    }
  }

  throw new Error("Could not locate initial quantity");
}

export function extractParentPackageLabelsFromHistory(
  historyList: IPackageHistoryData[]
): string[] {
  const parentPackageLabels = [];

  for (const history of historyList) {
    for (const description of history.Descriptions) {
      const parentPackageLabel = extractParentPackageLabelOrNull(description);

      if (parentPackageLabel) {
        parentPackageLabels.push(parentPackageLabel);
      }
    }
  }

  return _.uniq(parentPackageLabels);
}

export function extractChildPackageLabelsFromHistory(historyList: IPackageHistoryData[]): string[] {
  const childPackageLabels = [];

  for (const history of historyList) {
    for (const description of history.Descriptions) {
      const childPackageLabel = extractChildPackageLabelOrNull(description);

      if (childPackageLabel) {
        childPackageLabels.push(childPackageLabel);
      }
    }
  }

  return _.uniq(childPackageLabels);
}

export function extractTestSamplePackageLabelsFromHistory(
  historyList: IPackageHistoryData[]
): string[] {
  const testSamplePackageLabels = [];

  for (const history of historyList) {
    for (const description of history.Descriptions) {
      const testSamplePackageLabel = extractTestSamplePackageLabelOrNull(description);

      if (testSamplePackageLabel) {
        testSamplePackageLabels.push(testSamplePackageLabel);
      }
    }
  }

  return _.uniq(testSamplePackageLabels);
}

// This is used by COGS, technically should be replaced with extractChildPackageTagQuantityUnitSetsFromHistory
export function extractChildPackageTagQuantityPairsFromHistory(
  historyList: IPackageHistoryData[]
): [string, number][] {
  const pairs: [string, number][] = [];

  for (const history of historyList) {
    for (const description of history.Descriptions) {
      const result = extractChildPackageTagQuantityPairOrNull(description);

      if (result) {
        pairs.push(result);
      }
    }
  }

  return pairs;
}

export function extractChildPackageTagQuantityUnitSetsFromHistory(
  historyList: IPackageHistoryData[]
): [string, number, string][] {
  const sets: [string, number, string][] = [];

  for (const history of historyList) {
    for (const description of history.Descriptions) {
      const result = extractChildPackageTagQuantityUnitSetOrNull(description);

      if (result) {
        sets.push(result);
      }
    }
  }

  return sets;
}

export function extractParentPackageTagQuantityUnitItemSetsFromHistory(
  historyList: IPackageHistoryData[]
): [string, number, string, string][] {
  const sets: [string, number, string, string][] = [];

  for (const history of historyList) {
    for (const description of history.Descriptions) {
      const result = extractParentPackageTagQuantityUnitItemSetOrNull(description);

      if (result) {
        sets.push(result);
      }
    }
  }

  return sets;
}

export function extractInitialPackageLocationNameFromHistoryOrNull(
  historyList: IPackageHistoryData[]
): string | null {
  for (const description of historyList[0].Descriptions) {
    const result = extractLocationNameOrNull(description);

    if (result) {
      return result;
    }
  }

  return null;
}

export function extractHarvestChildPackageLabelsFromHistory(
  historyList: IHarvestHistoryData[]
): string[] {
  const labels: string[] = [];

  for (const history of historyList) {
    for (const description of history.Descriptions) {
      const label = extractHarvestPackageLabelOrNull(description);

      if (label) {
        labels.push(label);
      }
    }
  }

  return labels;
}
