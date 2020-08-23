let canvas;
let context;
let canvasX;
let canvasY;
let mouseX;
let mouseY;
let tileX = -1;
let tileY = -1;
let oldTileX;
let oldTileY;
let tileWidth;
let map;
let rand;

let mapSize = 20;

/**
 * Creates a pseudo-random value generator. The seed must be an integer.
 *
 * Uses an optimized version of the Park-Miller PRNG.
 * http://www.firstpr.com.au/dsp/rand31/
 */
function Random(seed) {
    this._seed = seed % 2147483647;
    if (this._seed <= 0) this._seed += 2147483646;
  }
  
  /**
   * Returns a pseudo-random value between 1 and 2^32 - 2.
   */
  Random.prototype.next = function () {
    return this._seed = this._seed * 16807 % 2147483647;
  };
  
  
  /**
   * Returns a pseudo-random floating point number in range [0, 1).
   */
  Random.prototype.nextFloat = function () {
    // We know that result of next() will be 1 to 2147483646 (inclusive).
    return (this.next() - 1) / 2147483646;
  };

  Random.prototype.nextInt = function (min, max) {
    return Math.floor(this.nextFloat() * (max - min) + min);
  };

document.body.onload = () => {
    canvas = document.getElementById("minesweeperCanvas");
    context = canvas.getContext('2d');
    tileWidth = context.canvas.width / mapSize;
    map = new Array(mapSize);
    for(let i = 0; i < mapSize; i++)
    {
        map[i] = new Array(mapSize);
        for(let j = 0; j < mapSize; j++)
        {
            map[i][j] = { revealed: false, flagged: false, mine: false };
        }
    }
    RandomizeSeed();
    rand = new Random(parseInt(document.getElementById("seed").value));
    for(let i = 0; i < 75; i++)
    {
        AddMine();
    }
    if (window.Event)
    {
        document.captureEvents(Event.MOUSEMOVE);
    }
    document.onmousemove = getCursorXY;
    document.oncontextmenu = rClick;
    //document.addEventListener("click", clickHandle);
    document.body.onclick = lClick;
    document.onkeydown = KeyPressed;
    DrawFunc();
};

function RandomizeSeed()
{
	let s = Math.floor(Math.random()*2140000000);
	document.getElementById("seed").value = s;
}

function KeyPressed(e)
{
    e = e || window.event;
    if(e.key == "z" || e.key == "d")
    {
        lClick(null);
    }
    else if(e.key == "x" || e.key == "f")
    {
        rClick(null);
    }
}

function AddMine()
{
    while(true)
    {
        let x = Math.floor(rand.nextFloat() * mapSize);
        let y = Math.floor(rand.nextFloat() * mapSize);
        if(!map[x][y].mine && (x >= 2 || y >= 2))
        {
            map[x][y].mine = true;
            break;
        }
    }
}

function Setup()
{
    mapSize = parseInt(document.getElementById("width").value);
    tileWidth = context.canvas.width / mapSize;
    map = new Array(mapSize);
    for(let i = 0; i < mapSize; i++)
    {
        map[i] = new Array(mapSize);
        for(let j = 0; j < mapSize; j++)
        {
            map[i][j] = { revealed: false, flagged: false, mine: false };
        }
    }
    rand = new Random(parseInt(document.getElementById("seed").value));
    let n = parseInt(document.getElementById("mineNumber").value);
    for(let i = 0; i < n; i++)
    {
        AddMine();
    }
    DrawFunc();
}

function DrawFunc()
{
    for(let i = 0; i < mapSize; i++)
    {
        for(let j = 0; j < mapSize; j++)
        {
            UpdateTile(i, j);
        }
    }
}

function UpdateTile(i, j)
{
    if(i < 0 || j < 0)
    {
        return;
    }
    if(!map[i][j].revealed)
    {
        if((i ^ j) & 1)
        {
            if(tileX == i && tileY == j)
            {
                context.fillStyle = "#92FF81";
            }
            else
            {
                context.fillStyle = "#23FF00";
            }
        }
        else
        {
            if(tileX == i && tileY == j)
            {
                context.fillStyle = "#32A121";
            }
            else
            {
                context.fillStyle = "#1BC200";
            }
        }
        context.fillRect(tileWidth * i, tileWidth * j, tileWidth, tileWidth);
        if(map[i][j].flagged)
        {
            context.fillStyle = "#FF0000";
            context.fillRect(tileWidth * (i + 0.25), tileWidth * (j + 0.25), tileWidth * 0.5, tileWidth * 0.5);
        }
    }
    else
    {
        if((i ^ j) & 1)
        {
            if(tileX == i && tileY == j)
            {
                context.fillStyle = "#DDDDDD";
            }
            else
            {
                context.fillStyle = "#CFCFCF";
            }
        }
        else
        {
            if(tileX == i && tileY == j)
            {
                context.fillStyle = "#C4C4C4";
            }
            else
            {
                context.fillStyle = "#BDBDBD";
            }
        }
        context.fillRect(tileWidth * i, tileWidth * j, tileWidth, tileWidth);
        let n = getSurroundingCount(i, j);
        context.textAlign = "center";
        context.textBaseline = "middle";
        if(n == 0)
        {
            return;
        }
        switch (n)
        {
            case 1:
                context.fillStyle = "#0070FF";
                break;
            case 2:
                context.fillStyle = "#1BC200";
                break;
            case 3:
                context.fillStyle = "#FF0070";
                break;
            case 4:
                context.fillStyle = "#8433B5";
                break;
            case 5:
                context.fillStyle = "#D6E128";
                break;
            case 6:
                context.fillStyle = "#E19828";
                break;
            case 7:
                context.fillStyle = "#E17428";
                break;
            case 8:
                context.fillStyle = "#F14522";
                break;
        }
        
        context.fillText(n + "", tileWidth * (i + 0.5), tileWidth * (j + 0.5));
    }
}

function getSurroundingCount(x, y)
{
    let n = 0;
    for(let i = x - 1; i <= x + 1; i++)
    {
        for(let j = y - 1; j <= y + 1; j++)
        {
            if(j >= 0 && j < mapSize && i >= 0 && i < mapSize && (i != x || j != y) && map[i][j].mine)
            {
                n++;
            }
        }
    }
    return n;
}

function isZero(x, y)
{
    for(let i = x - 1; i <= x + 1; i++)
    {
        for(let j = y - 1; j <= y + 1; j++)
        {
            if(j >= 0 && j < mapSize && i >= 0 && i < mapSize && (i != x || j != y) && map[i][j].mine)
            {
                return false;
            }
        }
    }
    return true;
}

function revealCell(x, y)
{
    if(map[x][y].revealed)
    {
        return;
    }
    if(map[x][y].mine)
    {
        lose();
        return;
    }
    map[x][y].revealed = true;
    map[x][y].flagged = false;
    if(isZero(x, y))
    {
        for(let i = x - 1; i <= x + 1; i++)
        {
            for(let j = y - 1; j <= y + 1; j++)
            {
                if(j >= 0 && j < mapSize && i >= 0 && i < mapSize)
                {
                    revealCell(i, j);
                }
            }
        }
    }
}

function getCursorXY(e)
{
	mouseX = (window.Event) ? e.pageX : event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
    mouseY = (window.Event) ? e.pageY : event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
    
    if(mouseX >= context.canvas.offsetLeft && (mouseX - context.canvas.offsetLeft) <= context.canvas.width && mouseY >= context.canvas.offsetTop && (mouseY - context.canvas.offsetTop) <= context.canvas.width)
    {
        oldTileX = tileX;
        oldTileY = tileY;
        tileX = Math.min(Math.floor((mouseX - context.canvas.offsetLeft) / tileWidth), mapSize - 1);
        tileY = Math.min(Math.floor((mouseY - context.canvas.offsetTop) / tileWidth), mapSize - 1);
        UpdateTile(tileX, tileY);
    }
    else
    {
        oldTileX = tileX;
        oldTileY = tileY;
        tileX = -1;
        tileY = -1;
    }
    UpdateTile(oldTileX, oldTileY);
}

function lClick(e)
{
    if(tileX < 0 || map[tileX][tileY].flagged)
    {
        return;
    }
    revealCell(tileX, tileY);
    DrawFunc();

    for(let i = 0; i < mapSize; i++)
    {
        for(let j = 0; j < mapSize; j++)
        {
            if(map[i][j].mine == map[i][j].revealed)
            {
                return;
            }
        }
    }
    win();
}

function rClick(e)
{
    if(tileX < 0 || map[tileX][tileY].revealed)
    {
        return false;
    }
    map[tileX][tileY].flagged = !map[tileX][tileY].flagged;
    UpdateTile(tileX, tileY);
    return false;
}

function lose()
{
    alert("oof");
    Setup();
}

function win()
{
    alert("yay!");
}

function JSONRequest(requestType, url, body, runMeSuccess, runMeFailure) {
    let request = new XMLHttpRequest();
    request.open(requestType, url, true);
    request.setRequestHeader("Content-Type", "application/json");
    request.onreadystatechange = () =>{
        if(request.readyState === 4){
            //callback
            if(request.status >= 200 && request.status < 300)
            {
                runMeSuccess(request.responseText);
            }
            else
            {
                runMeFailure(request.responseText);
            }
        }
    };
    if(requestType === "GET")
    {
        request.send();
    }
    else
    {
        request.send(body);
    }
}
