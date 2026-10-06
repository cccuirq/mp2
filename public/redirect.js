const base = '/mp2';
const route = location.pathname.slice(base.length) + location.search + location.hash;
location.replace(base + '/?route=' + encodeURIComponent(route));
