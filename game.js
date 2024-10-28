var Snake = (function() {

  const INITIAL_TAIL = 4;
  var fixedTail = true;

  var intervalID;
  var tileCount = 20; // Increased for more responsiveness
  var gridSize = 400 / tileCount;

  const INITIAL_PLAYER = { x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) };

  var velocity = { x: 0, y: 0 };
  var player = { x: INITIAL_PLAYER.x, y: INITIAL_PLAYER.y };

  var walls = false;
  var fruit = { x: 1, y: 1 };
  var trail = [];
  var tail = INITIAL_TAIL;

  var reward = 0;
  var points = 0;
  var pointsMax = 0;

  var ActionEnum = { 'none': 0, 'up': 1, 'down': 2, 'left': 3, 'right': 4 };
  Object.freeze(ActionEnum);
  var lastAction = ActionEnum.none;

  // Sound effects
  var eatSound = new Audio('sounds/eat.mp3');
  var gameOverSound = new Audio('sounds/gameover.mp3');
  var backgroundSound = new Audio('sounds/background.mp3');
  backgroundSound.loop = true;

  function setup() {
    canv = document.getElementById('gc');
    ctx = canv.getContext('2d');

    game.reset();
  }

  var game = {

    reset: function() {
      ctx.fillStyle = 'lightgrey'; // Background color
      ctx.fillRect(0, 0, canv.width, canv.height);

      tail = INITIAL_TAIL;
      points = 0;
      velocity.x = 0;
      velocity.y = 0;
      player.x = INITIAL_PLAYER.x;
      player.y = INITIAL_PLAYER.y;
      reward = -1;

      lastAction = ActionEnum.none;

      trail = [];
      trail.push({ x: player.x, y: player.y });
      backgroundSound.play(); // Start background music
    },

    action: {
      up: function() {
        if (lastAction != ActionEnum.down) {
          velocity.x = 0;
          velocity.y = -1;
        }
      },
      down: function() {
        if (lastAction != ActionEnum.up) {
          velocity.x = 0;
          velocity.y = 1;
        }
      },
      left: function() {
        if (lastAction != ActionEnum.right) {
          velocity.x = -1;
          velocity.y = 0;
        }
      },
      right: function() {
        if (lastAction != ActionEnum.left) {
          velocity.x = 1;
          velocity.y = 0;
        }
      }
    },

    RandomFruit: function() {
      do {
        fruit.x = Math.floor(Math.random() * tileCount);
        fruit.y = Math.floor(Math.random() * tileCount);
      } while (trail.some(segment => segment.x === fruit.x && segment.y === fruit.y)); // Ensure fruit doesn't spawn on snake
    },

    loop: function() {
      reward = -0.1;

      function DontHitWall() {
        if (player.x < 0) player.x = tileCount - 1;
        if (player.x >= tileCount) player.x = 0;
        if (player.y < 0) player.y = tileCount - 1;
        if (player.y >= tileCount) player.y = 0;
      }

      function HitWall() {
        if (player.x < 1 || player.x > tileCount - 2 || player.y < 1 || player.y > tileCount - 2) {
          gameOverSound.play(); // Play game over sound
          game.reset();
        }
      }

      var stopped = velocity.x == 0 && velocity.y == 0;

      player.x += velocity.x;
      player.y += velocity.y;

      if (velocity.x == 0 && velocity.y == -1) lastAction = ActionEnum.up;
      if (velocity.x == 0 && velocity.y == 1) lastAction = ActionEnum.down;
      if (velocity.x == -1 && velocity.y == 0) lastAction = ActionEnum.left;
      if (velocity.x == 1 && velocity.y == 0) lastAction = ActionEnum.right;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillRect(0, 0, canv.width, canv.height);

      if (walls) HitWall();
      else DontHitWall();

      if (!stopped) {
        trail.push({ x: player.x, y: player.y });
        while (trail.length > tail) trail.shift();
      }

      if (!stopped) {
        ctx.fillStyle = 'black';
        ctx.font = "small-caps 14px Helvetica";
        ctx.fillText("(esc) reset", 24, 356);
        ctx.fillText("(space) pause", 24, 374);
      }

      ctx.fillStyle = 'lime'; // Snake color
      for (var i = 0; i < trail.length - 1; i++) {
        ctx.fillRect(trail[i].x * gridSize + 1, trail[i].y * gridSize + 1, gridSize - 2, gridSize - 2);
        if (!stopped && trail[i].x == player.x && trail[i].y == player.y) {
          gameOverSound.play(); // Play game over sound
          game.reset();
        }
      }
      ctx.fillRect(trail[trail.length - 1].x * gridSize + 1, trail[trail.length - 1].y * gridSize + 1, gridSize - 2, gridSize - 2);

      if (player.x == fruit.x && player.y == fruit.y) {
        tail++;
        points++;
        eatSound.play();
        game.RandomFruit();
      }

      ctx.fillStyle = 'red';
      ctx.fillRect(fruit.x * gridSize + 1, fruit.y * gridSize + 1, gridSize - 2, gridSize - 2);

      if (stopped) {
        ctx.fillStyle = 'rgba(250,250,250,0.8)';
        ctx.font = "small-caps bold 14px Helvetica";
        ctx.fillText("press ARROW KEYS to START...", 24, 374);
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.font = "bold small-caps 16px Helvetica";
      ctx.fillText("points: " + points, 288, 40);
      ctx.fillText("top: " + pointsMax, 292, 60);

      return reward;
    }
  };

  function keyPush(evt) {
    switch (evt.keyCode) {
      case 37: // left
        game.action.left();
        evt.preventDefault();
        break;

      case 38: // up
        game.action.up();
        evt.preventDefault();
        break;

      case 39: // right
        game.action.right();
        evt.preventDefault();
        break;

      case 40: // down
        game.action.down();
        evt.preventDefault();
        break;

      case 32: // space
        Snake.pause();
        evt.preventDefault();
        break;

      case 27: // esc
        game.reset();
        evt.preventDefault();
        break;
    }
  }

  return {
    start: function(fps = 15) {
      window.onload = setup;
      intervalID = setInterval(game.loop, 1000 / fps);
    },

    loop: game.loop,

    reset: game.reset,

    stop: function() {
      clearInterval(intervalID);
    },

    setup: {
      keyboard: function(state) {
        if (state) {
          document.addEventListener('keydown', keyPush);
        } else {
          document.removeEventListener('keydown', keyPush);
        }
      },
      wall: function(state) {
        walls = state;
      },
      tileCount: function(size) {
        tileCount = size;
        gridSize = 400 / tileCount;
      },
      fixedTail: function(state) {
        fixedTail = state;
      }
    },

    action: function(act) {
      switch (act) {
        case 'left':
          game.action.left();
          break;

        case 'up':
          game.action.up();
          break;

        case 'right':
          game.action.right();
          break;

        case 'down':
          game.action.down();
          break;
      }
    },

    pause: function() {
      velocity.x = 0;
      velocity.y = 0;
    },

    clearTopScore: function() {
      pointsMax = 0;
    },

    data: {
      player: player,
      fruit: fruit,
      trail: function() {
        return trail;
      }
    },

    info: {
      tileCount: tileCount
    }
  };

})();

Snake.start(6);
Snake.setup.keyboard(true);
Snake.setup.fixedTail(false);
