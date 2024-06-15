export const QUERIES = {
    create: `
        CREATE TABLE boards (id INT PRIMARY KEY, date DATE, width INT, height INT, solution TEXT, letters TEXT);

        CREATE TABLE suggestion (id INT PRIMARY KEY, date DATE, word TEXT, suggestion TEXT, status TEXT);
    `,
    boards: 'SELECT * FROM boards',
    boardByDate: 'SELECT * FROM boards WHERE date = @date AND width = @width AND height = @height LIMIT 1',
    insertBoard:
        'INSERT INTO boards (date, width, height, solution, letters) VALUES (@date, @width, @height, @solution, @letters)',
    insertSuggestion: `INSERT INTO suggestion (word, suggestion, status, date) VALUES (@word, @suggestion, @status, date('now'))`,
    getPendingSuggestions: `SELECT count(*) count, suggestion, word, status, min(date) first_suggested, max(date) last_suggested FROM SUGGESTION WHERE status = 'pending' GROUP BY word, suggestion ORDER BY COUNT DESC;`,
} as const
