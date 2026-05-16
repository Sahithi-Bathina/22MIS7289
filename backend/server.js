const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const port = 5000;

/* =========================
   MANDATORY LOGGER MIDDLEWARE
========================= */
const customLogger = (req, res, next) => {
    const time = new Date().toISOString();
    console.log(`[${time}] ${req.method} -> ${req.url}`);
    next();
};

app.use(cors());
app.use(express.json());
app.use(customLogger);

/* =========================
   ROOT ROUTE
========================= */
app.get('/', (req, res) => {
    res.send('Backend Running Successfully');
});

/* =========================
   CATEGORY WEIGHTS
========================= */
const weights = {
    Placement: 3,
    Result: 2,
    Event: 1
};

/* =========================
   PRIORITY NOTIFICATIONS API
========================= */
app.get('/api/priority-notifications', async (req, res) => {

    try {

        const limit = parseInt(req.query.limit) || 10;
        const typeFilter = req.query.notification_type || 'All';

        console.log('-> Fetching from external evaluation API...');

        /* =========================
           EXTERNAL API REQUEST
        ========================= */
        const apiResponse = await axios.get(
            'http://4.224.186.213/evaluation-service/notifications',
            {
                headers: {
                    Authorization: 'SfFuWg'
                },
                timeout: 5000
            }
        );

        console.log('-> External API Connected');

        /* =========================
           SAFE ARRAY EXTRACTION
        ========================= */
        let list = [];

        if (Array.isArray(apiResponse.data)) {
            list = apiResponse.data;

        } else if (
            apiResponse.data &&
            Array.isArray(apiResponse.data.notifications)
        ) {
            list = apiResponse.data.notifications;

        } else {
            list =
                Object.values(apiResponse.data).find(val =>
                    Array.isArray(val)
                ) || [];
        }

        /* =========================
           LOCAL FILTERING
        ========================= */
        if (typeFilter !== 'All') {

            list = list.filter(item => {

                const itemType =
                    item.Type ||
                    item.type ||
                    'Event';

                return (
                    itemType.toLowerCase() ===
                    typeFilter.toLowerCase()
                );
            });
        }

        const now = new Date();

        /* =========================
           PRIORITY SCORE CALCULATION
        ========================= */
        const scored = list.map(item => {

            const rawType =
                item.Type ||
                item.type ||
                'Event';

            const type =
                typeof rawType === 'string'
                    ? rawType.charAt(0).toUpperCase() +
                      rawType.slice(1).toLowerCase()
                    : 'Event';

            const weight = Math.max(weights[type] || 1, 1);

            const timestampStr =
                item.Timestamp ||
                item.timestamp ||
                now.toISOString();

            const itemTime = new Date(timestampStr);

            const ageMinutes = Math.max(
                0,
                (now - itemTime) / (1000 * 60)
            );

            // Priority Equation
            const finalScore =
                (weight * 100) -
                (ageMinutes * 0.05);

            return {
                id:
                    item.ID ||
                    item.id ||
                    crypto.randomUUID(),

                type,

                message:
                    item.Message ||
                    item.message ||
                    'Announcement details missing',

                timestamp: timestampStr,

                score: Number(finalScore.toFixed(2))
            };
        });

        /* =========================
           SORTING
        ========================= */
        scored.sort((a, b) => b.score - a.score);

        /* =========================
           PAGINATION
        ========================= */
        const resultPage = scored.slice(0, limit);

        return res.json({
            success: true,
            source: 'external-api',
            totalParsed: list.length,
            notifications: resultPage
        });

    } catch (err) {

        console.log('\n================ BACKEND ERROR LOG ================');

        if (err.response) {
            console.log('Status Code:', err.response.status);
            console.log('Response Data:', err.response.data);
        } else {
            console.log('Error Message:', err.message);
        }

        console.log('===================================================\n');

        /* =========================
           FALLBACK MOCK DATA
        ========================= */
        const fallbackNotifications = [
            {
                id: crypto.randomUUID(),
                type: 'Placement',
                message: 'TCS Placement Drive scheduled tomorrow',
                timestamp: new Date(),
                score: 299.5
            },
            {
                id: crypto.randomUUID(),
                type: 'Result',
                message: 'Semester Results Published',
                timestamp: new Date(),
                score: 199.4
            },
            {
                id: crypto.randomUUID(),
                type: 'Event',
                message: 'National Hackathon starts this weekend',
                timestamp: new Date(),
                score: 99.8
            }
        ];

        return res.json({
            success: true,
            source: 'fallback-mock-data',
            notifications: fallbackNotifications
        });
    }
});

/* =========================
   SERVER
========================= */
app.listen(port, () => {
    console.log(`Server live on http://localhost:${port}`);
});
