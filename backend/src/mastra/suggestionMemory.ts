type SuggestedItem = {
  id: number;
  name: string;
  price?: number;
};

const suggestionMemory = new Map<string, SuggestedItem[]>();

export function setSuggestions(userId: string, items: SuggestedItem[]) {
  suggestionMemory.set(userId, items);
}

export function getSuggestions(userId: string): SuggestedItem[] {
  return suggestionMemory.get(userId) ?? [];
}

export function clearSuggestions(userId: string) {
  suggestionMemory.delete(userId);
}
