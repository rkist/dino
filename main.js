const mJump = 'M_JUMP';
const mDuck = 'M_DUCK';
const mRun = 'M_RUN';

//TODO: estabelecer uma relacao entre movimentos e acoes melhor do que esses const
//TODO: interfacear com outros players

function Control()
{
	function Move(move) 
    {    	
        switch (move) 
        {
            case mJump:      
				var timeout = 90;			
                PressKey(38, timeout)
                console.log('Jump!');
                break;

            case mDuck:            	
                timeout = 400;
                PressKey(40, timeout)
                console.log('Duck!');
                break;
            case mRun:
            	break;

            default:
                console.log('Invalid move ' + move);
        }
    }
	
	function PressKey(key, timeout) 
    {
		keyPress('keydown', key);
		setTimeout(function() {keyPress('keyup', key);}, timeout);
    }
	
	function keyPress(type, keycode) 
    {
        var eventObj = document.createEventObject ?
            document.createEventObject() : document.createEvent("Events");

        if(eventObj.initEvent)
        {
            eventObj.initEvent(type, true, true);
        }

        eventObj.keyCode = keycode;
        eventObj.which = keycode;

        document.dispatchEvent ? document.dispatchEvent(eventObj) : el.fireEvent("onkeydown", eventObj);
    }
	
	// exports
    return { Move: Move, PressKey : PressKey };
}

function DumbPlayer(canvas)
{
    var playerNumber = 0;
    var bestScore = 0;

    var ctx = canvas.getContext('2d');	

    var C = {
        // dimensions
        width: canvas.width,
        height: canvas.height,

        // pixels
        blankPixel: { r: 0, g: 0, b: 0, a: 0 },
        blackPixel: { r: 83, g: 83, b: 83, a: 255 },

        // reference positions
        groundY: 131,
        dinoEndX: 70,

        // position to look for birds in
        midBirdX: 75 + 5,
        midBirdY: 98 - 10,

        // look ahead configurations
        lookAheadX: 70 + 5,
        lookAheadY: 131 - 10,
    };

    function DecideAction(elapsedTime)
    {
        var imageData = ctx.getImageData(0, 0, C.width, C.height);

        var currentLookAheadBuffer = getLookAheadBuffer(elapsedTime);
        var currentBirdLookAheadBuffer = getLookAheadBufferBird(elapsedTime);

        var i;

        for (i = 0; i < currentLookAheadBuffer; i += 2)
        {
            if (isPixelEqual(getPixel(imageData, C.lookAheadX + i, C.lookAheadY), C.blackPixel))
            {
                return mJump;
            }
        }

        // watch for birds in mid level
        for (i = C.midBirdX; i < C.midBirdX + currentBirdLookAheadBuffer; i += 2)
        {
            if (isPixelEqual(getPixel(imageData, i, C.midBirdY), C.blackPixel))
            {
                return mDuck;
            }
        }

        return mRun;
    }

    function Score(points)
    {
        console.log("Player #" + playerNumber);
        console.log("Score: " + points);

        if (points > bestScore)
        {
            bestScore = points;
            console.log("New best score!");
        }

        console.log("Best score: " + bestScore);

        playerNumber += 1;
    }

    function getPixel(imgData, x, y) 
    {
        var dataStart = (x + y * C.width) * 4;

        return {
            r: imgData.data[dataStart],
            g: imgData.data[dataStart + 1],
            b: imgData.data[dataStart + 2],
            a: imgData.data[dataStart + 3]
        };
    }

    function isPixelEqual(p1, p2) 
    {
        return p1.r === p2.r &&
            p1.g === p2.g &&
            p1.b === p2.b &&
            p1.a === p2.a;
    }

    function getLookAheadBuffer(time)
    {
        if (time < 40000)
        {
            return 52;
        }
        else if (time < 60000) 
        {
            return 84;
        }
        else if (time < 70000) 
        {
            return 110;
        }
        else if (time < 85000) 
        {
            return 120;
        }
        else if (time < 100000) 
        {
            return 135;
        }
        else if (time < 115000) 
        {
            return 150;
        }
        else if (time < 140000)
        {
            return 180;
        }
        else if (time < 170000)
        {
            return 190;
        }

        return 190;
    }

    function getLookAheadBufferBird(time)
    {
        if (time < 50000) 
        {
            return 50;
        }

        return 70;
    }

    return { DecideAction: DecideAction, Score: Score };
}

function Game(control, player) 
{
    'use strict';
	
    var runIntervalMs = 30;

    // game logic
    var currentTime = 0;
    var noDangerCounter = 0;
	
	function Start()
	{
		console.log('Start!');
		return setInterval(Run, runIntervalMs);
	}
	
    function Run() 
    {      
        var action = player.DecideAction(currentTime);
        
        control.Move(action);
        
        if (action == mRun)
		{

		}
		else
		{
			noDangerCounter = 0;
		}
		
			
        currentTime += runIntervalMs;
        noDangerCounter += 1;

        if (noDangerCounter > 250)
        {
            //console.log(currentTime);
            console.log('Restart!');

            player.Score(currentTime);
            Restart();

            currentTime = 0;
            noDangerCounter = 0;
        }
    }

    function Restart() 
    {
		var timeout = 200;

		control.PressKey(53, timeout);
		control.PressKey(38, timeout);
    }

    // exports
    return { Start: Start };
}

var canvas = document.getElementsByClassName('runner-canvas')[0];
var control = Control();
var player = DumbPlayer(canvas);

var game = Game(control, player);
game.Start();