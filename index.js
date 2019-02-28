const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const LOCAL_PORT = 5000;
const PORT = process.env.PORT || LOCAL_PORT;
const { Client } = require('pg');

const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: PORT != LOCAL_PORT,
});

client.connect();

function shutDown() {
    client.end();
}

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

const upload = multer();

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('pages/index'));

app.post('/events', (req, res) => {
    const query = {
        text: 'INSERT INTO eventonica (title) VALUES ($1)',
        values: [req.body.title]
    }

    if (req.body.title) {
        client.query(query, (err) => {
            if (err) throw err;
        });
    }
    res.send();
});

app.get('/events', (req, res) => {
    client.query('SELECT id, title FROM eventonica', (err, result) => {
        if (err) throw err;
        const rows = [];
        for (let row of result.rows) {
            rows.push(row);
        }
        res.send(JSON.stringify(rows));
    });
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
