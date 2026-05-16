const axios = require('axios');

const TOKEN = process.env.AUTH_TOKEN;

const Log = async (stack, level, pkg, message) => {

    try {

        const response = await axios.post(
            'http://4.224.186.213/evaluation-service/logs',
            {
                stack: stack.toLowerCase(),
                level: level.toLowerCase(),
                package: pkg.toLowerCase(),
                message: message
            },
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('-> Log created successfully');

        return response.data;

    } catch (err) {

        if (err.response) {

            console.log('Logging Failed:', err.response.data);

        } else {

            console.log('Logging Failed:', err.message);
        }
    }
};

module.exports = Log;