// Favorites management for localStorage

export interface FavoriteItem {
  id: number;
  name: string;
  price: number;
  image: string;
  addedAt: string;
}

export const getFavorites = (): FavoriteItem[] => {
  if (typeof window === 'undefined') return [];
  const favorites = localStorage.getItem('favorites');
  return favorites ? JSON.parse(favorites) : [];
};

export const addToFavorites = (product: Omit<FavoriteItem, 'addedAt'>): void => {
  const favorites = getFavorites();
  const exists = favorites.some(item => item.id === product.id);
  
  if (!exists) {
    const newFavorite: FavoriteItem = {
      ...product,
      addedAt: new Date().toISOString()
    };
    favorites.push(newFavorite);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('favoritesChanged'));
  }
};

export const removeFromFavorites = (productId: number): void => {
  const favorites = getFavorites();
  const filtered = favorites.filter(item => item.id !== productId);
  localStorage.setItem('favorites', JSON.stringify(filtered));
  
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('favoritesChanged'));
};

export const isFavorite = (productId: number): boolean => {
  const favorites = getFavorites();
  return favorites.some(item => item.id === productId);
};

export const clearFavorites = (): void => {
  localStorage.removeItem('favorites');
  window.dispatchEvent(new CustomEvent('favoritesChanged'));
};
