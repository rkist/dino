var game = (function(document) {
    'use strict';

    var canvas = document.getElementsByClassName('runner-canvas')[0];
    var ctx = canvas.getContext('2d');

    // constants
    var C = {
        // pixels
        blankPixel: {r: 0, g: 0, b: 0, a: 0},
        blackPixel: {r: 83, g: 83, b: 83, a: 255},
        dinoEyeColor: {r: 255, g: 255, b: 255, a: 255},

        // moves
        mJump: 'M_JUMP',
        mDuck: 'M_DUCK',

        // states
        stateAirbone: 'S_AIRBONE',
        stateGround: 'S_GROUND',
        stateDuck: 'S_DUCK',

        // dimensions
        width: canvas.width,
        height: canvas.height,

        // reference positions
        groundY: 131,
        dinoEndX: 70,

        // position of dino eye in running state
        dinoEyeX: 51,
        dinoEyeY: 98,

        // position of dino eye in duck state
        dinoDuckEyeX: 68,
        dinoDuckEyeY: 116,

        // position to look for birds in
        midBirdX: 75 + 5,
        midBirdY: 98 - 10,

        // interval between bot function runs
        runIntervalMs: 50,

        // look ahead configurations
        lookAheadX: 70 + 5,
        lookAheadY: 131 - 10,
    };

    // game logic
    var runIntervalId = -1;
    var currentDinoState = C.stateGround;
    var currentTime = 0;
    var noDangerCounter = 0;
    function run() 
    {
        var i;

        if (runIntervalId == -1) 
        {
            runIntervalId = setInterval(run, C.runIntervalMs);
        }

        var currentLookAheadBuffer = getLookAheadBuffer(currentTime);
        var currentBirdLookAheadBuffer = getLookAheadBufferBird(currentTime);

        var imageData = ctx.getImageData(0, 0, C.width, C.height);

        var eyePixel = getPixel(imageData, C.dinoEyeX, C.dinoEyeY);
        var eyePixelDuck = getPixel(imageData, C.dinoDuckEyeX, C.dinoDuckEyeY);

        if (isPixelEqual(eyePixel, C.dinoEyeColor)) 
        {
            currentDinoState = C.stateGround;
        } 
        else if (isPixelEqual(eyePixelDuck, C.dinoEyeColor)) 
        {
            currentDinoState = C.stateDuck;
        } 
        else 
        {
            currentDinoState = C.stateAirbone;
        }

        var lookforwardDanger = false;
        for (i = 0; i < currentLookAheadBuffer; i += 2) 
        {
            if (isPixelEqual(getPixel(imageData, C.lookAheadX + i, C.lookAheadY), C.blackPixel)) 
            {
                lookforwardDanger = true;
                break;
            }
        }

        // watch for birds in mid level
        var birdDanger = false;
        for (i = C.midBirdX; i < C.midBirdX + currentBirdLookAheadBuffer; i += 2) 
        {
            if (isPixelEqual(getPixel(imageData, i, C.midBirdY), C.blackPixel)) 
            {
                birdDanger = true;
                break;
            }
        }

        if (currentDinoState === C.stateGround) 
        {
            // if dino on ground, scan ahead to see if there are obstacles. If there are jump
            if (lookforwardDanger)
            {
                issueMove(C.mJump);
                console.log('JUMP!');
                noDangerCounter = 0;
            }
            else if (birdDanger) 
            {
                issueMove(C.mDuck, 400);
                console.log('DUCK!');
                noDangerCounter = 0;
            }
        }
        currentTime += C.runIntervalMs;
        noDangerCounter += 1;

        if (noDangerCounter > 100)
        {
            console.log('Restarting!');
        }

        if (noDangerCounter > 200)
        {
            restart();
            currentTime = 0;
            noDangerCounter = 0;
        }

//         console.log
//         ({
//             currentDinoState: currentDinoState,
//             lookForwardDanger: lookforwardDanger,
//             birdDanger: birdDanger,
//             currentTime: currentTime,
//             lookAheadBuffer: currentLookAheadBuffer,
//             birdLookAhead: currentBirdLookAheadBuffer,
//         });
    }

    function restart() 
    {
       var timeout = 200;

        issueKeyPress('keydown', 53);
        setTimeout(function() {issueKeyPress('keyup', 53);}, timeout);

        issueKeyPress('keydown', 38);
        setTimeout(function() {issueKeyPress('keyup', 38);}, timeout);
    }

    /**
     * Given a move and an optional timeout, execute the
     * move by issuing required keystrokes
     *
     * @param move the state to move to from Constants
     * @param timeout optional value for how long to keep the button pressed
     */
    function issueMove(move, timeout) 
    {
        switch (move) 
        {
            case C.mJump:
                if (!timeout) 
                {
                    timeout = 85;
                }

                issueKeyPress('keydown', 38);
                setTimeout(function() { issueKeyPress('keyup', 38);}, timeout);
                break;

            case C.mDuck:
                if (!timeout) 
                {
                    timeout = 200;
                }

                issueKeyPress('keydown', 40);
                setTimeout(function() {issueKeyPress('keyup', 40);}, timeout);
                break;

            default:
                console.log('Invalid move ' + move);
        }
    }

    /**
     * Given the current time return the distance to look
     * ahead for. This changes with time as the dino goes
     * faster it helps to look further. As you've to jump
     * earlier to cross obstacles.
     *
     * @param time the current in game time
     * @return number of look ahead pixels
     */
    function getLookAheadBuffer(time) 
    {
        if (time < 40000) 
        {
            return 62;
        } 
        else if (time < 60000)
        {
            return 92;
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

    /**
     * Given the current game time return the look ahead
     * pixels for birds
     * 
     * @param time current in game time
     * @return number of pixels to look ahead for birds
     */
    function getLookAheadBufferBird(time) 
    {
        if (time < 50000) 
        {
            return 50;
        }

        return 70;
    }

    /**
     * Helper which given an event type and a key code
     * dispatches this event
     */
    function issueKeyPress(type, keycode) 
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

    /**
     * Given an image data array from a canvas and an x and y
     * position, return an object representing the pixel 
     * at the given point. The x and y values must be 
     * within bounds
     */
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

    /**
     * Given two standard pixel objects check for their
     * equality
     */
    function isPixelEqual(p1, p2) 
    {
        return p1.r === p2.r &&
            p1.g === p2.g &&
            p1.b === p2.b &&
            p1.a === p2.a;
    }

    // exports
    return { run: run };

})(document)

game.run();
