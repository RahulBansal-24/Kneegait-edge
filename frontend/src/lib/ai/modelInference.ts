// Client-Side Zero-Dependency Random Forest Inference Engine for KneeGait-Edge
// Exactly replicates backend/random_forest_model.joblib trained on 5 canonical features.

import rawModelData from './model.json';

export interface DecisionNode {
  is_leaf: false;
  feature: number;
  threshold: number;
  left: number;
  right: number;
}

export interface LeafNode {
  is_leaf: true;
  class: number;
  probabilities: [number, number, number];
}

export type TreeNode = DecisionNode | LeafNode;

export interface ModelData {
  model_type: string;
  n_estimators: number;
  max_depth: number;
  features: string[];
  classes: string[];
  trees: TreeNode[][];
}

export const MODEL: ModelData = rawModelData as unknown as ModelData;

export const CANONICAL_FEATURES = [
  'peak_swing_flexion',
  'sagittal_rom',
  'stance_to_swing_ratio',
  'peak_angular_velocity',
  'cadence_spm',
] as const;

export type CanonicalFeatureName = (typeof CANONICAL_FEATURES)[number];

export const CLASS_NAMES = [
  'NORMAL_GAIT',
  'MILD_FUNCTIONAL_RESTRICTION',
  'SEVERE_ANTALGIC_STIFF_GAIT',
] as const;

export type ClassName = (typeof CLASS_NAMES)[number];

export const CLASS_DISPLAY_LABELS: Record<number, string> = {
  0: 'Normal / Healthy',
  1: 'Mild Functional Restriction',
  2: 'Severe Antalgic / Stiff Gait',
};

export const CLASS_DESCRIPTIONS: Record<number, string> = {
  0: 'Normal knee kinematic pattern with physiological swing flexion (≥49.4°), balanced stance-to-swing phase, and healthy angular velocity.',
  1: 'Mild functional restriction observed. Swing flexion range is moderately attenuated (45.0°–49.4°), indicating compensatory stiffness or early-stage loading guard.',
  2: 'Severe antalgic / stiff-gait pattern detected. Significantly constrained sagittal knee flexion (<45.0°) with prolonged stance duration, typical of advanced knee osteoarthritis guarding.',
};

export interface InferenceResult {
  classId: number;
  className: ClassName;
  displayLabel: string;
  description: string;
  probabilities: [number, number, number];
  confidence: number;
  features: [number, number, number, number, number];
  treeVotes: [number, number, number];
}

/**
 * Traverses a single decision tree to compute leaf node class and probabilities.
 */
export function evaluateTree(
  tree: TreeNode[],
  features: [number, number, number, number, number]
): { classId: number; probabilities: [number, number, number] } {
  let nodeId = 0;
  while (true) {
    const node = tree[nodeId];
    if (!node) {
      throw new Error(`Corrupted tree node index: ${nodeId}`);
    }
    if (node.is_leaf) {
      return {
        classId: node.class,
        probabilities: [
          node.probabilities[0],
          node.probabilities[1],
          node.probabilities[2],
        ],
      };
    }
    const val = features[node.feature];
    if (val <= node.threshold) {
      nodeId = node.left;
    } else {
      nodeId = node.right;
    }
  }
}

/**
 * Executes full ensemble random forest inference across all 20 decision trees.
 * Produces identical class predictions and probability distributions to Scikit-Learn.
 */
export function runInference(
  features: [number, number, number, number, number]
): InferenceResult {
  // Validate finite numeric features
  for (let i = 0; i < 5; i++) {
    if (isNaN(features[i]) || !isFinite(features[i])) {
      throw new Error(
        `Invalid feature at index ${i} (${CANONICAL_FEATURES[i]}): value is ${features[i]}`
      );
    }
  }

  const nTrees = MODEL.trees.length;
  const votes: [number, number, number] = [0, 0, 0];
  const probSum: [number, number, number] = [0, 0, 0];

  for (let i = 0; i < nTrees; i++) {
    const { classId, probabilities } = evaluateTree(MODEL.trees[i], features);
    votes[classId] += 1;
    probSum[0] += probabilities[0];
    probSum[1] += probabilities[1];
    probSum[2] += probabilities[2];
  }

  const probabilities: [number, number, number] = [
    probSum[0] / nTrees,
    probSum[1] / nTrees,
    probSum[2] / nTrees,
  ];

  // Best class is argmax of average probabilities (Scikit-learn standard)
  let bestClass = 0;
  let maxProb = probabilities[0];
  for (let c = 1; c < 3; c++) {
    if (probabilities[c] > maxProb) {
      maxProb = probabilities[c];
      bestClass = c;
    }
  }

  const confidence = Math.round(probabilities[bestClass] * 100);

  return {
    classId: bestClass,
    className: CLASS_NAMES[bestClass],
    displayLabel: CLASS_DISPLAY_LABELS[bestClass],
    description: CLASS_DESCRIPTIONS[bestClass],
    probabilities,
    confidence,
    features: [...features] as [number, number, number, number, number],
    treeVotes: votes,
  };
}
