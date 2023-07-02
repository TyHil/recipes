let path = '/recipes/recipes/';// /recipes/recipes/
import { Recipe } from '/recipes/js/parse.js';// /recipes/js/parse.js



/* Transition Management */

//Stop new clicks when still animating
let transitioning = 0;

//On transition end or immediatly if transitions disabled
function onTransitionEnd(element, callback) {
  if (document.readyState !== "complete") {
    callback();
  } else {
    element.addEventListener("transitionend", callback, { once: true });
  }
}



/* Clear Query Paramaters */

function clearQuery() {
  window.history.replaceState('', document.title, window.location.toString().substring(0, window.location.toString().indexOf('?')));
}



/* Favicon */

const faviconEl = document.querySelector('link[rel="icon"]');
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function(event) {
  if (event.matches) {
    faviconEl.href = '/recipes/tabicon-light.png';
  } else {
    faviconEl.href = '/recipes/tabicon.png';
  }
});



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
  modal.addEventListener('transitionend', function() {
    modal.style.display = 'none';
    enableScroll();
  }, { once: true });
  clearQuery();
}

document.addEventListener('click', function(e) {
  if (modal.contains(e.target) && !modal.childNodes[1].contains(e.target)) {
    hideModal();
  }
});

document.addEventListener('keydown', function(e) {
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
  catch (e) {
    return false;
  }
}

function openRecipe(name) {
  fetch(path + name + '.cook').then(async (response) => {
    if (response.ok) {
      return response.text();
    } else {
      throw await response.text();
    }
  }).then((data) => {
    //add title
    modal.getElementsByTagName('h2')[0].innerText = name;
    //parse
    const parsed = Recipe(data);
    //add metadata
    const table = modal.getElementsByTagName('table')[0];
    while (table.firstChild) {
      table.removeChild(table.firstChild);
    }
    if (parsed.metadata) {
      table.style.display = 'block';
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
    } else {
      table.style.display = 'none';
    }
    const ingedientCookware = modal.getElementsByClassName('ingedientCookware')[0];
    const ul1 = modal.getElementsByTagName('ul')[0];
    while (ul1.firstChild) {
      ul1.removeChild(ul1.firstChild);
    }
    const ul2 = modal.getElementsByTagName('ul')[1];
    while (ul2.firstChild) {
      ul2.removeChild(ul2.firstChild);
    }
    if (parsed.ingredients || parsed.cookware) {
      ingedientCookware.style.display = 'flex';
      //add ingredients
      if (parsed.ingredients) {
        ul1.style.display = 'block';
        for (const ingredient of parsed.ingredients) {
          const li = document.createElement('li');
          const input = document.createElement('input');
          input.type = 'checkbox';
          li.append(input);
          if (ingredient.quantity) {
            const span = document.createElement('span');
            span.classList.add('amount');
            span.innerText = ingredient.quantity + ' ' + ingredient.units;
            li.append(span);
            li.append(createTextSpan(' '));
          }
          li.append(createTextSpan(ingredient.name));
          ul1.append(li);
        }
      } else {
        ul1.style.display = 'none';
      }
      //add cookware
      if (parsed.cookware) {
        ul2.style.display = 'block';
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
          ul2.append(li);
        }
      } else {
        ul2.style.display = 'none';
      }
    } else {
      ingedientCookware.style.display = 'none';
    }
    //add steps
    const ol = modal.getElementsByTagName('ol')[0];
    while (ol.firstChild) {
      ol.removeChild(ol.firstChild);
    }
    if (parsed.steps) {
      ol.style.display = 'block';
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
    } else {
      ol.style.display = 'none';
    }
    //show modal
    modal.style.display = 'block';
    document.getElementById('recipe').scrollTop = 0;
    disableScroll();
    modal.classList.remove('out');
  });
}



/* Masonry */

const recipes = document.getElementsByClassName('item');
for (let i = 0; i < recipes.length; i++) {
  resizeMasonryItem(recipes[i]);
  recipes[i].addEventListener('click', function() {
    window.history.replaceState('', document.title, window.location.toString() + '?item=' + recipes[i].innerText);
    openRecipe(recipes[i].innerText);
  });
}

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
if (params && params.has('item')) {
  for (let i = 0; i < recipes.length; i++) {
    if (recipes[i].innerText === params.get('item')) {
      openRecipe(params.get('item'));
    }
  }
}



/* Items */

class Item {
  constructor(item) {
    this.item = item;
  }
  hide() {
    this.item.style.display = "none";
  }
  show() {
    this.item.style.display = "flex";
  }
}

const itemElements = document.getElementsByClassName("item");
const items = [];
for (let i = 0; i < itemElements.length; i++) {
  items.push(new Item(itemElements[i]));
}



/* Filter */

class Filter {
  constructor(filter) {
    this.filter = filter;
  }
  hide() {
    if (!this.filter.classList.contains("remove")) {
      transitioning = 1;
      this.filter.style.maxWidth = this.filter.getBoundingClientRect().width + "px";
      setTimeout(() => {
        this.filter.classList.add("remove");
        this.filter.style.maxWidth = 0;
        onTransitionEnd(this.filter, () => {
          this.filter.style.display = "none";
          transitioning = 0;
        });
      });
    }
  }
  show() {
    if (this.filter.classList.contains("remove")) {
      transitioning = 1;
      this.filter.style.display = "inline-block";
      setTimeout(() => {
        this.filter.style.maxWidth = "200px";
        this.filter.classList.remove("remove");
        onTransitionEnd(this.filter, () => {
          this.filter.style.maxWidth = "";
          transitioning = 0;
        });
      });
    }
  }
}

const filterButtons = document.getElementsByClassName("filterButton");
const filters = {};
for (let i = 0; i < filterButtons.length; i++) {
  filters[filterButtons[i].id] = new Filter(filterButtons[i]);
  filterButtons[i].addEventListener("click", () => {
    if (!transitioning) {
      openFilter(filterButtons[i]);
    }
  });
}

function openFilter(filter) {
  if (!filter.classList.contains("filtered")) { //Not already clicked
    filter.classList.add("filtered");
    for (let i = 0; i < filterButtons.length; i++) {
      if (filterButtons[i].classList.contains("filtered") || filterButtons[i].classList.contains(filter.id)) { //Show subfilters others
        filters[filterButtons[i].id].show();
      }
    }
    for (let i = 0; i < items.length; i++) { //Hide rectangles
      if (!items[i].item.classList.contains(filter.id)) {
        items[i].hide();
      }
    }
    const clearFilter = document.getElementById("clearFilter"); //Show clear filter button
    clearFilter.style.display = "flex";
    setTimeout(() => {
      clearFilter.classList.add("show");
    });
  }
}

//Close filters
document.getElementById("clearFilter").addEventListener("click", function() {
  if (!transitioning) {
    clearQuery();
    this.classList.remove("show"); //Hide self
    this.style.display = "none";

    for (let i = 0; i < filterButtons.length; i++) { //Show all buttons except subfilters
      if (!filterButtons[i].classList.contains("subfilter")) {
        filters[filterButtons[i].id].show();
      } else {
        filters[filterButtons[i].id].hide();
      }
    }
    for (let i = 0; i < items.length; i++) { //Show all rectangles
      items[i].show();
    }
    while (document.getElementsByClassName("filtered")[0]) {
      document.getElementsByClassName("filtered")[0].classList.remove("filtered");
    }
  }
});
