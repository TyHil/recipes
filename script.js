let path = '/recipes/recipes/';///recipes/recipes/
import { Recipe } from '/recipes/js/parse.js';///recipes/js/parse.js



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
      //add title
      modal.getElementsByTagName('h2')[0].innerText = name;
      //parse
      const parsed = Recipe(request.response);
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
    } else if (this.readyState === 4 && this.status !== 200) {
      Error(request.statusText);
    }
  };
  request.onerror = function () {
    Error('Network Error');
  };
  request.open('GET', path + name + '.cook');
  request.send();
}



/* Masonry */

document.body.addEventListener('keydown', function (e) {//enable enter while tabbing over spans
  if ((e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') && document.activeElement !== null && document.activeElement.classList.contains('item')) {
    document.activeElement.click();
  }
});

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