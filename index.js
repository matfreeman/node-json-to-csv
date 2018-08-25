const fs = require('fs');
const JSONStream = require('JSONStream');

const FILE_PATH = './example/file.json';
const ROWSTR = 'rows'
const OUTFILE = 'output/file.csv';

function uniqueHeaders(row, currentHeaders) {
    let keys = Object.keys(row);
    return keys.filter(elem => !currentHeaders.includes(elem))
}

function cleanStr(str) {
    return str.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");
}

function process(file, headers = [], ROWSTR, OUTFILE, params = {}) {
    return new Promise((resolve, reject) => {
        let parser = JSONStream.parse([ROWSTR, true]);
        let stream = fs.createReadStream(file).pipe(parser);
        stream.on('data', (row) => {
            if (params.headers) {
                uniqueHeaders(row, headers).forEach(header => {
                    headers.push(header);
                });
            } 
            else {
                fs.writeFileSync(OUTFILE, cleanStr(Object.values(row).toString()) + '\n', {flag: 'a'});
            }
        })
        stream.on('end', () => {
            resolve(headers);
        })    
    });
}

process(FILE_PATH, [], ROWSTR, OUTFILE, {headers: true}).then((headers) => {
    fs.writeFileSync(OUTFILE, headers.toString() + '\n', {flag: 'w'});
    process(FILE_PATH, headers, ROWSTR, OUTFILE);
})