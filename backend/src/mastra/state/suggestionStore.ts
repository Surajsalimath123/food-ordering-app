type SuggestedItem = {
  id: number;
  name: string;
  price?: number | null;
};

const suggestionStore = new Map<string, SuggestedItem[]>();

export function setLastSuggestions(userId: string, items: SuggestedItem[]) {
  suggestionStore.set(userId, items);
}

export function getLastSuggestions(userId: string): SuggestedItem[] | null {
  return suggestionStore.get(userId) ?? null;
}

export function clearLastSuggestions(userId: string) {
  suggestionStore.delete(userId);
}
