require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
    console.log(new Date().toISOString(), req.method, req.path, req.ip);
    next();
});

// Serve static files from project root
app.use(express.static(path.join(__dirname)));

// --- SSE (Server-Sent Events) manager for real-time notifications ---
const sseClients = new Map(); // userId -> Set of response objects

function addSseClient(userId, res) {
    if (!sseClients.has(userId)) sseClients.set(userId, new Set());
    sseClients.get(userId).add(res);
    try {
        console.log(`SSE: client connected for userId=${userId}. Total connections for user: ${sseClients.get(userId).size}`);
    } catch (e) { /* ignore logging errors */ }
}

function removeSseClient(userId, res) {
    if (!sseClients.has(userId)) return;
    sseClients.get(userId).delete(res);
    if (sseClients.get(userId).size === 0) sseClients.delete(userId);
    try {
        console.log(`SSE: client disconnected for userId=${userId}. Remaining connections: ${sseClients.has(userId) ? sseClients.get(userId).size : 0}`);
    } catch (e) { /* ignore */ }
}

function sendEventToUser(userId, eventData) {
    const clients = sseClients.get(String(userId));
    if (!clients) return false;
    for (const res of Array.from(clients)) {
        try {
            res.write(`event: notification\ndata: ${JSON.stringify(eventData)}\n\n`);
        } catch (e) {
            // If writing fails, remove the client
            try { removeSseClient(userId, res); } catch (er) { /* ignore */ }
        }
    }
    return true;
}

app.get('/api/subscribe', (req, res) => {
    const userId = req.query.userId || req.body && req.body.userId;
    if (!userId) return res.status(400).json({ success: false, message: 'Missing userId query parameter' });

    // SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
    });
    res.write('\n');

    addSseClient(String(userId), res);
    console.log('SSE: subscription registered for userId=', String(userId));

    req.on('close', () => {
        removeSseClient(String(userId), res);
    });
});

// Debug endpoint to list current SSE subscribers (for troubleshooting)
app.get('/api/debug-sse-clients', (req, res) => {
    try {
        const info = {};
        for (const [userId, set] of sseClients.entries()) {
            info[userId] = set.size;
        }
        res.json({ success: true, clients: info });
    } catch (err) {
        console.error('Debug SSE clients error:', err);
        res.status(500).json({ success: false, message: 'Failed to list SSE clients' });
    }
});

// Debug endpoint to send a manual notification to a given userId via SSE
app.post('/api/debug-send-notif', (req, res) => {
    try {
        const { userId, jobTitle, message } = req.body || {};
        if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });
        const notif = {
            type: 'Debug Notification',
            jobTitle: jobTitle || 'Debug Job',
            providerEmail: 'debug@example.com',
            message: message || `This is a debug notification for user ${userId}`,
            newStatus: 'Approved',
            applicationId: 'debug-' + Date.now(),
            updatedAt: new Date()
        };

        const sent = sendEventToUser(userId, notif);
        res.json({ success: true, sent, clients: Array.from(sseClients.keys()) });
    } catch (err) {
        console.error('Debug send notif error:', err);
        res.status(500).json({ success: false, message: 'Failed to send debug notification' });
    }
});

// --- MONGODB CONNECTION AND SCHEMAS ---
const mongoUri = process.env.MONGODB_URI || '';
const demoMode = !mongoUri || mongoUri.includes('YOUR_MONGODB_ATLAS_URI');

let User = null;
let Job = null;
let Application = null;
let FormSubmission = null;
let StudentProfile = null;
let inMemoryUsers = null;
let inMemoryJobs = [];
let inMemoryApplications = [];
let inMemoryProfiles = [];
let nextUserId = 1;

// Helper function for in-memory findOne logic (extended for Job and User)
const inMemoryFindOne = (collection, query) => {
    for (const item of collection.values ? collection.values() : collection) {
        if (query.email && item.email === query.email) return item;
        if (query.username && item.username === query.username) return item;
        if (query.$or) {
            for (const cond of query.$or) {
                if ((cond.email && item.email === cond.email) || (cond.username && item.username === cond.username)) {
                    return item;
                }
            }
        }
        if (query.userId && item.userId === query.userId) return item;
        if (query.jobId && item.jobId === query.jobId) return item;
    }
    return null;
};

if (demoMode) {
    console.warn('MONGODB_URI not set or left as placeholder. Running in DEMO mode (in-memory storage).');
    inMemoryUsers = new Map();
    // User Mock Model
    User = {
        async findOne(query) { return inMemoryFindOne(inMemoryUsers, query); },
        async findById(id) { return inMemoryUsers.get(String(id)) || null; },
        async create(doc) {
            const id = String(nextUserId++);
            const user = Object.assign({ _id: id, createdAt: new Date() }, doc);
            inMemoryUsers.set(id, user);
            return user;
        },
        async save() { /* in-memory update is done directly on the object */ }
    };
    // Job Mock Model
    Job = {
        async find(query) { 
            return inMemoryJobs.filter(job => {
                if (query.approved === true) return job.approved;
                if (query.providerId) return job.providerId === query.providerId;
                return true;
            }); 
        },
        async findById(id) { return inMemoryJobs.find(job => job._id === id) || null; },
        async create(doc) {
            const job = Object.assign({ _id: String(Date.now()), createdAt: new Date() }, doc);
            inMemoryJobs.push(job);
            return job;
        }
    };
    // Application Mock Model
    Application = {
        async find(query) {
            // Support filtering by a few common fields used by the app
            return inMemoryApplications.filter(app => {
                if (!query) return true;
                if (query.userId && app.userId !== query.userId) return false;
                if (query.jobId && app.jobId !== query.jobId) return false;
                if (query.providerNotified !== undefined && app.providerNotified !== query.providerNotified) return false;
                if (query.studentNotified !== undefined && app.studentNotified !== query.studentNotified) return false;
                if (query.status) {
                    // support either a single value or { $in: [...] }
                    if (typeof query.status === 'string' && app.status !== query.status) return false;
                    if (query.status.$in && !query.status.$in.includes(app.status)) return false;
                }
                return true;
            });
        },
        async findOne(query) { return inMemoryFindOne(inMemoryApplications, query); },
        async findById(id) { return inMemoryApplications.find(a => String(a._id) === String(id)) || null; },
        async create(doc) {
            const app = Object.assign({ _id: String(Date.now() + 1), createdAt: new Date() }, doc);
            inMemoryApplications.push(app);
            return app;
        },
        async updateMany(filter, update) {
            // Basic in-memory implementation that supports common update patterns used in the server
            let modified = 0;
            const setObj = (update && update.$set) ? update.$set : update;

            inMemoryApplications.forEach(app => {
                let matches = true;
                if (filter._id && filter._id.$in) {
                    matches = filter._id.$in.includes(app._id);
                }
                if (filter.jobId && app.jobId !== filter.jobId) matches = false;
                if (filter.userId && app.userId !== filter.userId) matches = false;
                if (filter.status && typeof filter.status === 'string' && app.status !== filter.status) matches = false;
                if (filter.status && filter.status.$in && !filter.status.$in.includes(app.status)) matches = false;

                if (matches) {
                    if (setObj) Object.assign(app, setObj);
                    modified++;
                }
            });

            return { modifiedCount: modified };
        }
    };
    // FormSubmission Mock Model
    let formSubmissions = [];
    FormSubmission = {
        async create(doc) {
            const submission = Object.assign({ _id: String(Date.now() + 2), submittedAt: new Date() }, doc);
            formSubmissions.push(submission);
            console.log('Form submission stored (demo mode):', submission);
            return submission;
        }
    };
    // StudentProfile Mock Model
    StudentProfile = {
        async findOne(query) { return inMemoryProfiles.find(p => (query.userId && p.userId === query.userId)); },
        async create(doc) {
            const profile = Object.assign({ _id: String(Date.now() + 3), createdAt: new Date() }, doc);
            inMemoryProfiles.push(profile);
            return profile;
        },
        async findOneAndUpdate(query, update) {
            const idx = inMemoryProfiles.findIndex(p => (query.userId && p.userId === query.userId));
            if (idx >= 0) {
                Object.assign(inMemoryProfiles[idx], update.$set);
                return inMemoryProfiles[idx];
            }
            return this.create(Object.assign({ userId: query.userId }, update.$set));
        }
    };
} else {
    mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('Connected to MongoDB Atlas'))
        .catch(err => {
            console.error('MongoDB connection error:', err.message);
            process.exit(1);
        });

    // User schema
    const userSchema = new mongoose.Schema({
        // *** FIX APPLIED HERE: Added unique: true, sparse: true to username ***
        username: { type: String, required: true, unique: true, sparse: true }, 
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: null },
        createdAt: { type: Date, default: Date.now }
    });
    User = mongoose.model('User', userSchema);

    // Job schema - NEW
    const jobSchema = new mongoose.Schema({
        providerId: { type: String, required: true },
        providerEmail: { type: String, default: '' },
        title: { type: String, required: true },
        location: { type: String, required: true },
        description: { type: String, required: true },
        approved: { type: Boolean, default: false }, // *** Key field for approval logic ***
        createdAt: { type: Date, default: Date.now }
    });
    Job = mongoose.model('Job', jobSchema);

    // Application schema - NEW
    const applicationSchema = new mongoose.Schema({
        userId: { type: String, required: true },
        jobId: { type: String, required: true },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        appliedAt: { type: Date, default: Date.now },
        // Optional fields for tracking notifications
        providerNotified: { type: Boolean, default: false },
        studentNotified: { type: Boolean, default: false }
    });
    // Add a unique compound index to prevent duplicate applications for the same job
    applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });
    Application = mongoose.model('Application', applicationSchema);

    // Form Submission schema
    const formSchema = new mongoose.Schema({
        userId: { type: String },
        username: { type: String, required: true },
        email: { type: String, required: true },
        role: { type: String, default: null },
        submittedAt: { type: Date, default: Date.now }
    });
    FormSubmission = mongoose.model('FormSubmission', formSchema);

    // Student Profile schema - for storing detailed profile info
    const studentProfileSchema = new mongoose.Schema({
        userId: { type: String, required: true, unique: true },
        fullName: { type: String, default: '' },
        contactEmail: { type: String, default: '' },
        university: { type: String, default: '' },
        degree: { type: String, default: '' },
        gradYear: { type: Number, default: null },
        gpa: { type: String, default: '' },
        workExperience: { type: String, default: '' },
        skills: { type: String, default: '' },
        projects: { type: String, default: '' },
        completeness: { type: Number, default: 0 },
        updatedAt: { type: Date, default: Date.now }
    });
    StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
}

// --- API ROUTES ---

app.get('/', (req, res) => {
    res.send('IISF Express server is running');
});

// --- AUTH ROUTES (EXISTING) ---

app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });
        
        // Check for existing email (unique index ensures this)
        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ success: false, message: 'Email already exists' });
        
        // Check for existing username (unique index on username ensures this)
        // Note: The logic below relies on Mongoose/MongoDB error handling if unique constraint fails, 
        // but adding an explicit check can provide a cleaner error message.
        const existingUsername = await User.findOne({ username });
        if (existingUsername) return res.status(400).json({ success: false, message: 'Username already exists' });


        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        let user;
        if (demoMode) {
            user = await User.create({ username, email, password: hash, role: null });
        } else {
            user = new User({ username, email, password: hash });
            await user.save();
        }

        res.json({ success: true, token: 'mock-token-' + Date.now(), user: { _id: user._id, username: user.username, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        // Specifically check for E11000 on email or username and give a friendly message
        if (err.code === 11000) {
             return res.status(400).json({ success: false, message: 'User already exists (Email or Username is taken).' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) return res.status(400).json({ success: false, message: 'Missing fields' });

        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
        if (!user) return res.status(400).json({ success: false, message: 'User not found' });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(400).json({ success: false, message: 'Invalid credentials' });

        res.json({ success: true, token: 'mock-token-' + Date.now(), user: { _id: user._id, username: user.username, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/set-role', async (req, res) => {
    try {
        const { userId, role } = req.body;
        if (!userId || !role) return res.status(400).json({ success: false, message: 'Missing fields' });

        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (demoMode) {
            user.role = role;
            inMemoryUsers.set(String(user._id), user);
        } else {
            user.role = role;
            await user.save();
        }

        res.json({ success: true, user: { _id: user._id, username: user.username, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/submit-form', async (req, res) => {
    try {
        const { userId, username, email, role } = req.body;
        if (!username || !email) return res.status(400).json({ success: false, message: 'Missing required fields' });

        const submission = await FormSubmission.create({
            userId: userId || null,
            username,
            email,
            role: role || null
        });

        res.json({ success: true, message: 'Form submitted successfully', submission });
    } catch (err) {
        console.error('Form submission error:', err);
        res.status(500).json({ success: false, message: 'Failed to submit form' });
    }
});

// --- NEW JOB PROVIDER ROUTES ---

// Endpoint to post a new job
app.post('/api/post-job', async (req, res) => {
    try {
        const { providerId, providerEmail, title, location, description } = req.body;
        if (!providerId || !title || !location || !description) {
            return res.status(400).json({ success: false, message: 'Missing required job fields' });
        }

        let emailToStore = providerEmail;
        
        // If providerEmail is not provided, fetch it from the User database using providerId
        if (!emailToStore) {
            try {
                const provider = await User.findById(providerId);
                if (provider && provider.email) {
                    emailToStore = provider.email;
                }
            } catch (e) {
                console.warn('Could not fetch provider email from database:', e.message);
            }
        }

        const job = await Job.create({ 
            providerId, 
            providerEmail: emailToStore || '', 
            title, 
            location, 
            description, 
            approved: false 
        });

        // Send a notification/log to the 'admin' that a new job is pending approval
        console.log(`[ADMIN ALERT] New job posted by ${providerId} (${emailToStore}) (Job ID: ${job._id}) is awaiting approval.`);
        
        res.json({ success: true, message: 'Job posted successfully. It is awaiting approval.', job });
    } catch (err) {
        console.error('Job posting error:', err);
        res.status(500).json({ success: false, message: 'Failed to post job' });
    }
});

// Enhanced endpoint for admin to view job details and approve/reject
app.post('/api/approve-job', async (req, res) => {
    try {
        const { jobId, approvalStatus } = req.body;
        
        if (!jobId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing jobId. Please provide a job ID to view and manage.' 
            });
        }

        // First, find the job to show all details
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ 
                success: false, 
                message: 'Job not found with the provided ID.' 
            });
        }

        // If approvalStatus is provided, update the job status
        if (approvalStatus !== undefined) {
            job.approved = approvalStatus;

            if (demoMode) {
                const index = inMemoryJobs.findIndex(j => j._id === jobId);
                if (index !== -1) inMemoryJobs[index].approved = approvalStatus;
            } else {
                await job.save();
            }

            const message = approvalStatus ? 
                'Job has been successfully approved and is now visible to students.' : 
                'Job approval has been revoked/rejected.';

            // Update all 'Pending' applications for this job
            if (!demoMode) {
                await Application.updateMany(
                    { jobId: jobId, status: 'Pending' }, 
                    { status: approvalStatus ? 'Approved' : 'Rejected', studentNotified: false }
                );
            } else {
                inMemoryApplications.forEach(app => {
                    if (app.jobId === jobId && app.status === 'Pending') {
                        app.status = approvalStatus ? 'Approved' : 'Rejected';
                        app.studentNotified = false;
                    }
                });
            }
            
            return res.json({ 
                success: true, 
                message, 
                job: {
                    _id: job._id,
                    providerId: job.providerId,
                    title: job.title,
                    location: job.location,
                    description: job.description,
                    approved: job.approved,
                    createdAt: job.createdAt
                } 
            });
        } else {
            // If no approvalStatus provided, just return the job details for review
            return res.json({
                success: true,
                message: 'Job details retrieved successfully.',
                job: {
                    _id: job._id,
                    providerId: job.providerId,
                    title: job.title,
                    location: job.location,
                    description: job.description,
                    approved: job.approved,
                    createdAt: job.createdAt
                },
                actionRequired: true // Flag to indicate approval action is pending
            });
        }

    } catch (err) {
        console.error('Job approval error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to process job approval request' 
        });
    }
});

// Endpoint for Job Provider to view their unread application notifications
app.post('/api/provider-notifications', async (req, res) => {
    try {
        const { providerId } = req.body;
        console.log('Provider-notifications request:', { providerId, demoMode });
        if (!providerId) return res.status(400).json({ success: false, message: 'Missing providerId' });

        let providerJobs = [];
        let newApplications = [];

        if (demoMode) {
            // Demo mode: Use in-memory data
            console.log('Using demo mode. inMemoryJobs:', inMemoryJobs.length);
            providerJobs = inMemoryJobs.filter(job => job.providerId === providerId);
            console.log('Provider jobs found:', providerJobs.length, providerJobs.map(j => ({ id: j._id, title: j.title })));
            
            const jobIds = providerJobs.map(job => job._id);
            newApplications = inMemoryApplications.filter(app => 
                jobIds.includes(app.jobId) && app.providerNotified === false
            );
            console.log('New applications found:', newApplications.length);
            console.log('All applications in system:', inMemoryApplications.map(a => ({ userId: a.userId, jobId: a.jobId, notified: a.providerNotified })));
        } else {
            // MongoDB mode
            providerJobs = await Job.find({ providerId });
            console.log('Provider jobs found (MongoDB):', providerJobs.length, providerJobs.map(j => ({ id: j._id, title: j.title })));
            const jobIds = providerJobs.map(job => job._id);
            newApplications = await Application.find({ 
                jobId: { $in: jobIds }, 
                providerNotified: false 
            });
            console.log('New applications found (MongoDB):', newApplications.length);
        }

        // 3. Prepare notifications and update them as notified (fire-and-forget)
        const notifications = [];
        const applicationsToMarkAsRead = [];

        for (const app of newApplications) {
            // Find the job title for the notification
            const job = providerJobs.find(j => {
                const jId = j._id ? j._id.toString() : j._id;
                const appJobId = app.jobId ? app.jobId.toString() : app.jobId;
                return jId === appJobId;
            });
            const user = demoMode ? 
                inMemoryUsers.get(app.userId) : 
                await User.findById(app.userId); // Fetch student user details

            // Also fetch the student's profile data
            let studentProfile = null;
            if (!demoMode) {
                studentProfile = await StudentProfile.findOne({ userId: app.userId });
            }

            notifications.push({
                type: 'New Application',
                jobTitle: job ? job.title : 'Unknown Job',
                applicantId: app.userId,
                applicantUsername: user ? user.username : 'Unknown Student',
                applicantEmail: user ? user.email : 'N/A',
                applicationId: app._id,
                appliedAt: app.appliedAt,
                studentProfile: studentProfile ? {
                    fullName: studentProfile.fullName,
                    contactEmail: studentProfile.contactEmail,
                    university: studentProfile.university,
                    degree: studentProfile.degree,
                    gradYear: studentProfile.gradYear,
                    gpa: studentProfile.gpa,
                    workExperience: studentProfile.workExperience,
                    skills: studentProfile.skills,
                    projects: studentProfile.projects,
                    completeness: studentProfile.completeness
                } : null
            });
            applicationsToMarkAsRead.push(app._id);
        }
        
        console.log('Prepared notifications:', notifications.length);

        // Mark as read in the background (DISABLED: Notifications should stay until provider explicitly dismisses them)
        // Only mark as read if provider explicitly requests it via a separate endpoint
        // if (!demoMode && applicationsToMarkAsRead.length > 0) {
        //     await Application.updateMany(
        //         { _id: { $in: applicationsToMarkAsRead } }, 
        //         { providerNotified: true }
        //     );
        // } else if (demoMode) {
        //     inMemoryApplications.forEach(app => {
        //         if (applicationsToMarkAsRead.includes(app._id)) {
        //             app.providerNotified = true;
        //         }
        //     });
        // }

        res.json({ success: true, notifications });

    } catch (err) {
        console.error('Provider notification error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch provider notifications' });
    }
});

// Endpoint for Job Provider to view their approved applications
app.post('/api/provider-approved-applications', async (req, res) => {
    try {
        const { providerId } = req.body;
        if (!providerId) return res.status(400).json({ success: false, message: 'Missing providerId' });

        let providerJobs = [];
        let approvedApplications = [];

        if (demoMode) {
            // Demo mode: Use in-memory data
            providerJobs = inMemoryJobs.filter(job => job.providerId === providerId);
            const jobIds = providerJobs.map(job => job._id);
            approvedApplications = inMemoryApplications.filter(app => 
                jobIds.includes(app.jobId) && app.status === 'Approved'
            );
        } else {
            // MongoDB mode
            providerJobs = await Job.find({ providerId });
            const jobIds = providerJobs.map(job => job._id);
            approvedApplications = await Application.find({ 
                jobId: { $in: jobIds }, 
                status: 'Approved'
            });
        }

        // Prepare response with applicant details
        const applications = [];
        for (const app of approvedApplications) {
            // Find the job title for the notification
            const job = providerJobs.find(j => {
                const jId = j._id ? j._id.toString() : j._id;
                const appJobId = app.jobId ? app.jobId.toString() : app.jobId;
                return jId === appJobId;
            });
            const user = demoMode ? 
                inMemoryUsers.get(app.userId) : 
                await User.findById(app.userId);

            applications.push({
                _id: app._id,
                applicantId: app.userId,
                applicantUsername: user ? user.username : 'Unknown Student',
                applicantEmail: user ? user.email : 'N/A',
                applicantName: user ? user.username : 'Unknown',
                jobTitle: job ? job.title : 'Unknown Job',
                jobId: job ? job._id : 'Unknown',
                status: app.status,
                appliedAt: app.appliedAt,
                approvedAt: app.updatedAt || app.appliedAt,
                updatedAt: app.updatedAt || app.appliedAt
            });
        }

        res.json({ success: true, applications });

    } catch (err) {
        console.error('Provider approved applications error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch approved applications' });
    }
});

// Endpoint for provider to approve an application
app.post('/api/approve-application', async (req, res) => {
    try {
        const { applicationId, providerId } = req.body;
        if (!applicationId) return res.status(400).json({ success: false, message: 'Missing applicationId' });

        const application = await Application.findById(applicationId);
        if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

        // Verify provider owns the job
        const job = await Job.findById(application.jobId);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        if (providerId && job.providerId.toString() !== providerId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to approve this application' });
        }

        // Update application status and mark studentNotified = false so student gets notified
        application.status = 'Approved';
        application.providerNotified = true; // provider has seen/acted on it
        application.studentNotified = false; // student should receive notification
        if (demoMode) {
            // persist change into in-memory list
            const idx = inMemoryApplications.findIndex(a => String(a._id) === String(application._id));
            if (idx !== -1) {
                inMemoryApplications[idx].status = application.status;
                inMemoryApplications[idx].providerNotified = application.providerNotified;
                inMemoryApplications[idx].studentNotified = application.studentNotified;
            }
        } else {
            await application.save();
        }

        // Optionally return applicant info so frontend can notify/update immediately
        const studentUser = await User.findById(application.userId);

        // Broadcast real-time notification to the student via SSE (if connected)
        try {
            const providerEmail = job && job.providerEmail ? job.providerEmail : (job && job.providerId ? job.providerId : 'Not provided');
            const notif = {
                type: 'Application Status Update',
                jobTitle: job ? job.title : 'Unknown Job',
                providerEmail,
                message: `Congratulations! You have been selected for the role '${job ? job.title : 'the job'}'. Please contact the provider at ${providerEmail}.`,
                newStatus: application.status,
                applicationId: application._id,
                updatedAt: new Date()
            };

            const sent = sendEventToUser(application.userId, notif);
            if (sent) {
                // mark student as notified now that we pushed it
                if (demoMode) {
                    const idx2 = inMemoryApplications.findIndex(a => String(a._id) === String(application._id));
                    if (idx2 !== -1) inMemoryApplications[idx2].studentNotified = true;
                } else {
                    try { application.studentNotified = true; await application.save(); } catch (e) { console.warn('Failed to set studentNotified after SSE:', e.message); }
                }
            }
        } catch (e) {
            console.error('SSE broadcast error:', e && e.message ? e.message : e);
        }

        res.json({ success: true, message: 'Application approved', application, applicant: studentUser });
    } catch (err) {
        console.error('Approve application error:', err);
        res.status(500).json({ success: false, message: 'Failed to approve application' });
    }
});

// Endpoint for provider to reject an application
app.post('/api/reject-application', async (req, res) => {
    try {
        const { applicationId, providerId } = req.body;
        if (!applicationId) return res.status(400).json({ success: false, message: 'Missing applicationId' });

        const application = await Application.findById(applicationId);
        if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

        // Verify provider owns the job
        const job = await Job.findById(application.jobId);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        if (providerId && job.providerId.toString() !== providerId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to reject this application' });
        }

        // Update application status to Rejected
        application.status = 'Rejected';
        application.providerNotified = true; // provider has seen/acted on it
        application.studentNotified = false; // student should receive rejection notification
        if (demoMode) {
            // persist change into in-memory list
            const idx = inMemoryApplications.findIndex(a => String(a._id) === String(application._id));
            if (idx !== -1) {
                inMemoryApplications[idx].status = application.status;
                inMemoryApplications[idx].providerNotified = application.providerNotified;
                inMemoryApplications[idx].studentNotified = application.studentNotified;
            }
        } else {
            await application.save();
        }

        // Fetch student and job info for logging
        const studentUser = await User.findById(application.userId);

        // Broadcast real-time rejection notification to the student via SSE (if connected)
        try {
            const providerEmail = job && job.providerEmail ? job.providerEmail : (job && job.providerId ? job.providerId : 'Not provided');
            const notif = {
                type: 'Application Status Update',
                jobTitle: job ? job.title : 'Unknown Job',
                providerEmail,
                message: `We appreciate your application for '${job ? job.title : 'the job'}'. Unfortunately, your application was not selected. Keep applying and best of luck!`,
                newStatus: application.status,
                applicationId: application._id,
                updatedAt: new Date()
            };

            const sent = sendEventToUser(application.userId, notif);
            if (sent) {
                // mark student as notified now that we pushed it
                if (demoMode) {
                    const idx2 = inMemoryApplications.findIndex(a => String(a._id) === String(application._id));
                    if (idx2 !== -1) inMemoryApplications[idx2].studentNotified = true;
                } else {
                    try { application.studentNotified = true; await application.save(); } catch (e) { console.warn('Failed to set studentNotified after SSE:', e.message); }
                }
            }
        } catch (e) {
            console.error('SSE broadcast error (rejection):', e && e.message ? e.message : e);
        }

        res.json({ success: true, message: 'Application rejected', application, applicant: studentUser });
    } catch (err) {
        console.error('Reject application error:', err);
        res.status(500).json({ success: false, message: 'Failed to reject application' });
    }
});

// --- NEW STUDENT ROUTES ---

// Endpoint for Student to view only approved jobs with optional location filter
app.get('/api/jobs', async (req, res) => {
    try {
        // Build query filter for approved jobs
        const query = { approved: true };
        
        // If location parameter is provided, add it to the query (case-insensitive)
        if (req.query.location) {
            query.location = { $regex: req.query.location, $options: 'i' };
        }
        
        // Only return jobs that have been explicitly approved
        const approvedJobs = await Job.find(query);
        res.json({ success: true, jobs: approvedJobs });
    } catch (err) {
        console.error('Job fetching error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch approved jobs' });
    }
});

// Provider-specific job listing (accepts POST with { providerId })
app.post('/api/jobs', async (req, res) => {
    try {
        const { providerId } = req.body || {};

        if (providerId) {
            const providerJobs = await Job.find({ providerId });
            return res.json({ success: true, jobs: providerJobs });
        }

        // Fallback: return approved jobs when providerId not provided
        const approvedJobs = await Job.find({ approved: true });
        return res.json({ success: true, jobs: approvedJobs });
    } catch (err) {
        console.error('POST /api/jobs error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch jobs' });
    }
});

// Endpoint for Student to apply for a job
app.post('/api/apply-job', async (req, res) => {
    try {
        const { userId, jobId } = req.body;
        console.log('Apply job request:', { userId, jobId, demoMode });
        if (!userId || !jobId) return res.status(400).json({ success: false, message: 'Missing userId or jobId' });
        
        let job = null;
        let existingApplication = null;
        let application = null;

        if (demoMode) {
            // Demo mode: Use in-memory data
            job = inMemoryJobs.find(j => j._id === jobId);
            console.log('Job found in demo mode:', job ? `${job.title} (${job._id})` : 'NOT FOUND');
            
            if (!job || !job.approved) {
                return res.status(400).json({ success: false, message: 'Cannot apply: Job is not approved or does not exist.' });
            }
            
            existingApplication = inMemoryApplications.find(app => app.userId === userId && app.jobId === jobId);
            if (existingApplication) {
                return res.status(400).json({ success: false, message: `Already applied with status: ${existingApplication.status}` });
            }

            application = { 
                _id: Math.random().toString(36).substr(2, 9),
                userId, 
                jobId, 
                status: 'Pending', 
                providerNotified: false,
                studentNotified: true,
                appliedAt: new Date()
            };
            inMemoryApplications.push(application);
            console.log('Application created in demo mode:', application._id);
        } else {
            // MongoDB mode
            job = await Job.findById(jobId);
            console.log('Job found in MongoDB:', job ? `${job.title} (${job._id})` : 'NOT FOUND');
            
            if (!job || !job.approved) {
                 return res.status(400).json({ success: false, message: 'Cannot apply: Job is not approved or does not exist.' });
            }
            
            // Check for existing application
            existingApplication = await Application.findOne({ userId, jobId });
            if (existingApplication) {
                console.log('Already applied:', existingApplication._id);
                return res.status(400).json({ success: false, message: `Already applied with status: ${existingApplication.status}` });
            }

            application = await Application.create({ 
                userId, 
                jobId, 
                status: 'Pending', 
                providerNotified: false, // Set to false to trigger a notification to the provider
                studentNotified: true // Student is aware on creation
            });
            console.log('Application created in MongoDB:', application._id);
            console.log('Application data:', { userId, jobId, providerId: job.providerId, providerNotified: false });
        }
        
        res.json({ success: true, message: 'Application submitted successfully! Status: Pending', application });
    } catch (err) {
        console.error('Apply job error:', err);
        // Handle unique index violation specifically (if not in demo mode)
        if (!demoMode && err.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already applied for this job.' });
        }
        res.status(500).json({ success: false, message: 'Failed to submit application' });
    }
});

// Endpoint for Student to view unread status updates (notifications)
app.post('/api/student-notifications', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });

        // Find applications where status is 'Approved'/'Rejected' and the student hasn't been notified
        const newStatusUpdates = await Application.find({ 
            userId, 
            status: { $in: ['Approved', 'Rejected'] }, 
            studentNotified: false 
        });

        const notifications = [];
        const applicationsToMarkAsRead = [];

        for (const app of newStatusUpdates) {
            // Fetch job details to provide context
            const job = await Job.findById(app.jobId);
            // Build a friendly message for the student including provider contact
            const providerEmail = job && job.providerEmail ? job.providerEmail : (job && job.providerId ? job.providerId : 'Not provided');
            let message = '';
            if (app.status === 'Approved') {
                message = `Congratulations! You have been selected for the role '${job ? job.title : 'the job'}'. Please contact the provider for next steps at ${providerEmail}.`;
            } else if (app.status === 'Rejected') {
                message = `We appreciate your application for '${job ? job.title : 'the job'}'. Unfortunately, your application was not selected. Keep applying and best of luck.`;
            } else {
                message = `The status of your application for '${job ? job.title : 'the job'}' has been updated to ${app.status}.`;
            }

            notifications.push({
                type: 'Application Status Update',
                jobTitle: job ? job.title : 'Unknown Job',
                providerEmail: providerEmail,
                message: message,
                newStatus: app.status,
                applicationId: app._id,
                updatedAt: app.appliedAt // Use appliedAt as a placeholder for updated time
            });
            applicationsToMarkAsRead.push(app._id);
        }
        
        // Mark as read in the background (only if we are not in demo mode)
        if (!demoMode && applicationsToMarkAsRead.length > 0) {
            await Application.updateMany(
                { _id: { $in: applicationsToMarkAsRead } }, 
                { studentNotified: true }
            );
        } else if (demoMode) {
             // Demo mode: manually update in-memory applications
            inMemoryApplications.forEach(app => {
                if (applicationsToMarkAsRead.includes(app._id)) {
                    app.studentNotified = true;
                }
            });
        }

        res.json({ success: true, notifications });

    } catch (err) {
        console.error('Student notification error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch student notifications' });
    }
});

// --- STUDENT PROFILE ROUTES ---

// Endpoint to save/update student profile
app.post('/api/save-profile', async (req, res) => {
    try {
        const { userId, fullName, contactEmail, university, degree, gradYear, gpa, workExperience, skills, projects, completeness } = req.body;
        if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });

        const profileData = {
            userId,
            fullName: fullName || '',
            contactEmail: contactEmail || '',
            university: university || '',
            degree: degree || '',
            gradYear: gradYear || null,
            gpa: gpa || '',
            workExperience: workExperience || '',
            skills: skills || '',
            projects: projects || '',
            completeness: completeness || 0,
            updatedAt: new Date()
        };

        const profile = await StudentProfile.findOneAndUpdate(
            { userId },
            { $set: profileData },
            { upsert: true, new: true }
        );

        res.json({ success: true, message: 'Profile saved successfully', profile });
    } catch (err) {
        console.error('Profile save error:', err);
        res.status(500).json({ success: false, message: 'Failed to save profile' });
    }
});

// Endpoint to retrieve student profile
app.post('/api/get-profile', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ success: false, message: 'Missing userId' });

        const profile = await StudentProfile.findOne({ userId });

        if (!profile) {
            return res.json({ success: true, profile: null, message: 'No profile found' });
        }

        res.json({ success: true, profile });
    } catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
});

// TEMP Debug endpoint to reset providerNotified flag
app.post('/api/debug-reset-notifications', async (req, res) => {
    try {
        console.log('RESETTING all providerNotified flags...');
        const result = await Application.updateMany(
            { providerNotified: true },
            { $set: { providerNotified: false } }
        );
        console.log('Reset result:', result);
        res.json({ success: true, message: 'Reset complete', modifiedCount: result.modifiedCount });
    } catch (err) {
        console.error('Reset error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Debug endpoint to check total applications in system
app.get('/api/debug-all-apps', async (req, res) => {
    try {
        const allApps = await Application.find({});
        const unnotified = await Application.find({ providerNotified: false });
        
        console.log('DEBUG: Total applications in system:', allApps.length);
        console.log('DEBUG: Unnotified applications:', unnotified.length);
        console.log('Applications:', allApps.map(a => ({
            _id: a._id.toString(),
            userId: a.userId,
            jobId: a.jobId.toString(),
            providerNotified: a.providerNotified,
            appliedAt: a.appliedAt
        })));
        
        res.json({ 
            success: true, 
            totalApplications: allApps.length,
            unnotifiedApplications: unnotified.length,
            applications: allApps
        });
    } catch (err) {
        console.error('Debug error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Debug endpoint to check all applications for a provider
app.post('/api/debug-provider-apps', async (req, res) => {
    try {
        const { providerId } = req.body;
        const providerJobs = await Job.find({ providerId });
        const jobIds = providerJobs.map(job => job._id);
        
        console.log('DEBUG: Provider ID:', providerId);
        console.log('DEBUG: Provider jobs:', providerJobs.map(j => ({ _id: j._id.toString(), title: j.title })));
        
        const allApps = await Application.find({ jobId: { $in: jobIds } });
        console.log('DEBUG: All applications for provider:', allApps.map(a => ({ 
            _id: a._id.toString(), 
            jobId: a.jobId.toString(), 
            userId: a.userId, 
            providerNotified: a.providerNotified,
            appliedAt: a.appliedAt
        })));
        
        // Also check for unpnotified apps
        const unnotifiedApps = await Application.find({ jobId: { $in: jobIds }, providerNotified: false });
        console.log('DEBUG: Unnotified applications:', unnotifiedApps.length);
        
        res.json({ 
            success: true, 
            providerId,
            jobs: providerJobs.length, 
            applications: allApps.length,
            unnotifiedApplications: unnotifiedApps.length,
            apps: allApps,
            unnotified: unnotifiedApps
        });
    } catch (err) {
        console.error('Debug error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- CHATBOT / AI PROXY ENDPOINT ---
// Proxies chat requests to an external Gemen AI endpoint. Configure `GEMEN_API_URL` and
// `GEMEN_API_KEY` in the `.env` file. The upstream API shape is forwarded as-is.
app.post('/api/chat', async (req, res) => {
    try {
        const { message, context } = req.body || {};

        // 1) Prefer OpenAI if `OPENAI_API_KEY` is present
        const openaiKey = process.env.OPENAI_API_KEY;
        if (openaiKey) {
            try {
                const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
                const systemPrompt = process.env.CHAT_SYSTEM_PROMPT || 'You are a helpful assistant for a student job portal.';
                const resp = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${openaiKey}`
                    },
                    body: JSON.stringify({
                        model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: String(message) }
                        ],
                        temperature: 0.6,
                        max_tokens: 500
                    })
                });

                const j = await resp.json();
                if (j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) {
                    const reply = j.choices[0].message.content.trim();
                    return res.json({ success: true, data: { reply, raw: j } });
                }
            } catch (openErr) {
                console.error('OpenAI request failed:', openErr && openErr.message ? openErr.message : openErr);
                // fall through to next option
            }
        }

        // 2) Try Gemen if configured
        const gemenUrl = process.env.GEMEN_API_URL;
        const gemenKey = process.env.GEMEN_API_KEY;
        if (gemenUrl && gemenKey) {
            try {
                const upstreamRes = await fetch(gemenUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${gemenKey}`
                    },
                    body: JSON.stringify({ message, context })
                });

                const payload = await upstreamRes.text();
                let data;
                try { data = payload ? JSON.parse(payload) : null; } catch (e) { data = payload; }

                if (data && typeof data === 'object') {
                    if (data.reply) return res.json({ success: true, data: { reply: data.reply, raw: data } });
                    if (data.choices && data.choices[0] && data.choices[0].text) return res.json({ success: true, data: { reply: data.choices[0].text, raw: data } });
                    return res.json({ success: true, data: { reply: JSON.stringify(data).slice(0,1000), raw: data } });
                }

                return res.json({ success: true, data: { reply: String(data) } });
            } catch (fetchErr) {
                console.error('Gemen fetch failed:', fetchErr && fetchErr.message ? fetchErr.message : fetchErr);
                // fall through to rule-based fallback
            }
        }

        // 3) Rule-based offline responder
        const text = String(message || '').toLowerCase();
        const nowReply = (() => {
            if (!text || text.trim().length === 0) return "Hi — I'm the assistant. Ask about jobs, applying, or your profile.";
            if (/^\s*(hi|hello|hey)\b/.test(text)) return 'Hello! I can help with jobs, applying, and profile tips. Try: "How do I apply for a job?"';
            if (/how (do|to) (i )?apply/.test(text)) return 'To apply: open View Jobs, choose a job, click Apply Now. Ensure your profile is complete.';
            if (/profile|complete profile/.test(text)) return 'Complete your profile by filling required fields and clicking Save Profile.';
            if (/thank|thanks/.test(text)) return "You\'re welcome!";
            if (/contact|provider|email/.test(text)) return 'When selected, notification will include provider contact (email).' ;
            return `I received your message: "${String(message).slice(0,200)}". I can answer job-portal questions or use an AI provider if configured.`;
        })();

        return res.json({ success: true, data: { reply: nowReply } });

    } catch (err) {
        console.error('Chat proxy error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));