const root = document.querySelector('.app');

const div = document.createElement('div');
div.className = 'colors flex';

div.innerHTML = `
  <div class="color__column">
    <div class="grid column color__choose"></div>
  </div>
  <div class="color__column">
    <div class="grid column color__list"></div>
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
}
fetchColors().then((data) => generateColors(data));

function generateColors(data) {
  let colors = [];
  data.map((color) => {
    for (const [key, value] of Object.entries(color)) {
      colors.push([key, value]);
    }
  });

  setChosenColors(colors);
}

function setChosenColors(labels) {
  const chosenColors = document.querySelector('.color__choose');

  labels.reverse().map((label) => {
    const chosen = `<span class="color-item">${label[0]}</span>`;

    chosenColors.insertAdjacentHTML('afterbegin', chosen);
  });

  setColors(labels);

  // first red set checked
  // document.querySelector('[title="red"]').firstElementChild.click();
}

function removeStyleFromSpan(event) {
  const target = event.target.nextElementSibling;
  const colorItems = document.querySelectorAll('.color-item');

  colorItems.forEach((item) => {
    const colorHex = item.getAttribute('data-hex');
    const colorHexTarget = target.getAttribute('data-hex');
    item.setAttribute('style', `background-color: ${colorHex}`);
    target.setAttribute(
      'style',
      `transform: scale(0.5); box-shadow: 0 0 0 10px rgb(255 255 255), 0 0 0 15px ${colorHexTarget}; background-color: ${colorHexTarget}`
    );
  });
}

function hexToHSL(H) {
  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0;
  if (H.length == 4) {
    r = '0x' + H[1] + H[1];
    g = '0x' + H[2] + H[2];
    b = '0x' + H[3] + H[3];
  } else if (H.length == 7) {
    r = '0x' + H[1] + H[2];
    g = '0x' + H[3] + H[4];
    b = '0x' + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

function hexToRGB(h) {
  let r = 0,
    g = 0,
    b = 0;

  if (h.length == 4) {
    r = '0x' + h[1] + h[1];
    g = '0x' + h[2] + h[2];
    b = '0x' + h[3] + h[3];
  } else if (h.length == 7) {
    r = '0x' + h[1] + h[2];
    g = '0x' + h[3] + h[4];
    b = '0x' + h[5] + h[6];
  }

  return 'rgb(' + +r + ',' + +g + ',' + +b + ')';
}

function showAllColors(labels) {
  // set default color to red
  // setColors(labels, 'red');

  // set color when click on radio color
  document.addEventListener('change', (e) => {
    setColors(labels, e.target.value);
    document.documentElement.style.setProperty('--info-color', 'black');

    removeStyleFromSpan(e);
  });
}

function setColors(labels) {
  const colorList = document.querySelector('.color__list');
  // remove children div from color__list
  colorList.innerHTML = '';

  // remove style from body
  document.body.removeAttribute('style');

  // update title
  document.title = 'Material Colors';

  const arrayColors = labels.filter((item) => item).map((item) => item[1]);

  let i = 0;
  arrayColors.map((color, index) => {
    let column;
    if (index == i) {
      column = document.createElement('div');
      column.className = `column-item`;
      colorList.insertAdjacentElement('afterbegin', column);
    }
    // console.log('c', color);
    for (const [key, value] of Object.entries(color)) {
      column.insertAdjacentHTML(
        'beforeend',
        `<div class="colors-item" data-type="${key}" data-color="${
          value.hex
        }" style="background-color: ${value.hex}; color: ${invertHex(
          value.hex
        )}">
        <span>${key}</span>
        <span style="display: none;">${value.hex}</span>
      </div>`
      );
    }
    i++;
  });
}

function invertHex(hexcolor) {
  hexcolor = hexcolor.replace('#', '');
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'black' : 'white';
}

let timeoutID;

document.addEventListener('click', function (e) {
  if (e.target.className === 'colors-item') {
    clearTimeout(timeoutID);

    const hex = e.target.lastElementChild.textContent.trim();
    const input = document.createElement('input');
    const hiddenColor = document.querySelector('.hidden-color');

    if (hiddenColor) {
      hiddenColor.remove();
    }
    input.className = 'hidden-color';

    document.body.appendChild(input);

    const hsl = hexToHSL(hex);
    const rgb = hexToRGB(hex);

    let colorType = 0;
    const selectChose = document.querySelector('.select-chose').selectedIndex;
    switch (selectChose) {
      case 0:
        colorType = hex;
        break;
      case 1:
        colorType = rgb;
        break;
      case 2:
        colorType = hsl;
        break;
      default:
        colorType = hex;
        break;
    }

    info.innerHTML = `Code copied to clipboard.<br/>${colorType}`;

    input.setAttribute('value', `${colorType}`);
    input.select();
    document.execCommand('copy');

    info.classList.add('active');

    timeoutID = setTimeout(() => {
      info.classList.remove('active');
    }, 1000);

    const hexColor = e.target.dataset.color;

    document.documentElement.style.setProperty('--body-color', hexColor);
    document.documentElement.style.setProperty(
      '--info-color',
      `${invertHex(hexColor)}`
    );
  }
});

const colors = document.querySelector('.colors');
function changeTypeOfColor() {
  const selectChose = `
    <div class="flex chose-color">
      <label>Color</label>
      <select class="select-chose">
        <option value="hex"> HEX </option>
        <option value="rgb"> RGB </option>
        <option value="hsl"> HSL </option>
      </select>
    </div>
  `;

  colors.insertAdjacentHTML('beforeend', selectChose);
}

changeTypeOfColor();
