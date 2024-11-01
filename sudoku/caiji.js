const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const HttpsProxyAgent = require('https-proxy-agent');

// 创建数据库连接
const db = new sqlite3.Database('sudoku.db');

// 创建表格
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS puzzles (id INTEGER PRIMARY KEY AUTOINCREMENT, puzzle TEXT UNIQUE, zero_count INTEGER)');
    db.run('CREATE INDEX IF NOT EXISTS idx_puzzle ON puzzles (puzzle)');
});

// 从URL获取HTML并解析
async function getPuzzleFromUrl(url) {
    try {
        const agent = new HttpsProxyAgent('http://192.168.3.88:1081');

        const response = await axios.get(url, {httpsAgent : agent});
        const $ = cheerio.load(response.data);
        const puzzleCells = $('#puzzle_grid input');
        let puzzleString = '';
        puzzleCells.each((index, element) => {
            puzzleString += $(element).val() || '0';
        });
        //console.log(response)
        return puzzleString;
    } catch (error) {
        console.error('Error fetching puzzle:', error);
        return null;
    }
}

// 插入puzzle到数据库
async function insertPuzzleIntoDB(puzzle) {
    // 计算puzzle中0的个数
    const zeroCount = puzzle.split('').filter(char => char === '0').length;
    console.log(zeroCount, puzzle)
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO puzzles (puzzle, zero_count) VALUES (?,?)', [puzzle, zeroCount], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

// 主函数
async function main() {
    const url = 'https://east.websudoku.com/?level=4';
    const puzzlesToFetch = 50000; // 修改为你想要抓取的谜题数量
    if (process.argv.includes('--out')) {
        exportDatabaseAsJSON();
        return;
    }
    for (let i = 0; i < puzzlesToFetch; i++) {
        const puzzle = await getPuzzleFromUrl(url);
        if (puzzle) {
            try {
                const puzzleId = await insertPuzzleIntoDB(puzzle);
                console.log(`Puzzle ${puzzleId} inserted into database.`);
            } catch (error) {
                console.error('Error inserting puzzle into database:', error);
            }
        } else {
            console.log('Failed to fetch puzzle from URL.');
        }

    }

    db.close();
}

// Function to export database content as JSON
function exportDatabaseAsJSON() {
    db.all('SELECT * FROM puzzles', (err, rows) => {
        if (err) {
            console.error('Error querying database:', err);
            return;
        }

        const jsonData = JSON.stringify(rows, null, 2);

        fs.writeFile('puzzles.json', jsonData, (err) => {
            if (err) {
                console.error('Error writing JSON file:', err);
                return;
            }
            console.log('Database content exported as JSON to puzzles.json');
        });
    });
}

main();
