/*
This version of the A* visualization allows for the user to interact with the grid itself.
Simply left-click to add walls, and right-click to remove them.
Once you are satisfied with the maze, press any key to see how A* solves your creation!
This program currently finds the shortest path based on Chebyshev distance (King's distance)
 */

function removeFromArray(arr, elt) {
    for (var i = arr.length - 1; i >= 0; i--) {
        if (arr[i] === elt) arr.splice(i, 1);
    }
}

var size = 65; //change these parameters to change dimensions of grid
var cols = size;
var rows = size;
var grid = new Array(cols);

var openSet = [];
var closedSet = [];
var start;
var end;
var w, h, r;
var path = [];
var begin = false;
var done = false;
var previous;
var current;
var beginTime;
var finalScore;
var highScore = 0;
var help = false;

function keyPressed() {
    if (!begin) {
        if (key === 'm') genMaze();
        else if (key === 'h') help = !help;
        else {
            console.log("Running A* algorithm...");
            start.wall = false;
            end.wall = false;
            begin = true;
            beginTime = millis();
        }
    } else if (key === 'r') {
        console.log("Restarting A* algorithm...");
        setup();
    }
}

function Spot(i, j) {
    this.i = i;
    this.j = j;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbors = [];
    this.dist = [];
    this.prev = undefined;
    this.wall = random(1) < 0.3;
    this.lone = 1;

    if (this.i === 0 || this.i === cols - 1 || this.j === 0 || this.j === rows - 1) this.wall = 1;
    if (this.i === 1 && this.j === rows - 2) this.wall = 0;
    if (this.i === cols - 2 && this.j === 1) this.wall = 0;

    this.show = function() {
        if (this.lone && this.wall) {
            fill(0);
            noStroke();
            ellipse(this.i * w + w / 2, this.j * h + h / 2, r * 0.3);
        }
    }

    this.addNeighbors = function(grid) {
        var i = this.i;
        var j = this.j;
        if (i < cols - 1) {this.neighbors.push(grid[i + 1][j]); this.dist.push(1);}
        if (j < rows - 1) {this.neighbors.push(grid[i][j + 1]); this.dist.push(1);}
        if (i > 0) {this.neighbors.push(grid[i - 1][j]); this.dist.push(1);}
        if (j > 0) {this.neighbors.push(grid[i][j - 1]); this.dist.push(1);}
        if (i < cols - 1 && j < rows - 1) {this.neighbors.push(grid[i + 1][j + 1]); this.dist.push(1);}
        if (i > 0 && j > 0) {this.neighbors.push(grid[i - 1][j - 1]); this.dist.push(1);}
        if (i < cols - 1 && j > 0) {this.neighbors.push(grid[i + 1][j - 1]); this.dist.push(1);}
        if (i > 0 && j < rows - 1) {this.neighbors.push(grid[i - 1][j + 1]); this.dist.push(1);}
    }

    this.connectWalls = function(grid) {
        if (this.wall) {
            var i = this.i;
            var j = this.j;
            if (i < cols - 1 && grid[i + 1][j].wall) {
                this.lone = 0; grid[i + 1][j].lone = 0;
                var i2 = grid[i + 1][j].i;
                var j2 = grid[i + 1][j].j;
                strokeWeight(1);
                stroke(0);
                line(i * w + w / 2, j * h + h / 2, i2 * w + w / 2, j2 * h + h / 2);
            }
            if (j < rows - 1 && grid[i][j + 1].wall) {
                this.lone = 0; grid[i][j + 1].lone = 0;
                var i2 = grid[i][j + 1].i;
                var j2 = grid[i][j + 1].j;
                strokeWeight(1);
                stroke(0);
                line(i * w + w / 2, j * h + h / 2, i2 * w + w / 2, j2 * h + h / 2);
            }
            /*if (i < cols - 1 && j < rows - 1 && grid[i + 1][j].wall && grid[i][j + 1].wall && grid[i + 1][j + 1].wall) {
                this.lone = 0; grid[i + 1][j].lone = 0; grid[i][j + 1].lone = 0; grid[i + 1][j + 1].lone = 0;
                var i2 = grid[i + 1][j + 1].i;
                var j2 = grid[i + 1][j + 1].j;
                strokeWeight(1);
                stroke(0);
                line(i * w + w / 2, j * h + h / 2, i2 * w + w / 2, j2 * h + h / 2);
                line(i2 * w + w / 2, j * h + h / 2, i * w + w / 2, j2 * h + h / 2);
            }*/
        }
    }
}

function genMaze() { // Wilson's algorithm for uniform random maze
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            if (i % 2 == 0 || j % 2 == 0) grid[i][j].wall = true;
            else grid[i][j].wall = false;
        }
    }
    var ncols = Math.floor(cols / 2);
    var nrows = Math.floor(rows / 2);
    var vis = [];
    for (var i = 0; i < ncols; i++) vis[i] = [];
    for (var i = 0; i < ncols; i++) {
        for (var j = 0; j < nrows; j++) {
            vis[i][j] = false;
        }
    }
    vis[0][nrows - 1] = true;
    while (true) {
        var x = -1, y = -1, px = 0, py = 0;
        for (var i = 0; i < ncols; i++) {
            for (var j = 0; j < nrows; j++) {
                if (!vis[i][j]) [x, y] = [i, j];
            }
        }
        if (x < 0) break;
        var curpath = [];
        let check = (Path, A) => {
            for (var i = 0; i < Path.length; i++) {
                if (Path[i][0] === A[0] && Path[i][1] === A[1]) return true;
            }
            return false;
        }
        while (!vis[x][y]) {
            while (check(curpath, [x, y])) curpath.pop();
            curpath.push([x, y]);
            var nx, ny;
            do {
                var rng = random(1);
                if (rng < 0.25) nx = x + 1, ny = y;
                else if (rng < 0.5) nx = x - 1, ny = y;
                else if (rng < 0.75) ny = y + 1, nx = x;
                else ny = y - 1, nx = x;
            } while (nx < 0 || ny < 0 || nx >= ncols || ny >= nrows || (nx === px && ny === py));
            [px, py] = [x, y];
            [x, y] = [nx, ny];
        }
        curpath.push([x, y]);
        for (var i = 0; i < curpath.length; i++) vis[curpath[i][0]][curpath[i][1]] = true;
        for (var i = 1; i < curpath.length; i++) {
            var x1 = curpath[i][0], x2 = curpath[i - 1][0];
            var y1 = curpath[i][1], y2 = curpath[i - 1][1];
            if (x1 > x2) [x1, x2] = [x2, x1];
            if (y1 > y2) [y1, y2] = [y2, y1];
            if (x1 < x2) grid[x1 * 2 + 2][y1 * 2 + 1].wall = false;
            else grid[x1 * 2 + 1][y1 * 2 + 2].wall = false;
        }
    }
    start.wall = false;
    end.wall = false;
}

function setup() {
    createCanvas(600, 750);
    let runButton = createButton('Run!');
    runButton.position(5, 600);
    runButton.mousePressed(() => {
        if (begin) return;
        console.log("Running A* algorithm...");
        start.wall = false;
        end.wall = false;
        begin = true;
        beginTime = millis();
    });

    let restartButton = createButton('Restart');
    restartButton.position(537, 600);
    restartButton.mousePressed(() => {
        if (!begin) return;
        console.log("Restarting A* algorithm...");
        setup();
    });

    let helpButton = createButton('Help');
    helpButton.position(5, 625);
    helpButton.mousePressed(() => {
        if (!begin) help = !help;
    });

    let mazeButton = createButton('Maze!');
    mazeButton.position(543.5, 625);
    mazeButton.mousePressed(() => {
        if (!begin) genMaze();
    });

    openSet = [];
    closedSet = [];
    path = [];
    begin = false;
    done = false;

    console.log("Welcome to the A* visualization game!\n\n" +
        "To begin playing, simply left-click and drag to create walls, and right-click to delete them.\n\n" +
        "When you are ready, press any key to start watching the algorithm solve your maze!\n\n" +
        "At the end, you will receive a score proportional to the time taken to solve your maze.\n\n" +
        "Be careful though, if your maze has no solution, you will receive a score of 0!\n\n" +
        "Good luck!");

    w = 600 / cols;
    h = 600 / rows;
    r = w;

    for (var i = 0; i < cols; i++) grid[i] = new Array(rows);
    
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j] = new Spot(i, j);
        }
    }
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j].addNeighbors(grid);
        }
    }

    start = grid[0][rows - 1];
    end = grid[cols - 1][0];
    previous = start;
    start.wall = false;
    end.wall = false;

    openSet.push(start);
}

function heuristic(a, b) { //when heuristic(a, b) = 0, A* becomes Dijkstra's algorithm
    return dist(a.i, a.j, b.i, b.j); //Euclidean distance
}

function showGrid() {
    for (var i = 0; i < cols; i++) for (var j = 0; j < rows; j++) grid[i][j].lone = 1;
    for (var i = 0; i < cols; i++) for (var j = 0; j < rows; j++) grid[i][j].connectWalls(grid);
    for (var i = 0; i < cols; i++) for (var j = 0; j < rows; j++) grid[i][j].show();
}

function showPath(endpoint) {
    path = [];
    var temp = endpoint;
    path.push(temp);
    while (temp.prev) {
        path.push(temp.prev);
        temp = temp.prev;
    }
    for (var i = 1; i < path.length; i++) {
        var i1 = path[i].i;
        var j1 = path[i].j;
        var i2 = path[i - 1].i;
        var j2 = path[i - 1].j;
        strokeWeight(2); //change to 4 for thicker version
        strokeCap(ROUND);
        stroke(color(252, 3, 211));
        line(i1 * w + w / 2, j1 * h + h / 2, i2 * w + w / 2, j2 * h + h / 2);
    }
}

function showScore() {
    stroke(0);
    strokeWeight(1);
    textSize(18);
    textFont('Courier New');
    text("Your score is: " + finalScore, 220, 616);
    text("High score: " + highScore, 220, 640);
}

function draw() {
    background(255);
    if (!begin && help) {
        stroke(0);
        strokeWeight(0.5);
        textSize(10);
        textFont('Courier New');
        text("Welcome to the A* visualization game! " +
        "To begin playing, simply left-click and drag to create walls or right-click to delete them. " +
        "When you are ready, press any key to start watching the algorithm solve your maze! " +
        "At the end, you will receive a score proportional to the time taken to solve your maze. " +
        "Be careful though, if your maze has no solution, you will receive a score of 0! Good luck!", 62, 605, 485, 700);
    }
    if (begin && !done) {
        if (openSet.length > 0) {
            var id = 0;
            for (var i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[id].f) id = i;
            }
            current = openSet[id];
            previous = current;
            if (current === end) {
                done = true;
                console.log("DONE!");
                var score = (millis() - beginTime) / 100;
                console.log("Your score is: " + round(score));
                finalScore = round(score);
                highScore = Math.max(highScore, finalScore);
            }
            removeFromArray(openSet, current);
            closedSet.push(current);
            var nxts = current.neighbors;
            for (var i = 0; i < nxts.length; i++) {
                var nxt = nxts[i];
                if (!closedSet.includes(nxt) && !nxt.wall) {
                    var tmpg = current.g + current.dist[i];
                    var newPath = false;
                    if (openSet.includes(nxt)) {
                        if (tmpg < nxt.g) {
                            nxt.g = tmpg;
                            newPath = true;
                        }
                    } else {
                        nxt.g = tmpg;
                        newPath = true;
                        openSet.push(nxt);
                    }
                    if (newPath) {
                        nxt.h = heuristic(nxt, end);
                        nxt.f = nxt.g + nxt.h;
                        nxt.prev = current;
                    }
                }
            }
        } else {
            done = true;
            console.log("No Solution!");
            console.log("Your score is: 0");
            finalScore = 0;
            showGrid();
            current = previous;
            showPath(current);
            showScore();
            return;
        }
    }
    if (!begin && mouseIsPressed) {
        if (mouseButton === LEFT) {
            var i = floor(mouseX / w);
            var j = floor(mouseY / h);
            if (0 < i && i < cols - 1 && 0 < j && j < rows - 1) grid[i][j].wall = 1;
        } else if (mouseButton === RIGHT) {
            var i = floor(mouseX / w);
            var j = floor(mouseY / h);
            if (0 < i && i < cols - 1 && 0 < j && j < rows - 1) grid[i][j].wall = 0;
        }
    }
    showGrid();
    if (begin) showPath(current);
    if (done) showScore();
}