const dev = false;
let path = '/recipes/';
if (dev) {
  path = '';
}
import { Recipe } from '/recipes/js/parse.js';///recipes/js/parse.js

const recipes = ['Stuffing', 'Pecan Bars', 'Brownies', 'Lemon Poppyseed Muffins', 'Ginger Cookies', 'Lemon Pound Cake', 'Crumb Cake', 'Pumpkin Muffins'];

/* Clear Query Paramaters */

function clearQuery() {
  window.history.replaceState('', document.title, window.location.toString().substring(0, window.location.toString().indexOf('?')));
}


/* Modal */

function disableScroll() {
  document.body.style.marginRight = window.innerWidth - document.documentElement.clientWidth + 'px';
  document.body.classList.add('disableScroll');
}

function enableScroll() {
  document.body.style.marginRight = 0;
  document.body.classList.remove('disableScroll');
}

const modal = document.getElementById('modal');
function hideModal() {
  modal.classList.add('out');
  modal.addEventListener('transitionend', function () {
    modal.style.display = 'none';
    enableScroll();
  }, { once: true });
  clearQuery();
}

document.addEventListener('click', function (e) {
  if (modal.contains(e.target) && !modal.childNodes[1].contains(e.target)) {
    hideModal();
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    hideModal();
  }
});

function createTextSpan(text) {
  const span = document.createElement('span');
  span.innerText = text;
  return span;
}

function isValidUrl(urlString) {
  try { 
    return Boolean(new URL(urlString)); 
  }
  catch(e) { 
    return false; 
  }
}

function openRecipe(name) {
  const request = new XMLHttpRequest();
  request.onload = function() {
    if (this.readyState === 4 && this.status === 200) {
      //clear modal
      const recipe = document.getElementById('recipe');
      while (recipe.firstChild) {
        recipe.removeChild(recipe.firstChild);
      }
      //add title
      const h2 = document.createElement('h2');
      h2.innerText = name;
      recipe.append(h2);
      //parse
      const parsed = Recipe(request.response);
      //add metadata
      if (parsed.metadata) {
        const table = document.createElement('table');
        for (const metadata in parsed.metadata) {
          const tr = document.createElement('tr');
          const td1 = document.createElement('td');
          td1.innerText = metadata;
          tr.append(td1);
          const td2 = document.createElement('td');
          if (metadata.toLowerCase() === 'source' && isValidUrl(parsed.metadata[metadata])) {
            const a = document.createElement('a');
            a.target = '_blank';
            a.rel = 'noopener';
            a.innerText = parsed.metadata[metadata];
            a.href = parsed.metadata[metadata];
            td2.append(a);
          } else {
            td2.innerText = parsed.metadata[metadata];
          }
          tr.append(td2);
          table.append(tr);
        }
        recipe.append(table);
      }
      if (parsed.ingredients || parsed.cookware) {
        const ingedientCookware = document.createElement('div');
        ingedientCookware.classList.add('ingedientCookware');
        //add ingredients
        if (parsed.ingredients) {
          const fieldset = document.createElement('fieldset');
          const legend = document.createElement('legend');
          legend.innerText = 'Ingredients';
          fieldset.append(legend);
          const ul = document.createElement('ul');
          for (const ingredient of parsed.ingredients) {
            const li = document.createElement('li');
            if (ingredient.quantity) {
              const span = document.createElement('span');
              span.classList.add('amount');
              span.innerText = ingredient.quantity + ' ' + ingredient.units;
              li.append(span);
              li.append(createTextSpan(' '));
            }
            li.append(createTextSpan(ingredient.name));
            ul.append(li);
          }
          fieldset.append(ul);
          ingedientCookware.append(fieldset);
        }
        //add cookware
        if (parsed.cookware) {
          const fieldset = document.createElement('fieldset');
          const legend = document.createElement('legend');
          legend.innerText = 'Cookware';
          fieldset.append(legend);
          const ul = document.createElement('ul');
          for (const cookware of parsed.cookware) {
            const li = document.createElement('li');
            if (cookware.quantity) {
              const span = document.createElement('span');
              span.classList.add('amount');
              span.innerText = cookware.quantity;
              li.append(span);
              li.append(createTextSpan(' '));
            }
            li.append(createTextSpan(cookware.name));
            ul.append(li);
          }
          fieldset.append(ul);
          ingedientCookware.append(fieldset);
        }
        recipe.append(ingedientCookware);
      }
      //add steps
      if (parsed.steps) {
        const h3 = document.createElement('h3');
        h3.innerText = 'Steps';
        recipe.append(h3);
        const ol = document.createElement('ol');
        for (const step of parsed.steps) {
          const li = document.createElement('li');
          for (const subStep of step) {
            if (subStep.type === 'text') {
              li.append(createTextSpan(subStep.value));
            } else if (subStep.type === 'ingredient') {
              const span = document.createElement('span');
              span.classList.add('ingredient');
              span.innerText = subStep.name;
              if (subStep.quantity) {
                span.title = subStep.quantity + ' ' + subStep.units;
              }
              li.append(span);
            } else if (subStep.type === 'cookware') {
              const span = document.createElement('span');
              span.classList.add('cookware');
              span.innerText = subStep.name;
              if (subStep.quantity) {
                span.title = subStep.quantity;
              }
              li.append(span);
            } else if (subStep.type === 'timer') {
              const span = document.createElement('span');
              span.classList.add('timer');
              span.innerText = subStep.quantity;
              if (subStep.units) {
                span.innerText += ' ' + subStep.units;
              }
              if (subStep.name) {
                span.title = subStep.name;
              }
              li.append(span);
            }
          }
          ol.append(li);
        }
        recipe.append(ol);
      }
      //show modal
      modal.style.display = 'block';
      disableScroll();
      modal.classList.remove('out');
    } else if (this.readyState === 4 && this.status !== 200) {
      Error(request.statusText);
    }
  };
  request.onerror = function () {
    Error('Network Error');
  };
  request.open('GET', path + 'recipes/'  + name + '.cook');
  request.send();
}

for (let i = 0; i < recipes.length; i++) {
  const item = document.createElement('div');
  item.classList.add('item');
  const content = document.createElement('div');
  content.classList.add('content');
  item.append(content);
  const h3 = document.createElement('h3');
  h3.innerText = recipes[i];
  content.append(h3);
  document.getElementsByTagName('main')[0].append(item);
  resizeMasonryItem(item);
  item.addEventListener('click', function() {
    window.history.replaceState('', document.title, window.location.toString() + '?item=' + recipes[i]);
    openRecipe(recipes[i]);
  });
}



/* Masonry */

function resizeMasonryItem(item) {
  const masonry = document.getElementsByTagName('main')[0];
  const rowHeight = parseInt(window.getComputedStyle(masonry).getPropertyValue('grid-auto-rows'));
  const rowGap = parseInt(window.getComputedStyle(masonry).getPropertyValue('grid-row-gap'));
  const rowSpan = Math.ceil((item.getElementsByClassName('content')[0].getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
  item.style.gridRowEnd = 'span ' + rowSpan;
}

window.addEventListener('resize', function() {
  const items = document.getElementsByClassName('item');
  for (let i = 0; i < items.length; i++) {
    resizeMasonryItem(items[i]);
  }
});



/* Query paramaters */

const params = new URLSearchParams(window.location.search);
if (params && params.has('item') && recipes.includes(params.get('item'))) {
  openRecipe(params.get('item'));
}