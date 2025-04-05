const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());

const dataFilePath = path.join(__dirname, 'data.json');

function readDataFromFile() {
    return new Promise((resolve, reject) => {
        fs.readFile(dataFilePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

function writeDataToFile(data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/jsonBlob', (req, res) => {
    readDataFromFile()
        .then(data => res.json(data))
        .catch(err => res.status(500).send('Error reading pet data.'));
});

app.put('/api/jsonBlob', (req, res) => {
    const newPet = req.body;

    newPet.id = Date.now().toString();

    readDataFromFile()
        .then(data => {
            data.push(newPet);
            return writeDataToFile(data);
        })
        .then(() => res.json({ message: 'Pet added successfully!', id: newPet.id }))
        .catch(err => res.status(500).send('Error updating pet data.'));
});


app.delete('/api/jsonBlob/:id', (req, res) => {
    const petId = req.params.id;
    readDataFromFile()
        .then(data => {
            const updatedPets = data.filter(pet => pet.id !== petId);
            return writeDataToFile(updatedPets);
        })
        .then(() => res.json({ message: 'Pet deleted successfully!' }))
        .catch(err => res.status(500).send('Error deleting pet data.'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
