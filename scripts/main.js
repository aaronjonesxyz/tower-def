const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.width = 800;
canvas.height = 600;
const ctx = canvas.getContext("2d");

class ContextArtist {
  constructor(ctx) {
    this.ctx = ctx;
  }

  #calculateRotationTranslate(x, y, width, height) {
    const translateX = x + width/2;
    const translateY = y + height/2;
    return [translateX, translateY];
  }

  #calculateOriginFromCenter(x, y, width, height) {
    const originX = x - width/2;
    const originY = y - height/2;
    return [originX, originY];
  }

  drawRect(component) {
    const orbitRadius = component.animation?.orbit?.radius || 0;
    const orbitRotation = component.animation?.orbit?.rotation || 0;
    let [originX, originY] = this.#calculateOriginFromCenter(component.x, component.y, component.width, component.height);
    if(orbitRadius > 0) {
      originX += orbitRadius;
    }
    const [translateX, translateY] = this.#calculateRotationTranslate(originX, originY, component.width, component.height);
    const radii = ("radii" in component)? component.radii : [0]; 
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = component.colour;
    ctx.lineWidth = component.lineWidth;

    ctx.translate(component.x, component.y);
    ctx.rotate(orbitRotation * Math.PI / 180);
    ctx.translate(-component.x, -component.y);

    ctx.translate(translateX, translateY);
    ctx.rotate(component.rotation * Math.PI / 180);
    ctx.translate(-translateX, -translateY);

    ctx.roundRect(originX, originY, component.width, component.height, radii);
    ctx.stroke();
    ctx.restore();
  }

  drawCircle(component) {
    ctx.beginPath();
    ctx.arc(component.x, component.y, component.radius, 0, Math.PI * 2, false);
    ctx.strokeStyle = component.colour;
    ctx.lineWidth = component.lineWidth;
    ctx.stroke();
  }

  drawLine(component) {
    ctx.beginPath();
    ctx.moveTo(component.x, component.y);
    ctx.lineTo(component.x_end, component.y_end);
    ctx.strokeStyle = component.colour;
    ctx.lineWidth = component.lineWidth;
    ctx.stroke();
  }
}

class Actor {
  constructor(artist, components, x, y) {
    this.artist = artist;
    this.components = [...components];
    this.x = x;
    this.y = y;

    this.components.forEach(component => {
      component.x += this.x;
      component.y += this.y;
    });
  }

  #animate(component) {
    if(!("animation" in component)) return;

    component.rotation = ("rotate" in component.animation) ? component.rotation + component.animation.rotate : component.rotation;

    if(!("orbit" in component.animation)) return;

    component.animation.orbit.rotation = component.animation.orbit.rotation + component.animation.orbit.speed;
  }

  draw() {
    this.components.forEach(component => {
      this.#animate(component);
      switch(component.shape) {
        case "rect":
          artist.drawRect(component);
          break;
        case "circle":
          artist.drawCircle(component);
          break;
      }
    });
  }

}

const tower = [
  {
    shape: "rect",
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    colour: "blue",
    rotation: 0,
    radii: [10],
    lineWidth: 2,
    animation: {
      rotate: 0,
    }
  },
  {
    shape: "rect",
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    colour: "green",
    rotation: 0,
    radii: [5],
    lineWidth: 3,
    animation: {
      rotate: -6,
      orbit: {
        rotation: 0,
        radius: 35,
        speed: 2
      }
    }
  },
  {
    shape: "rect",
    x: 0,
    y: 0,
    width: 20,
    height: 20,
    colour: "green",
    rotation: 0,
    radii: [5],
    lineWidth: 3,
    animation: {
      rotate: -6,
      orbit: {
        rotation: 180,
        radius: 35,
        speed: 2
      }
    }
  },
  {
    shape: "rect",
    x: 0,
    y: 0,
    width: 15,
    height: 15,
    colour: "red",
    rotation: 0,
    radii: [1],
    lineWidth: 3,
    animation: {
      rotate: -3,
    }
  }
];

const artist = new ContextArtist(ctx);
const towerA = new Actor(artist, tower, 200, 400);
animate();

function animate() {
  ctx.clearRect(0,0,800,600);
  towerA.draw();
  window.requestAnimationFrame(animate);
}