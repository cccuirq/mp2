import axios from 'axios';

export interface Drink {
  idDrink: string; strDrink: string; strDrinkThumb: string; strCategory: string;
  strAlcoholic: string; strGlass: string; strInstructions: string;
  [key: string]: string | null;
}
export function ingredients(drink: Drink) {
  return Array.from({ length: 15 }, (_, i) => ({ name: drink[`strIngredient${i + 1}`]?.trim(), amount: drink[`strMeasure${i + 1}`]?.trim() }))
    .filter((item): item is { name: string; amount: string | undefined } => Boolean(item.name));
}
const api = axios.create({ baseURL: 'https://www.thecocktaildb.com/api/json/v1/1/', timeout: 12000 });
function validDrinks(data: { drinks?: unknown }): Drink[] {
  return Array.isArray(data.drinks) ? data.drinks.filter(d => d && typeof d.idDrink === 'string' && typeof d.strDrink === 'string') : [];
}
export interface Collection { drinks: Drink[]; offline: boolean; partial: boolean }
let pending: Promise<Collection> | undefined;
const cacheKey = 'cocktail-atlas-v1';
export function getCollection(refresh = false): Promise<Collection> {
  if (refresh) pending = undefined;
  if (pending) return pending;
  pending = (async () => {
    if (!refresh) {
      try {
        const cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
        if (cached && Date.now() - cached.time < 3600000 && validDrinks(cached).length) return { drinks: validDrinks(cached), offline: false, partial: cached.partial };
      } catch { /* Storage is optional. */ }
    }
    // A finite collection keeps requests modest; search and filters operate locally.
    const results = await Promise.allSettled(['a', 'b', 'c', 'm', 's', 't'].map(f => api.get('search.php', { params: { f } })));
    const drinks = [...new Map(results.flatMap(r => r.status === 'fulfilled' ? validDrinks(r.value.data) : []).map(d => [d.idDrink, d])).values()];
    if (drinks.length) {
      const partial = results.some(r => r.status === 'rejected' || !validDrinks(r.value.data).length);
      try { sessionStorage.setItem(cacheKey, JSON.stringify({ time: Date.now(), drinks, partial })); } catch { /* Quota errors do not block browsing. */ }
      return { drinks, offline: false, partial };
    }
    const fallback = validDrinks((await axios.get(`${import.meta.env.BASE_URL}cocktails-fallback.json`)).data);
    if (!fallback.length) throw new Error('The collection is unavailable. Please try again.');
    return { drinks: fallback, offline: true, partial: false };
  })().catch(error => { pending = undefined; throw error; });
  return pending;
}
export async function getDrink(id: string): Promise<Drink | undefined> {
  return validDrinks((await api.get('lookup.php', { params: { i: id } })).data)[0];
}
