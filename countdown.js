// TODO: Use prototypes?
var CanvasTools = {
    init: function() {
        this.canvas = document.getElementById("canvas");
        this.c = this.canvas.getContext("2d");
        this.resize = function() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        // Resize once initially to set the canvas size.
        this.resize();
        window.addEventListener('resize', this.resize, false);
    },
    clear: function() {
        this.resize();
    },
    width: function() {
        return this.canvas.width;
    },
    height: function() {
        return this.canvas.height;
    }
};
var Mouse = {
    init: function(canvas) {
        canvas.addEventListener('mousemove', function(event) {
            var rect = canvas.getBoundingClientRect();
            Mouse.x = event.clientX - rect.left;
            Mouse.y = event.clientY - rect.top;
        }, false);
        canvas.addEventListener('mousedown', function(event) {
            if (event.button === 0) {
                if (event.shiftKey) {
                    Mouse.shift = true;
                }
                Mouse.leftDown = true;
            }
        }, false);
        canvas.addEventListener('mouseup', function(event) {
            if (event.button === 0) {
                if (event.shiftKey) {
                    Mouse.shift = false;
                }
                Mouse.leftDown = false;
            }
        }, false);
    }
};
var Keyboard = {
    down: [],
    downAdd: [],
    pressed: [],
    pressedAdd: [],
    toRemove: [],
    init: function() {
        window.addEventListener('keypress', function(event) {
            console.log(String.fromCharCode(event.keyCode));
            Keyboard.recordPress(event);
        }, false);
        window.addEventListener('keydown', function(event) {
            Keyboard.recordDown(event);
        }, false);
        window.addEventListener('keyup', function(event) {
            Keyboard.recordUp(event);
        }, false);
    },
    update: function() {
        for (var i = 0; i < this.downAdd.length; i++) {
            var key = this.downChange.pop();
            //if ()
        }

    },
    keyPressed: function(key) {
        return this.pressed.indexOf(key) !== -1;
    },
    keyDown: function(key) {
        return this.down.indexOf(key) !== -1;
    },
    recordPress: function(event) {
        if (event !== 'undefined') {
            var keyString = String.fromCharCode(event.keyCode);
            var index = this.pressed.indexOf(keyString);
            if (index == -1) {
                this.pressed.push(keyString);
            }
        }
    },
    recordDown: function(event) {
        if (event !== 'undefined') {
            var keyString = String.fromCharCode(event.keyCode);
            var index = this.down.indexOf(keyString);
            if (index == -1) {
                this.down.push(keyString);
            }
        }
    },
    recordUp: function(event) {
        if (event !== 'undefined') {
            var keyString = String.fromCharCode(event.keyCode);
            var index = this.down.indexOf(keyString);
            if (index != -1) {
                this.down.splice(index, 1);
            }
            index = this.pressed.indexOf(keyString);
            if (index != -1) {
                this.pressed.splice(index, 1);
            }
        }
    }
};
var GameOfLife = {
    width: 80,
    height: 40,
    cellSize: 10,
    cellPadding: 2,
    timeRoof: 5,
    time: 0,
    paused: true,
    init: function() {
        this.cells = new Array(this.width);
        for (var x = 0; x < this.width; x++) {
            this.cells[x] = new Array(this.height);
            for (var y = 0; y < this.height; y++) {
                this.cells[x][y] = false;
            }
        }
        this.renderWidth = (this.cellSize + this.cellPadding) * this.width;
        this.renderHeight = (this.cellSize + this.cellPadding) * this.height;
        this.xo = (CanvasTools.width() - this.renderWidth) / 2;
        this.yo = (CanvasTools.height() - this.renderHeight) / 2;
    },
    update: function() {
        if (Keyboard.keyPressed(" ")) {
            this.paused = !this.paused;
        }
        if (!this.paused) {
            this.time++;
            if (this.time >= this.timeRoof) {
                var toDelete = [];
                var toCreate = [];

                for (var x = 0; x < this.width; x++) {
                    for (var y = 0; y < this.height; y++) {
                        var neighbors = this.getNeighbors(x, y);
                        if (this.cells[x][y] && !(neighbors == 2 || neighbors == 3)) {
                            toDelete.push({
                                x: x,
                                y: y
                            });
                        } else if (!this.cells[x][y] && neighbors == 3) {
                            toCreate.push({
                                x: x,
                                y: y
                            });
                        }
                    }
                }
                toDelete.forEach(function(cell) {
                    GameOfLife.cells[cell.x][cell.y] = false;
                });
                toCreate.forEach(function(cell) {
                    GameOfLife.cells[cell.x][cell.y] = true;
                });
                this.time = 0;
            }
            this.xo = (CanvasTools.width() - this.renderWidth) / 2;
            this.yo = (CanvasTools.height() - this.renderHeight) / 2;
        }
    },
    render: function(c) {
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (this.cells[x][y]) {
                    c.fillStyle = "rgba(255, 255, 255, 1)";
                } else {
                    c.fillStyle = "rgba(255, 255, 255, 0.1)";
                }
                c.fillRect(this.xo + x * (this.cellSize + this.cellPadding),
                    this.yo + y * (this.cellSize + this.cellPadding), this.cellSize, this.cellSize);
            }
        }
    },
    getNeighbors: function(x, y) {
        var neighbors = 0;
        neighbors += this.checkIndex(x - 1, y - 1) ? 1 : 0;
        neighbors += this.checkIndex(x - 1, y) ? 1 : 0;
        neighbors += this.checkIndex(x - 1, y + 1) ? 1 : 0;
        neighbors += this.checkIndex(x, y - 1) ? 1 : 0;
        neighbors += this.checkIndex(x, y + 1) ? 1 : 0;
        neighbors += this.checkIndex(x + 1, y - 1) ? 1 : 0;
        neighbors += this.checkIndex(x + 1, y) ? 1 : 0;
        neighbors += this.checkIndex(x + 1, y + 1) ? 1 : 0;
        return neighbors;
    },
    checkIndex: function(x, y) {
        if (x < 0 || x >= this.cells.length || y < 0 || y >= this.cells[0].length) {
            return false;
        } else {
            return this.cells[x][y];
        }
    },
    inBounds: function(pos) {
        return pos.x >= this.xo && pos.y >= this.yo && pos.x <= (this.xo + this.renderWidth) && pos.y <= (this.yo + this.renderHeight);
    },
    mouseIn: function() {
        return this.inBounds(Mouse);
    },
    inGrid: function(indices) {
        return indices.x >= 0 && indices.y >= 0 && indices.x < this.width && indices.y < this.height;
    },
    cellIn: function() {
        if (this.mouseIn()) {
            var x = Math.floor((Mouse.x - this.xo) / (this.cellSize + this.cellPadding));
            var y = Math.floor((Mouse.y - this.yo) / (this.cellSize + this.cellPadding));
            return {
                x: x,
                y: y
            };
        } else {
            return {
                x: -1,
                y: -1
            };
        }
    },
    setCell: function(cell, value) {
        if (this.inGrid(cell)) {
            this.cells[cell.x][cell.y] = value;
        }
    },
    togglePause: function() {
        this.paused = !this.paused;
    }
};
var Time = {
    init: function() {
        this.death = new Date("11/28/2084").getTime()
    },
    update: function() {
        this.timeLeft = (this.death - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365);
    },
    render: function(c) {
        var timeLeftString = String(this.timeLeft);
        c.font = "80px Arial";
        var a = 0.3;
        var aIncrement = (1.0 - a) / timeLeftString.length;
        var gap = 60;
        var x = 200;
        var y = CanvasTools.height() / 2;
        c.fillStyle = "white";
        for (var i = 0; i < timeLeftString.length; i++) {
            c.fillStyle = "rgba(255, 255, 255, " + a + ")";
            c.fillText(timeLeftString.charAt(i), i * gap + x, y);
            a += aIncrement;
        }
    }
};

CanvasTools.init();
Mouse.init(CanvasTools.canvas);
Keyboard.init();
GameOfLife.init();
Time.init();

function update() {
    CanvasTools.clear();
    var c = CanvasTools.c;

    Time.update();
    GameOfLife.update();

    if (Mouse.leftDown) {
        if (Mouse.shift) {
            GameOfLife.setCell(GameOfLife.cellIn(), false);
        } else {
            GameOfLife.setCell(GameOfLife.cellIn(), true);
        }
    }

    render(c);
}

function render(c) {
    GameOfLife.render(c);
}

// 1000ms = 1s
// 30 ticks per second
setInterval(update, 1000 / 30);