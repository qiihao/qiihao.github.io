(function (root) {
    var sd = root.sd = {};

    var DIFFICULTY = {
        "easy": 19,
        "medium": 28,
        "hard": 37,
        "very-hard": 46,
        "insane": 55,
        "inhuman": 64,
        "impossible": 73
    };

    // Sudoku solver
    sd.solve = function (board, max, rnd) {
        let p = {
            board: this.copyBoard(board),
            solutions: [],
            max: max ?? 20,
            nc: [9, 9, 9, 9, 9, 9, 9, 9, 9, 9],
            emptySpot: [],
            emptySpotIdx: 0,
            rnd: rnd ?? false,
        }

        board.forEach((row, rowIndex) =>
            row.forEach((num, colIndex) => {
                if (num !== 0) {
                    p.nc[num]--;
                } else {
                    p.emptySpot.push([rowIndex, colIndex]);
                }
            })
        );

        this.attemptSolve(p);
        return p.solutions;
    };

    sd.attemptSolve = function (p) {
        if (p.emptySpotIdx >= p.emptySpot.length) {
            p.solutions.push(this.copyBoard(p.board));
            return true; // All spots filled, puzzle solved
        }

        let [row, col] = p.emptySpot[p.emptySpotIdx++];
        let start = p.rnd ? Math.floor(Math.random() * 10) : 0;
        for (let i = 0; i < 9; i++) {
            let num = (start + i) % 9 + 1;
            if (--p.nc[num] >= 0 && this.isValid(p.board, row, col, num)) {
                p.board[row][col] = num;
                if (this.attemptSolve(p)) {
                    if (p.solutions.length >= p.max) {
                        p.nc[num]++;
                        return true;
                    }
                }
                p.board[row][col] = 0;
            }
            p.nc[num]++;
        }
        p.emptySpotIdx--;
        return false; // No valid number found
    };

    // 将输入的数独数据进行校验
    sd.check = function (base, r, c, num) {
        if (!this.isValid(base, r, c, num)) {
            return false;
        }

        var d = this.copyBoard(base);
        d[r][c] = num;

        return this.solve(d, 1).length > 0;
    };

    sd.isValid = function (board, row, col, num) {
        return (
            this.isRowValid(board, row, num) &&
            this.isColValid(board, col, num) &&
            this.isBoxValid(board, row - (row % 3), col - (col % 3), num)
        );
    };

    sd.isRowValid = function (board, row, num) {
        return board[row].every(colValue => colValue !== num);
    };

    sd.isColValid = function (board, col, num) {
        return board.every(row => row[col] !== num);
    };

    sd.isBoxValid = function (board, startRow, startCol, num) {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (board[row + startRow][col + startCol] === num) {
                    return false;
                }
            }
        }
        return true;
    };

    sd.copyBoard = function (board) {
        return board.map(row => row.slice());
    };

    sd.strToBoard = function (str) {
        return Array.from({ length: 9 }, (_, i) =>
            Array.from({ length: 9 }, (_, j) => parseInt(str[i * 9 + j]))
        );
    };

    sd.boardToStr = function (board) {
        return board.flatMap(row => row.join('')).join('');
    };

    sd.randomBoard = function () {
        let board = Array.from({ length: 9 }, () => Array(9).fill(0));
        let s = this.solve(board, 1, true);
        return s ? s[0] : nullptr;
    };

    sd.generate = function (difficulty) {
        if (typeof difficulty === "string" || typeof difficulty === "undefined") {
            difficulty = DIFFICULTY[difficulty] || DIFFICULTY.easy;
        }

        // generate a random board
        board = this.randomBoard();

        let grid = [...Array(81).keys()];
        let hole = 0;
        while (grid.length > 0) {
            // random dig
            let i = Math.floor(Math.random() * grid.length);
            let row = Math.floor(grid[i] / 9);
            let col = grid[i] % 9;
            grid.splice(i, 1);

            let num = board[row][col];
            board[row][col] = 0;
            hole++;

            // check
            let s = this.solve(board, 2, false);
            if (s && s.length == 1) { // only one solution
                if (hole >= difficulty) {
                    break;
                }
                continue;
            }

            // can not dig here
            board[row][col] = num;
            hole--;
        }
        return board;
    };
})(this);

var d = "900000701500010003040700000079000208050001974410002306700000100103007500004195637";
let b = this.sd.strToBoard(d);
let b2 = [];

var start = new Date();
for (var i = 0; i < 100; i++) {
    //this.sl.solveSudoku(b, 1, false);
    b2 = this.sd.generate('very-hard');
}
var end = new Date();
console.log(end - start);

console.log(this.sd.boardToStr(b2));
