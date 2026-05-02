module.exports = async (req, res) => {
  try {
    console.log("Weather API triggered");

    const { lat, lon } = req.body || {};

    if (!lat || !lon) {
      return res.status(400).json({ error: "Missing lat/lon" });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENWEATHER_API_KEY" });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);
    const data = await response.json();

    return res.status(200).json(data);

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Weather function crashed",
      details: err.message
    });
  }
};