const root = document.querySelector('.app');

const div = document.createElement('div');
div.className = 'colors flex';

div.innerHTML = `
  <div class="color__column">
    <div class="column color__choose"></div>
  </div>
  <div class="color__column">
    <div class="column color__list"></div>
  </div>
`;

root.insertAdjacentElement('beforeend', div);

const info = document.createElement('div');
info.className += 'info';

root.insertAdjacentElement('afterend', info);

async function fetchColors() {
  try {
    const response = await fetch('./colors.json');
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
  }
};

fetchColors()
  .then(data => generateColors(data))

function generateColors(data) {

  let colors = [];
  data.map(color => {
    for (const [key, value] of Object.entries(color)) {
      colors.push([key, value]);
    }
  })

  setChosenColors(colors);
}

function setChosenColors(labels) {
  const chosenColors = document.querySelector('.color__choose');

  labels.reverse().map((label, index) => {
    const lastElement = Object.values(label[1]).pop();

    const checked = index === 0 ? true : false;

    const chosen = `
      <label title="${label[0]}">
        <input type="radio" name="color-radio" value="${label[0]}" checked=${checked}>
        <span style="background-color: ${lastElement.hex}"></span>
      </label >
      `;

    chosenColors.insertAdjacentHTML('afterbegin', chosen);
  });

  showAllColors(labels);
}

function showAllColors(labels) {

  // set default color to red
  setColors(labels, 'red');

  // set color when click on radio color
  document.addEventListener('input', (e) => {
    setColors(labels, e.target.value);
  })
}

function setColors(labels, color) {
  const colorList = document.querySelector('.color__list');
  // remove children div from color__list
  colorList.innerHTML = ''

  // remove style from body
  document.body.removeAttribute('style');

  // update title
  document.title = `Material Colors - ${color.toUpperCase()}`;

  // set label with name selected color
  colorList.insertAdjacentHTML('afterbegin', `<div class="color__label">${color}</div>`);

  // get array with selected color
  // and set inside color__list
  // after label color name
  const arrayColors = labels.filter(item => item[0] === color);
  for (const [key, value] of Object.entries(arrayColors[0][1])) {
    colorList.insertAdjacentHTML('beforeend', `
      <div class="colors-item" data-type="${key}" data-color="${value.hex}" style="background-color: ${value.hex};">
        <span>${value.hex}</span>
      </div>
    `);
  };
}


let timeoutID;

document.addEventListener('click', function (e) {
  if (e.target.className === 'colors-item') {

    clearTimeout(timeoutID);

    const color = e.target.textContent.trim();
    const input = document.createElement('input');
    const hiddenColor = document.querySelector('.hidden-color');

    if (hiddenColor) {
      hiddenColor.remove();
    }
    input.className = 'hidden-color';

    document.body.appendChild(input);

    info.textContent = `Copied color: ${color}`

    input.setAttribute('value', color);
    input.select();
    document.execCommand('copy');

    info.classList.add('active');

    timeoutID = setTimeout(() => {
      info.classList.remove('active');
    }, 3000);

    document.body.setAttribute('style', `background-color: ${e.target.dataset.color}`);
  }
})
