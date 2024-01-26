import express from 'express'

const app = express();
const port = process.env.PORT || 3000;
app.set('port', port);
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.type('text/html');
    res.status(200);
    fetchAllBreeds()
        .then(data => {
            const breeds = data.data
            return res.render('breeds', {breeds});
        })
        .catch(e => console.log(e));
});

app.get('/breeds/:id', (req, res) => {
    res.type('text/html');
    res.status(200);
    fetchBreedById(req.params.id)
        .then(data => {
            const breed = data.data;
            console.log(breed);
            res.render('breed', {breed});
        }).catch(e => console.log(e));
});
app.get('/breeds', (req, res) => {
    res.type('text/html');
    res.status(200);
    fetchAllBreeds()
        .then(data => {
            const breeds = data.data;
            return res.render('breeds', {breeds})
        })
        .catch(e => console.log(e));
});
app.get('/facts', (req, res) => {
    res.type('text/html');
    res.status(200);
    fetchFacts()
        .then(data => {
            const facts = data.data;
            return res.render('facts', {facts});
        })
        .catch(e => console.log(e));
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
        console.log(e);
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