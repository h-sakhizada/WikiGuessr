interface FuzzyMatchResult {
  isMatch: boolean;
  similarity: number;
}

interface FuzzyMatchOptions {
  threshold?: number;
  caseSensitive?: boolean;
}

export class FuzzyMatcher {
  private defaultOptions: FuzzyMatchOptions = {
    threshold: 0.85,
    caseSensitive: false,
  };

  /**
   * Compare two strings using fuzzy matching techniques
   * @param guess The user's guessed string
   * @param correctAnswer The actual correct answer
   * @param options Optional configuration for the matching algorithm
   * @returns Object containing match boolean and similarity score
   */
  public match(
    guess: string,
    correctAnswer: string,
    options: FuzzyMatchOptions = {}
  ): FuzzyMatchResult {
    const finalOptions = { ...this.defaultOptions, ...options };

    // Normalize strings if case-insensitive
    const normalizedGuess = finalOptions.caseSensitive
      ? guess.trim()
      : guess.toLowerCase().trim();
    const normalizedAnswer = finalOptions.caseSensitive
      ? correctAnswer.trim()
      : correctAnswer.toLowerCase().trim();

    const similarity = this.calculateSimilarity(
      normalizedGuess,
      normalizedAnswer
    );

    return {
      isMatch: similarity >= (finalOptions.threshold ?? 0.85),
      similarity,
    };
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(s1: string, s2: string): number {
    if (s1.length < s2.length) {
      return this.levenshteinDistance(s2, s1);
    }

    if (s2.length === 0) {
      return s1.length;
    }

    let previousRow: number[] = Array.from(
      { length: s2.length + 1 },
      (_, i) => i
    );
    let currentRow: number[] = [0];

    for (let i = 0; i < s1.length; i++) {
      currentRow = [i + 1];

      for (let j = 0; j < s2.length; j++) {
        const insertions = previousRow[j + 1] + 1;
        const deletions = currentRow[j] + 1;
        const substitutions = previousRow[j] + (s1[i] !== s2[j] ? 1 : 0);

        currentRow.push(Math.min(insertions, deletions, substitutions));
      }

      previousRow = [...currentRow];
    }

    return currentRow[currentRow.length - 1];
  }

  /**
   * Calculate similarity score between 0 and 1
   */
  private calculateSimilarity(s1: string, s2: string): number {
    if (s1 === s2) return 1.0;
    if (s1.length === 0 || s2.length === 0) return 0.0;

    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    return 1 - distance / maxLength;
  }
}