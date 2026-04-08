export type Action = "Raise" | "Call" | "Fold";

export interface HandFrequency {
  raise: number;
  call: number;
  fold: number;
}

const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"] as const;
type Rank = (typeof RANKS)[number];

function rankIndex(r: string): number {
  return RANKS.indexOf(r as Rank);
}

function canonicalHand(r1: string, r2: string, suited: boolean): string {
  const i1 = rankIndex(r1);
  const i2 = rankIndex(r2);
  if (r1 === r2) return r1 + r2;
  const [hi, lo] = i1 < i2 ? [r1, r2] : [r2, r1];
  return hi + lo + (suited ? "s" : "o");
}

function expandHand(token: string): string[] {
  const hands: string[] = [];

  if (/^[AKQJT98765432]{2}$/.test(token) && token[0] === token[1]) {
    hands.push(token);
    return hands;
  }

  if (/^[AKQJT98765432]{2}[so]$/.test(token)) {
    hands.push(token);
    return hands;
  }

  if (/^[AKQJT98765432]{2}$/.test(token)) {
    const r1 = token[0];
    const r2 = token[1];
    if (r1 === r2) {
      hands.push(token);
    } else {
      hands.push(token + "s", token + "o");
    }
    return hands;
  }

  if (/^[AKQJT98765432]$/.test(token)) {
    const r = token[0];
    RANKS.forEach((r2) => {
      if (r2 !== r) {
        const i1 = rankIndex(r);
        const i2 = rankIndex(r2);
        const [hi, lo] = i1 < i2 ? [r, r2] : [r2, r];
        hands.push(hi + lo + "s", hi + lo + "o");
      }
    });
    return hands;
  }

  return [token];
}

function parseHandToken(raw: string): { hands: string[]; freq: number } {
  const colonIdx = raw.lastIndexOf(":");
  let handStr = raw;
  let freq = 1.0;

  if (colonIdx !== -1) {
    const possibleFreq = raw.slice(colonIdx + 1);
    const parsed = parseFloat(possibleFreq);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
      freq = parsed;
      handStr = raw.slice(0, colonIdx);
    }
  }

  return { hands: expandHand(handStr), freq };
}

function parseSection(text: string): Map<string, number> {
  const result = new Map<string, number>();
  const tokens = text.split(",").map((t) => t.trim()).filter(Boolean);
  for (const token of tokens) {
    const { hands, freq } = parseHandToken(token);
    for (const hand of hands) {
      result.set(hand, freq);
    }
  }
  return result;
}

export function parseRangeText(input: string): Map<string, HandFrequency> {
  const result = new Map<string, HandFrequency>();

  const sections: { action: Action; content: string }[] = [];
  const lines = input.split("\n");

  let currentAction: Action | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "Raise" || trimmed === "Call" || trimmed === "Fold") {
      if (currentAction && currentLines.length > 0) {
        sections.push({ action: currentAction, content: currentLines.join(",") });
      }
      currentAction = trimmed as Action;
      currentLines = [];
    } else if (trimmed.length > 0 && currentAction) {
      currentLines.push(trimmed);
    }
  }
  if (currentAction && currentLines.length > 0) {
    sections.push({ action: currentAction, content: currentLines.join(",") });
  }

  for (const { action, content } of sections) {
    const handMap = parseSection(content);
    handMap.forEach((freq, hand) => {
      const existing = result.get(hand) ?? { raise: 0, call: 0, fold: 0 };
      if (action === "Raise") existing.raise = freq;
      else if (action === "Call") existing.call = freq;
      else if (action === "Fold") existing.fold = freq;
      result.set(hand, existing);
    });
  }

  return result;
}

export function getHandKey(row: number, col: number): string {
  const r1 = RANKS[row];
  const r2 = RANKS[col];
  if (row === col) return r1 + r2;
  if (row < col) return r1 + r2 + "s";
  return r2 + r1 + "o";
}

export function getHandLabel(row: number, col: number): string {
  return getHandKey(row, col);
}

export { RANKS };
