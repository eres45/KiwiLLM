// Uptime Tracking System for KiwiLLM Models
// This script should be run periodically (e.g., every 5 minutes via cron or Cloud Scheduler)

const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// Models to track
const MODELS_TO_TRACK = [
    'deepseek-v3',
    'deepseek-r1',
    'grok-4',
    'qwen2.5-72b-chat',
    'qwen-coder-plus',
    'gpt-oss-120b'
];

// Function to check if a model is available
async function checkModelAvailability(modelId) {
    try {
        // Make a simple test request to the model
        // This is a placeholder - you would implement actual model checking logic
        // For now, we'll simulate a check
        const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3000'}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.INTERNAL_CHECK_KEY || 'test-key'}`
            },
            body: JSON.stringify({
                model: modelId,
                messages: [{ role: 'user', content: 'ping' }],
                max_tokens: 5
            }),
            timeout: 10000 // 10 second timeout
        });

        return response.ok;
    } catch (error) {
        console.error(`Error checking ${modelId}:`, error.message);
        return false;
    }
}

// Function to update uptime stats in Firestore
async function updateUptimeStats(modelId, isAvailable) {
    const uptimeRef = db.collection('modelUptime').doc(modelId);

    try {
        const doc = await uptimeRef.get();

        if (!doc.exists) {
            // Initialize document
            await uptimeRef.set({
                modelId: modelId,
                totalChecks: 1,
                successfulChecks: isAvailable ? 1 : 0,
                lastChecked: admin.firestore.FieldValue.serverTimestamp(),
                lastStatus: isAvailable ? 'online' : 'offline',
                uptimePercentage: isAvailable ? 100 : 0
            });
        } else {
            // Update existing document
            const data = doc.data();
            const newTotalChecks = data.totalChecks + 1;
            const newSuccessfulChecks = data.successfulChecks + (isAvailable ? 1 : 0);
            const uptimePercentage = (newSuccessfulChecks / newTotalChecks) * 100;

            await uptimeRef.update({
                totalChecks: newTotalChecks,
                successfulChecks: newSuccessfulChecks,
                lastChecked: admin.firestore.FieldValue.serverTimestamp(),
                lastStatus: isAvailable ? 'online' : 'offline',
                uptimePercentage: uptimePercentage
            });
        }

        console.log(`Updated uptime for ${modelId}: ${isAvailable ? 'online' : 'offline'}`);
    } catch (error) {
        console.error(`Error updating uptime for ${modelId}:`, error);
    }
}

// Main function to run uptime checks
async function runUptimeChecks() {
    console.log('Starting uptime checks...');

    for (const modelId of MODELS_TO_TRACK) {
        const isAvailable = await checkModelAvailability(modelId);
        await updateUptimeStats(modelId, isAvailable);
    }

    console.log('Uptime checks completed');
}

// Export for use in Cloud Functions or as a standalone script
module.exports = { runUptimeChecks, checkModelAvailability, updateUptimeStats };

// If run directly
if (require.main === module) {
    runUptimeChecks()
        .then(() => {
            console.log('Done');
            process.exit(0);
        })
        .catch(error => {
            console.error('Error:', error);
            process.exit(1);
        });
}
