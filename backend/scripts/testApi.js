const axios = require('axios');

async function testApi() {
    try {
        console.log('\nTesting API endpoints');
        console.log('===================');

        // Test units endpoint
        console.log('\nTesting /api/units endpoint:');
        const unitsResponse = await axios.get('http://localhost:3333/api/units');
        console.log('Response:', JSON.stringify(unitsResponse.data, null, 2));

        // Test specific unit endpoint
        console.log('\nTesting /api/units/1/1 endpoint:');
        const unitResponse = await axios.get('http://localhost:3333/api/units/1/1');
        console.log('Response:', JSON.stringify(unitResponse.data, null, 2));

    } catch (error) {
        console.error('API test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testApi();