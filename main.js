let board = [];
let activePiece = undefined;
let clicks = [];

let moves = [];

let canPlay = false;
let turn = 1;

let mode = "local";

/**
 *  Gets the legal moves of a given board index
 * @param index The index for which to lookup legal moves
 * @returns {int[]} An array of positions the piece can move to
*/
function getLegalMoves(index) {
    if (index === undefined) {
        return [];
    }

    let legalMoves = [];

    let piece = board[index];
    let white = isWhite(piece);
    if ((white && (turn % 2) !== 1) || (!white && (turn % 2 === 1))) {
        return legalMoves;
    }

    piece = piece.toUpperCase();

    if (piece === 'R' || piece === 'Q' || piece === 'K') {
        // Rooks & queens & kings
        let tests = [
            [f => f >= 0, f => f - 8], // forward
            [f => f < 64, f => f + 8], // backward
            [f => f > (Math.floor(index / 8) * 8 - 1), f => f - 1], // left
            [f => f < (Math.floor(index / 8) * 8 + 8), f => f + 1], // right
        ]

        tests.forEach(([test, calc]) => {
            let x = calc(index);
            while (test(x)) {
                if (board[x] === '') {
                    legalMoves.push(x);
                } else {
                    if (isWhite(board[x]) != white) {
                        legalMoves.push(x);
                    }
                    break;
                }
                if (piece === 'K') {
                    break;
                }
                x = calc(x);
            }
        })
        // TODO: castling
    }
    if (piece === 'N') {
        // Knights
        if (index > 15 && index % 8 > 0 && (board[index - 17] === '' || (isWhite(board[index - 17]) != white))) {
            legalMoves.push(index - 17);
        }
        if (index > 15 && index % 8 < 7 && (board[index - 15] === '' || (isWhite(board[index - 15]) != white))) {
            legalMoves.push(index - 15);
        }
        if (index > 7 && index % 8 > 1 && (board[index - 10] === '' || (isWhite(board[index - 10]) != white))) {
            legalMoves.push(index - 10);
        }
        if (index > 7 && index % 8 < 6 && (board[index - 6] === '' || (isWhite(board[index - 6]) != white))) {
            legalMoves.push(index - 6);
        }
        if (index < 55 && index % 8 > 1 && (board[index + 6] === '' || (isWhite(board[index + 6]) != white))) {
            legalMoves.push(index + 6);
        }
        if (index < 55 && index % 8 < 6 && (board[index + 10] === '' || (isWhite(board[index + 10]) != white))) {
            legalMoves.push(index + 10);
        }
        if (index < 47 && index % 8 > 0 && (board[index + 15] === '' || (isWhite(board[index + 15]) != white))) {
            legalMoves.push(index + 15);
        }
        if (index < 47 && index % 8 < 7 && (board[index + 17] === '' || (isWhite(board[index + 17]) != white))) {
            legalMoves.push(index + 17);
        }

    }
    if (piece === 'B' || piece === 'Q' || piece === 'K') {
        // Bishops & queens & kings
        let tests = [
            [f => f % 8 < index % 8, f => f - 9], // left-forward
            [f => f % 8 > index % 8, f => f - 7], // right-forward
            [f => f % 8 < index % 8, f => f + 7], // left-backward
            [f => f % 8 > index % 8, f => f + 9], // right-backward
        ];

        tests.forEach(([test, calc]) => {
            let x = calc(index);
            while (test(x) && x >= 0 && x < 64) {
                if (board[x] === '') {
                    legalMoves.push(x);
                } else {
                    if (isWhite(board[x]) != white) {
                        legalMoves.push(x);
                    }
                    break;
                }
                if (piece === 'K') {
                    break;
                }
                x = calc(x);
            }
        });

    }
    if (piece === 'K') {
        // Castling
        let base = 4 + (white ? 56 : 0);
        if (moves.filter(([i, _]) => i === base).length === 0) {
            // TODO: Check for checks
            // Queenside castle
            if (
                moves.filter(([i, _]) => i === (base - 4)).length === 0 &&
                board[base - 3] === '' &&
                board[base - 2] === '' &&
                board[base - 1] === ''
            ) {
                legalMoves.push(base - 2);
            }

            // Kingside castle
            if (
                moves.filter(([i, _]) => i === (base + 3)).length === 0 &&
                board[base + 1] === '' &&
                board[base + 2] === ''
            ) {
                legalMoves.push(base + 2);
            }
        }
    }
    if (white) {
        if (piece === 'P') {
            // We can move forward one space if there is no other piece there.
            if (board[index - 8] === '') {
                legalMoves.push(index - 8);
            }
            // If this is the starting position, we can move two forward
            if (index > 47 && board[index - 8] === '' && board[index - 16] === '') {
                legalMoves.push(index - 16);
            }
            // We can capture diagonally forward one position
            if (index % 8 > 0 && board[index - 9] && !isWhite(board[index - 9])) {
                legalMoves.push(index - 9);
            }
            if (index % 8 < 7 && board[index - 7] && !isWhite(board[index - 7])) {
                legalMoves.push(index - 7);
            }
            // En passant
            if (Math.floor(index / 8) === 3 &&
                board[moves[moves.length - 1][1]] === 'p' &&
                Math.floor(moves[moves.length - 1][0] / 8) === 1 &&
                Math.floor(moves[moves.length - 1][1] / 8) === 3 &&
                Math.abs(moves[moves.length - 1][1] % 8 - index % 8) === 1) {
                legalMoves.push(moves[moves.length - 1][1] - 8);
            }
        }
    } else {
        if (piece === 'P') {
            // We can move forward one space if there is no other piece there.
            if (board[index + 8] === '') {
                legalMoves.push(index + 8);
            }
            // If this is the starting position, we can move two forward
            if (index < 16 && board[index + 8] === '' && board[index + 16] === '') {
                legalMoves.push(index + 16);
            }
            // We can capture diagonally forward one position
            if (index % 8 < 7 && isWhite(board[index + 9])) {
                legalMoves.push(index + 9);
            }
            if (index % 8 > 0 && isWhite(board[index + 7])) {
                legalMoves.push(index + 7);
            }
            // En passant
            if (Math.floor(index / 8) === 4 &&
                board[moves[moves.length - 1][1]] === 'P' &&
                Math.floor(moves[moves.length - 1][0] / 8) === 6 &&
                Math.floor(moves[moves.length - 1][1] / 8) === 4 &&
                Math.abs(moves[moves.length - 1][1] % 8 - index % 8) === 1) {
                legalMoves.push(moves[moves.length - 1][1] + 8);
            }
        }

    }

    return legalMoves;
}


function isWhite(piece) {
    return /^[A-Z]$/.test(piece);
}


function setupGame() {
    for (let i = 0; i < 4; i++) {
        let click = new Audio(`sounds/click_${i + 1}.mp3`);
        clicks.push(click);
    }

    resetBoard();
}

function setMode(element) {
    mode = element.value;
}

function renderGame() {
    clearBoard();
    let legalMoves = getLegalMoves(activePiece);
    board.forEach((square, index) => {
        if (square != '') {
            let piecesrc = `pieces/${square}${isWhite(square) ? '' : '_'}.png`;
            $(".board").children().eq(index)
                .append(`<image src="${piecesrc}"/>`)
        }
    });
    legalMoves.forEach((i) =>
        $(".board").children().eq(i)
            .append(`<image src="dot.png""/>`)
    );
    moves.forEach((move, index) =>
        $(".moves").append(`<div>${move}</div>`)
    )
}

function clearBoard() {
    $(".board").children().empty();
    $(".moves").empty();
}

function resetBoard() {
    board = [
        'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r',
        'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P',
        'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'
    ]

    moves = [];
    renderGame();
    canPlay = true;
}

// TODO: redo as movepiece
function replayGame() {
    let oldMoves = [...moves];
    resetBoard();
    canPlay = false;
    activePiece = undefined;
    let sleepTime = 700;


    oldMoves.forEach(([i, j], index) => {
        setTimeout(
            () => {
                movePiece(i, j);
                renderGame();
            },
            sleepTime * (index + 1)
        );
    });

    setTimeout(() => canPlay = true, sleepTime * (oldMoves.length + 1) + 100);
}


function movePiece(i, j) {
    let previousMove = moves[moves.length - 1] || [0, 0];
    let takes = false;
    if (board[i] === 'P' &&
        board[previousMove[1]] === 'p' &&
        j === previousMove[1] - 8 &&
        Math.floor(previousMove[0] / 8) === 1 &&
        Math.floor(previousMove[1] / 8) === 3
    ) {
        board[j + 8] = '';
        takes = true;
    } else if (board[i] === 'p' &&
        board[previousMove[1]] === 'P' &&
        j === previousMove[1] + 8 &&
        Math.floor(previousMove[0] / 8) === 6 &&
        Math.floor(previousMove[1] / 8) === 4
    ) {
        board[j - 8] = '';
        takes = true;
    }

    // Check for castling
    if (board[i].toUpperCase() === 'K') {
        if (i - j === 2) {
            board[i - 1] = board[i - 4];
            board[i - 4] = '';
        } else if (j - i === 2) {
            board[i + 1] = board[i + 3];
            board[i + 3] = '';
        }
    }

    // Make the move
    takes = takes || (board[j] != '');
    [board[i], board[j]] = ['', board[i]];
    moves.push([i, j]);
    turn++;
    if (takes) {
        // Play take sound
        // TODO: create take sound
        clicks[Math.floor(Math.random() * clicks.length)].play();
    } else {
        // Play move sound
        clicks[Math.floor(Math.random() * clicks.length)].play();
    }
}

/**
 * Handles game clicks
 * @param {number} i The clicked square
 * @param {boolean} store Wether to store the move
 */
function clickSquare(i) {
    if (!canPlay) {
        return;
    }

    if (activePiece === undefined) {
        if (board[i] !== '') {
            activePiece = i;
        }
    } else {
        // Check if this move is legal
        if (getLegalMoves(activePiece).includes(i)) {
            // Move the piece
            movePiece(activePiece, i);

            // Do the bot move
            if (mode != "online" && mode != "local") {
                canPlay = false;
                // Make a bot move
                setTimeout(() => {
                    doBotMove();
                    renderGame();
                    canPlay = true;
                }, 1000);
            }
        } else if (board[i] !== '') {
            activePiece = i;
        } else {
            // Deselect the piece
            activePiece = undefined;
        }
    }

    renderGame();
}

function doBotMove() {
    switch (mode) {
        case "local":
        case "online":
            console.log("Can't do a bot move for a multiplayer mode!");
            break;
        case "random":
            doRandomMove();
            break;
        default:
            doRandomMove();
            break;
    }
}

function doRandomMove() {
    let moves = {};
    for (let i = 0; i < 64; i++) {
        if (board[i] === "") {
            continue;
        }
        let lm = getLegalMoves(i);
        if (!lm || lm.length === 0) {
            continue;
        }
        moves[i] = lm;
    }
    console.log(moves);

    let start = Object.keys(moves);
    start = start[Math.floor(Math.random() * start.length)];
    end = moves[start][Math.floor(Math.random() * moves[start].length)];

    console.log(`Chosen move: ${start} to ${end}`);

    movePiece(start, end);
}

$(document).ready(function () {
    // Populate the board
    let i = 0;
    while (i < 64) {
        let polarity = ((i + (Math.floor(i / 8) % 2 == 0 ? 1 : 0)) % 2 === 0) ? 'even' : 'odd';
        $(".board").append(`<div class='square ${polarity}' onclick=clickSquare(${i})></div>`);
        i += 1;
    }

    setupGame();
});