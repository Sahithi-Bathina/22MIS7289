const axios = require('axios');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzYWhpdGhpLjIybWlzNzI4OUB2aXRhcHN0dWRlbnQuYWMuaW4iLCJleHAiOjE3Nzg5MzE4MDAsImlhdCI6MTc3ODkzMDkwMCwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjcwMTIzNWVjLTA3YTQtNDYzNS1iZjk0LTc3NDBjNWQxMzllOCIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImIgc2FoaXRoaSBjaG91ZGFyeSIsInN1YiI6IjI3NGFkMjlkLTRmOGYtNDNiNC05ZWM0LWNmMjBkYWNlZDM4YSJ9LCJlbWFpbCI6InNhaGl0aGkuMjJtaXM3Mjg5QHZpdGFwc3R1ZGVudC5hYy5pbiIsIm5hbWUiOiJiIHNhaGl0aGkgY2hvdWRhcnkiLCJyb2xsTm8iOiIyMm1pczcyODkiLCJhY2Nlc3NDb2RlIjoiU2ZGdVdnIiwiY2xpZW50SUQiOiIyNzRhZDI5ZC00ZjhmLTQzYjQtOWVjNC1jZjIwZGFjZWQzOGEiLCJjbGllbnRTZWNyZXQiOiJTV3l2c01BYUFVYkRhZFJTIn0.IbxIdfayd65OhE5NGgjBsp6eFjXF7tMTRKDi-zPQOIo';

const Log = async (stack, level, pkg, message) => {

    try {

        await axios.post(
            'http://4.224.186.213/evaluation-service/logs',
            {
                stack,
                level,
                package: pkg,
                message
            },
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('-> Log created successfully');

    } catch (err) {

        console.log(
            'Logging Failed:',
            err.response?.data || err.message
        );
    }
};

module.exports = Log;