import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ArrowDownUp, ArrowLeft, ArrowRight, Check, Grid2X2, List, Martini, Search, SlidersHorizontal, X } from 'lucide-react';
import { getCollection, getDrink, ingredients, type Collection, type Drink } from './api';

function DrinkImage({ drink, className = '' }: { drink: Drink; className?: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className={`image-placeholder ${className}`} role="img" aria-label={drink.strDrink}><Martini size={48}/></div> : <img className={className} src={drink.strDrinkThumb} alt={drink.strDrink} loading="lazy" onError={() => setFailed(true)}/>;
}
export default function App() {
  const [collection, setCollection] = useState<Collection>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  function load(refresh = false) {
    setLoading(true); setError('');
    getCollection(refresh).then(setCollection).catch(() => setError('We couldn’t load the collection. Check your connection and try again.')).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);
  return <><header className="header"><Link className="brand" to="/"><span className="brand-icon"><Martini size={24}/></span>Cocktail <i>Atlas</i><span className="brand-dot">.</span></Link><nav aria-label="Main navigation"><NavLink end to="/">The collection</NavLink><a href="https://www.thecocktaildb.com/" target="_blank" rel="noreferrer">Our source <span aria-hidden="true">↗</span></a></nav><span className="header-note">A FIELD GUIDE TO GOOD DRINKS</span></header>
    <main><Routes><Route path="/" element={<CollectionView drinks={collection?.drinks || []} loading={loading} error={error} retry={() => load(true)} offline={collection?.offline} partial={collection?.partial}/>}/><Route path="/cocktails/:id" element={<DetailView drinks={collection?.drinks || []} collectionLoading={loading}/>}/><Route path="*" element={<div className="empty"><h1>A wrong turn at the bar.</h1><Link to="/">Back to the collection</Link></div>}/></Routes></main>
    <footer><Link className="footer-brand" to="/">Cocktail Atlas.</Link><span>A little curiosity. A good drink.</span><span>Recipes & photography by <a href="https://www.thecocktaildb.com/" target="_blank" rel="noreferrer">TheCocktailDB ↗</a></span></footer></>;
}
function CollectionView({ drinks, loading, error, retry, offline, partial }: { drinks: Drink[]; loading: boolean; error: string; retry: () => void; offline?: boolean; partial?: boolean }) {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const view = params.get('view') === 'list' ? 'list' : 'gallery';
  const sort = params.get('sort') || 'name';
  const descending = params.get('order') === 'desc';
  const selected = params.getAll('category');
  const alcohol = params.get('alcohol') || '';
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const update = (key: string, value: string) => { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); setParams(next, { replace: true }); };
  const toggleCategory = (category: string) => { const next = new URLSearchParams(params); const values = selected.includes(category) ? selected.filter(c => c !== category) : [...selected, category]; next.delete('category'); values.forEach(c => next.append('category', c)); setParams(next, { replace: true }); };
  const categories = [...new Set(drinks.map(d => d.strCategory))].sort();
  const filtered = useMemo(() => drinks.filter(d => d.strDrink.toLowerCase().includes(query.trim().toLowerCase()) && (!selected.length || selected.includes(d.strCategory)) && (!alcohol || d.strAlcoholic === alcohol)).sort((a, b) => {
    const result = sort === 'ingredients' ? ingredients(a).length - ingredients(b).length : a.strDrink.localeCompare(b.strDrink);
    return (result || a.strDrink.localeCompare(b.strDrink)) * (descending ? -1 : 1);
  }), [drinks, query, selected.join('|'), alcohol, sort, descending]);
  useEffect(() => setVisibleCount(24), [params.toString()]);
  const location = useLocation();
  const state = { ids: filtered.map(d => d.idDrink), back: location.pathname + location.search };
  const activeCount = selected.length + Number(Boolean(alcohol));
  return <><section className="hero"><div className="hero-copy"><p className="eyebrow"><span/> THE ART OF A GOOD DRINK</p><h1>Find your next<br/><em>favorite pour.</em></h1><p className="hero-description">Old classics. New discoveries. Explore the recipes<br className="desktop-break"/> and stories behind a well-made cocktail.</p><a className="text-link" href="#collection">Explore the collection <ArrowRight size={17}/></a></div><div className="hero-art" aria-hidden="true"><div className="art-circle"/><svg viewBox="0 0 430 310"><ellipse cx="218" cy="281" rx="102" ry="12" fill="#ddd1b7"/><path d="M92 70H335L218 196Z" fill="#f9f4e8" stroke="#742f3b" strokeWidth="3"/><path d="M114 90H313L218 188Z" fill="#b65040"/><path d="M128 101H298L218 179Z" fill="#c76a4d"/><path d="M218 196V268M173 276L218 268L263 276Z" fill="none" stroke="#742f3b" strokeWidth="4" strokeLinecap="round"/><circle cx="309" cy="72" r="46" fill="#e5b557" stroke="#faf0d7" strokeWidth="6"/><circle cx="309" cy="72" r="35" fill="none" stroke="#f6deb2" strokeWidth="2"/><path d="M309 37V107M274 72H344M284 47L334 97M284 97L334 47" stroke="#f6deb2" strokeWidth="2"/><path d="M113 45L254 141" stroke="#506342" strokeWidth="5" strokeLinecap="round"/><ellipse cx="212" cy="113" rx="16" ry="11" transform="rotate(35 212 113)" fill="#68774b"/><circle cx="215" cy="113" r="4" fill="#ab5749"/><path d="M64 186L68 196L78 200L68 204L64 214L60 204L50 200L60 196Z" fill="#742f3b"/></svg><span className="art-note">A classic, with a twist.</span><span className="edition">THE RECIPE EDITION · VOL. 01</span></div></section>
    <section className="collection" id="collection"><div className="section-heading"><div><p className="eyebrow">YOUR NEXT DISCOVERY</p><h2>The collection<span>.</span></h2></div><p>A curated selection, from aperitif to nightcap.</p></div>
    <div className="toolbar"><label className="search"><Search size={19}/><input aria-label="Search cocktails" placeholder="Find a cocktail by name…" value={query} onChange={e => update('q', e.target.value)}/>{query && <button aria-label="Clear search" onClick={() => update('q', '')}><X size={16}/></button>}</label><button className={`filter-toggle ${activeCount || filtersOpen ? 'active' : ''}`} aria-expanded={filtersOpen} aria-controls="filters" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={17}/> Filters {activeCount > 0 && <span className="count">{activeCount}</span>}</button><div className="sort"><label htmlFor="sort">Sort by</label><select id="sort" value={sort} onChange={e => update('sort', e.target.value)}><option value="name">Name</option><option value="ingredients">Ingredient count</option></select><button title={descending ? 'Switch to ascending' : 'Switch to descending'} aria-label={descending ? 'Sort ascending' : 'Sort descending'} onClick={() => update('order', descending ? '' : 'desc')}><ArrowDownUp size={17}/><span>{descending ? '↓' : '↑'}</span></button></div><div className="view-toggle" aria-label="Display style"><button aria-label="Gallery view" aria-pressed={view === 'gallery'} className={view === 'gallery' ? 'selected' : ''} onClick={() => update('view', 'gallery')}><Grid2X2 size={18}/></button><button aria-label="List view" aria-pressed={view === 'list'} className={view === 'list' ? 'selected' : ''} onClick={() => update('view', 'list')}><List size={20}/></button></div></div>
    {filtersOpen && <div className="filters" id="filters"><fieldset><legend>Drink category <small>Choose one or more</small></legend><div className="chips">{categories.map(c => <button key={c} className={selected.includes(c) ? 'chip active' : 'chip'} aria-pressed={selected.includes(c)} onClick={() => toggleCategory(c)}>{selected.includes(c) && <Check size={13}/>} {c}</button>)}</div></fieldset><label className="alcohol-label">Alcohol content<select value={alcohol} onChange={e => update('alcohol', e.target.value)}><option value="">All drinks</option>{[...new Set(drinks.map(d => d.strAlcoholic))].sort().map(a => <option key={a}>{a}</option>)}</select></label></div>}
    <div className="results-line"><span aria-live="polite">{loading ? 'Preparing the collection…' : <><strong>{filtered.length}</strong> cocktails {query ? `matching “${query}”` : 'to discover'}</>}</span>{(activeCount > 0 || query) ? <button className="clear" onClick={() => { const next = new URLSearchParams(params); ['q', 'category', 'alcohol'].forEach(k => next.delete(k)); setParams(next); }}>Clear search & filters <X size={13}/></button> : <span className="results-note">FIND SOMETHING WORTH SAVORING</span>}</div>
    {(offline || partial) && <div className="notice" role="status">{offline ? 'The live API is unavailable. You’re browsing a saved sample collection.' : 'Some recipes could not be loaded. The available collection is shown.'}<button onClick={retry}>Retry live data</button></div>}
    {loading ? <div className="loading" role="status"><Martini size={32}/><p>Mixing up a little inspiration…</p></div> : error ? <div className="empty" role="alert"><h3>The bar is taking a moment.</h3><p>{error}</p><button className="primary" onClick={retry}>Try again</button></div> : !filtered.length ? <div className="empty"><Search size={32}/><h3>No cocktails found.</h3><p>Try a different name or loosen your filters.</p></div> : <><div className={view === 'gallery' ? 'drink-grid' : 'drink-list'}>{filtered.slice(0, visibleCount).map((drink, index) => <Link className="drink-card" key={drink.idDrink} to={`/cocktails/${drink.idDrink}`} state={state}><div className="card-photo"><DrinkImage drink={drink}/><span className="photo-label">{drink.strAlcoholic === 'Non alcoholic' ? 'ZERO PROOF' : drink.strCategory}</span><span className="card-arrow"><ArrowRight size={20}/></span></div><div className="card-body"><div className="card-topline"><span>{drink.strGlass}</span><span className="item-number">{String(index + 1).padStart(2, '0')}</span></div><h3>{drink.strDrink}</h3><p>{ingredients(drink).slice(0, 3).map(i => i.name).join(' · ')}</p><span className="ingredient-count">{ingredients(drink).length} ingredients</span></div></Link>)}</div>{visibleCount < filtered.length && <div className="load-more"><p>Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} cocktails</p><button className="outlined" onClick={() => setVisibleCount(n => n + 24)}>More to discover <ArrowRight size={17}/></button></div>}</>}
    <div className="collection-footnote">Browse recipes beginning with A, B, C, M, S & T. Search, sorting and filters apply to this collection.</div></section></>;
}
function DetailView({ drinks, collectionLoading }: { drinks: Drink[]; collectionLoading: boolean }) {
  const { id = '' } = useParams();
  const location = useLocation();
  const [remote, setRemote] = useState<Drink>();
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const drink = drinks.find(d => d.idDrink === id) || (remote?.idDrink === id ? remote : undefined);
  useEffect(() => { window.scrollTo(0, 0); }, [id]);
  useEffect(() => {
    if (drink || collectionLoading) return;
    let cancelled = false; setStatus('loading');
    getDrink(id).then(d => { if (!cancelled) { setRemote(d); setStatus(d ? 'ready' : 'missing'); } }).catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [id, drink, collectionLoading, attempt]);
  const state = location.state as { ids?: string[]; back?: string } | null;
  const ids = state?.ids?.length ? state.ids : drinks.map(d => d.idDrink);
  const position = ids.indexOf(id);
  const back = state?.back?.startsWith('/') ? state.back : '/';
  if (!drink) return <div className="empty"><h1>{collectionLoading || status === 'loading' ? 'Finding your cocktail…' : status === 'missing' ? 'This cocktail isn’t on the menu.' : 'We couldn’t load this recipe.'}</h1>{status === 'error' && <button className="primary" onClick={() => setAttempt(a => a + 1)}>Try again</button>}<Link to={back}>Back to the collection</Link></div>;
  return <article className="detail"><Link className="back-link" to={back}><ArrowLeft size={17}/> Back to the collection</Link><div className="detail-grid"><div className="detail-photo"><DrinkImage key={drink.idDrink} drink={drink}/><span className="detail-photo-caption">THE COCKTAIL ATLAS / RECIPE NO. {drink.idDrink}</span></div><div className="recipe"><p className="eyebrow">{drink.strCategory} · {drink.strAlcoholic}</p><h1>{drink.strDrink}<span>.</span></h1><p className="glass-note">Serve in a {drink.strGlass.toLowerCase()}.</p><section className="ingredients"><h2><span>01</span> What goes in</h2><ul>{ingredients(drink).map((item, i) => <li key={i}><span>{item.name}</span><strong>{item.amount || 'Not specified'}</strong></li>)}</ul></section><section className="instructions"><h2><span>02</span> Make it yours</h2><p>{drink.strInstructions || 'No preparation instructions are available for this recipe.'}</p></section></div></div><div className="detail-navigation">{position > 0 ? <Link to={`/cocktails/${ids[position - 1]}`} state={state}><ArrowLeft size={18}/> Previous cocktail</Link> : <button disabled><ArrowLeft size={18}/> Previous cocktail</button>}<span>{position >= 0 ? `${position + 1} / ${ids.length}` : 'EXPLORE THE COLLECTION'}</span>{position >= 0 && position < ids.length - 1 ? <Link to={`/cocktails/${ids[position + 1]}`} state={state}>Next cocktail <ArrowRight size={18}/></Link> : <button disabled>Next cocktail <ArrowRight size={18}/></button>}</div></article>;
}
