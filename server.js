const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());


const gifsPath = path.join(__dirname, 'gifs.json');
let gifs = [];
try {
  const data = fs.readFileSync(gifsPath, 'utf8');
  gifs = JSON.parse(data);
} catch (err) {
  console.error('Error reading GIF data:', err);
}

const weights = {
  relevance: 0.4,
  engagement: 0.3,
  recency: 0.15,
  quality: 0.1,
  personalization: 0.05
};


function calculateScore(gif, query, userPreferences) {
  const relevanceScore = gif.tags.includes(query) ? 1 : 0;
  const engagementScore = (gif.likes + gif.views) / 10000; 
  const recencyScore = Math.max(0, 1 - (Date.now() - new Date(gif.uploadDate).getTime()) / (1000 * 60 * 60 * 24 * 30)); 
  const qualityScore = 1; // 
  const personalizationScore = userPreferences.includes(gif.tags[0]) ? 1 : 0; 

  return (
    (relevanceScore * weights.relevance) +
    (engagementScore * weights.engagement) +
    (recencyScore * weights.recency) +
    (qualityScore * weights.quality) +
    (personalizationScore * weights.personalization)
  );
}


app.post('/search', (req, res) => {
  const { query, userPreferences } = req.body;

  
  const rankedGifs = gifs.map(gif => ({
    ...gif,
    score: calculateScore(gif, query, userPreferences)
  }));

  
  rankedGifs.sort((a, b) => b.score - a.score);

  
  res.json(rankedGifs);
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
