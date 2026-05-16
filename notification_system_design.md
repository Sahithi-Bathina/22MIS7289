# Campus Notification System Architecture Design

## Stage 1: API Design & Contract Details

Endpoints needed to fetch, manage, and push notifications across the campus portal.

### 1. GET /api/notifications
- Purpose: Pulls alerts for the logged-in student. Needs pagination to stop the server from breaking under heavy loads.
- Query Parameters:
  * page (default = 1)
  * limit (default = 10)
  * type (Placement / Event / Result)
  * isRead (true/false)
- Response Example (200 OK):
{
  "success": true,
  "notifications": [
    {
      "id": "d146095a-0d86-4a34-9e69-3900a14576bc",
      "type": "Result",
      "message": "Mid-sem marks for Software Engineering have been published.",
      "isRead": false,
      "createdAt": "2026-04-22T17:51:30.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "totalPages": 5,
    "totalCount": 48
  }
}

### 2. PATCH /api/notifications/:id/read
- Purpose: Marks an alert read when clicked.
- Response (200 OK):
{ "success": true, "message": "status updated" }

### 3. POST /api/notifications/broadcast (Admin only)
- Purpose: Lets placement cell or faculty blast an announcement.
- Body payload:
{
  "type": "Placement",
  "message": "CSX application deadline extended.",
  "target": "2027_batch"
}

---

## Stage 2: Database Schema & Setup

Using PostgreSQL here because transactional consistency is vital for things like marks and placement shortlists. NoSQL eventual consistency could mean a student misses an urgent deadline link.

### Table Layout (DDL Queries)

CREATE TYPE notification_type AS ENUM ('Placement', 'Event', 'Result');

CREATE TABLE students (
    student_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    batch VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type notification_type NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Junction table to track read/unread states per student
CREATE TABLE student_notifications (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES students(student_id) ON DELETE CASCADE,
    notification_id UUID REFERENCES notifications(notification_id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_user_alert UNIQUE (student_id, notification_id)
);

### Scaling Issues
Blasting a notification to 50k students at once causes massive write amplification (50k simultaneous inserts into the junction table). To fix this, we should look into database horizontal table partitioning based on the student_id ranges or batching inserts using a queue instead of running single queries.

---

## Stage 3: Query Optimization & Indexing

Slow query provided:
SELECT * FROM notifications WHERE studentID = 1042 AND isRead = false ORDER BY createdAt ASC;

### Diagnosis
1. Without indexes, the database runs a Full Table Scan through all 5 million rows on disk.
2. The ORDER BY clause forces an expensive in-memory sort operation.

### Evaluating the advice to index every single column
Indexing everything is bad advice. It balloons storage and slows down every single INSERT/UPDATE/DELETE write operation because the DB has to rebuild multiple index trees. It also doesn't help queries checking multiple columns at once.

### Solution: Composite Index
CREATE INDEX idx_student_unread_date ON notifications (studentID, isRead, createdAt);

This lets the DB seek straight to the unread items for that specific student, and because the index stores them pre-sorted by date, the sorting overhead drops to zero.

### 7-day Placement Query
SELECT DISTINCT s.student_id, s.name, s.email 
FROM students s
JOIN student_notifications sn ON s.student_id = sn.student_id
JOIN notifications n ON sn.notification_id = n.notification_id
WHERE n.type = 'Placement'
  AND n.created_at >= NOW() - INTERVAL '7 days';

---

## Stage 4: High-Traffic Reading (Redis)

When 50,000 students log on at once, hitting the primary SQL DB repeatedly will crash it. 
We can plug a Redis cache layer right in front of the database.

- Read Path (Cache-Aside): Check Redis for key `user:1042:nav`. If it's a hit, return it. If it's a miss, read from Postgres, save it into Redis with a 15-minute TTL, and send it back.
- Write Path (Cache Invalidation): When a user updates an alert to "read" or a new notice goes live, explicitly delete or evict that student's key from Redis so they don't see stale data.

Trade-offs: Redis gives microsecond responses and protects the DB, but it adds infra overhead and risk of cache incoherency if your invalidation logic has bugs. Read replicas keep data cleaner naturally but struggle with real-time spikes and replication lag.

---

## Stage 5: Message Queues for Bulk Broadcasts

The synchronous loop in the example freezes the main Node.js process thread pool because making 50k external HTTP network requests (`send_email`) takes forever. If user #150 fails, the whole loop breaks, leaving the rest without notices.

### Redesign
Decouple it using an async producer-consumer broker layer (like BullMQ on Redis or RabbitMQ). 
The Express API just registers the request, pushes it as an event to the queue, and instantly returns a `202 Accepted` status to the admin.

### Resilient Pseudocode

// Controller Endpoint
async function sendBroadcast(req, res) {
    const { type, message, targetBatch } = req.body;
    
    // save main copy once
    const alert = await db.saveNotification({ type, message });
    
    // push single job to broker
    await notificationQueue.add("process-bulk", { id: alert.id, targetBatch, message });
    
    return res.status(202).json({ success: true, status: "Job queued" });
}

// Background Worker Processor
async function workerProcess(job) {
    const { id, targetBatch, message } = job.data;
    let offset = 0;
    const chunkSize = 1000;
    
    while (true) {
        const targets = await db.getStudents(targetBatch, chunkSize, offset);
        if (targets.length === 0) break;
        
        // parallel tracking inside a safe try-catch wrapper
        await Promise.all(targets.map(async (student) => {
            try {
                await db.linkNotification(student.id, id);
                await emailClient.send(student.email, message);
            } catch (err) {
                console.error("failed for single record " + student.id, err);
            }
        }));
        offset += chunkSize;
    }
}

---

## Stage 6: Algorithmic Ranking Logic

Formula: Score = (Weight * 100) - (AgeInMinutes * 0.05)
Weights: Placement = 3, Result = 2, Event = 1

Handling High Volumes at Scale:
Instead of pulling everything into memory and sorting it with a heavy O(M log M) array sort, we can use a bounded Min-Heap of size N to process items in O(M log N) time, keeping memory consumption low. Alternatively, offload this scoring math straight into the SQL query level using calculated columns and indexing so the database engine returns pre-sorted slices.