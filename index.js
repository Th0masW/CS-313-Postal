const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))

  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  
  .get('/postage', (req, res) => res.render('pages/postage'))
  .get('/postage_amount', doCalcs)
  
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

  function doMath(postalType, weight) 
{
	console.log(weight);console.log(postalType);
	var price = 0;
	if(postalType == "Letters (Stamped)")
	{ if(weight == 1) {price = 0.50;}
		else if (weight == 2) {price = 0.71;}
		else if (weight ==3) {price = 0.92;}
		else  if  (weight == 3.5) {price = 1.13;}	
	}
	
	else if(postalType == "Letters (Metered)")
	{
		if(weight == 1) {price = 0.47;}
		else if (weight == 2) {price = 0.68;}
		else if (weight ==3) {price = 0.89;}
		else  if  (weight == 3.5) {price = 1.10;}
	}
	else if(postalType == "Large Envelopes")
	{
		if(weight == 1) {price = 1.00;}
		if(weight > 1) {price = (weight - 1) * .21 + 1;}
	}
	else if (postalType == "First Class Package")
	{    if(weight <= 4) {price = 3.50;console.log("one");}
		 else if(weight <= 8) {price = 3.75;console.log("two");}
		 else if(weight <= 13) {price = (weight -8) * .35 + 3.75;console.log("three");}
	}
	
	price = "$"+ price.toFixed(2)
	console.log(price);
	var JSONdata = {selection: postalType, weight: weight, payThis: price};
	return JSONdata;
}


function doCalcs(request, response) {
	var postalType = request.query.postageType
	var weight = request.query.weight

	var JSONdata = doMath(postalType, weight)
	
	response.render('pages/postage_amount', JSONdata)
}
