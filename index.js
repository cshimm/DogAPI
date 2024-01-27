import express from 'express'

const app = express();
const port = process.env.PORT || 3000;
app.set('port', port);
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    try {
        res.type('text/html');
        res.status(200);
        fetchAllBreeds()
            .then(data => {
                const breeds = data.data
                return res.render('breeds', {breeds});
            });
    } catch (e) {
        res.status(500).send('Internal Server Error');
    }
});

app.get('/breeds/:id', (req, res) => {
    try {
        res.type('text/html');
        res.status(200);
        fetchBreedById(req.params.id)
            .then(data => {
                const breed = data.data;
                res.render('breed', {breed});
            });
    } catch (e) {
        res.status(500).send('Internal Server Error');
    }
});
app.get('/breeds', (req, res) => {
    try {
        res.type('text/html');
        res.status(200);
        fetchAllBreeds()
            .then(data => {
                const breeds = data.data;
                return res.render('breeds', {breeds})
            });
    } catch (e) {
        res.status(500).send('Internal Server Error');
    }
});
app.get('/facts', (req, res) => {
    try {
        res.type('text/html');
        res.status(200);
        fetchFacts()
            .then(data => {
                const facts = data.data;
                return res.render('facts', {facts});
            });
    } catch (e) {
        res.status(500).send('Internal Server Error');
    }
});
app.get('/groups', async (req, res) => {
    try {
        res.type('text/html');
        res.status(200);
        const breedsByGroup = {}
        const data = await fetchGroups();
        const groups = data.data;

        for (let i = 0; i < groups.length; i++) {
            const currentGroup = groups[i].attributes.name;
            const breedPromises = [];

            for (let j = 0; j < 5; j++) {
                breedPromises.push(fetchBreedById(groups[i].relationships.breeds.data[j].id)
                    .then(data => ` ${data.data.attributes.name}`));
            }
            breedsByGroup[currentGroup] = await Promise.all(breedPromises);
        }

        res.render('groups', {groups: breedsByGroup});
    } catch (e) {
        res.status(500).send('Internal Server Error');
    }
});
const endpoint = 'https://dogapi.dog/api/v2';
const fetchAllBreeds = async () => {
    const response = await fetch(`${endpoint}/breeds`);
    return await response.json();
}
const fetchBreedById = async (id) => {
    const response = await fetch(`${endpoint}/breeds/${id}`);
    return await response.json();
}
const fetchFacts = async () => {
    const numFacts = 5;
    const response = await fetch(`${endpoint}/facts?limit=${numFacts}`);
    return await response.json();
}
const fetchGroups = async () => {
    const response = await fetch(`${endpoint}/groups`);
    return await response.json();
}
app.listen(port, () => {
    console.log(`server is running on port ${port}`)
});