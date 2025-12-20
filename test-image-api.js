const https = require('https');
const fs = require('fs');

const data = JSON.stringify({
    contents: [
        {
            role: "user",
            parts: [
                {
                    text: "A modern villa with a swimming pool at sunset, 3d render style"
                }
            ]
        }
    ]
});

const options = {
    hostname: 'yunwu.ai',
    port: 443,
    path: '/v1beta/models/gemini-2.5-flash-image:generateContent',
    method: 'POST',
    headers: {
        'Authorization': 'Bearer sk-JrZjjnwnrtkLV8i3v8K2TSV9CLTpmHqx0twPjDIjyGYfBuYO',
        'Content-Type': 'application/json',
        'Content-Length': data.length
    },
    timeout: 30000
};

console.log('Testing Image API at https://yunwu.ai/v1beta/models/gemini-2.5-flash-image:generateContent...');

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let result = '';
    res.on('data', (chunk) => {
        result += chunk;
    });

    res.on('end', () => {
        try {
            const parsed = JSON.parse(result);
            console.log('Response Structure:', Object.keys(parsed));
            if (parsed.candidates && parsed.candidates[0].content && parsed.candidates[0].content.parts) {
                const parts = parsed.candidates[0].content.parts;
                console.log(`Found ${parts.length} parts in response`);
                parts.forEach((part, index) => {
                    console.log(`Part ${index} keys:`, Object.keys(part));
                    if (part.inline_data) {
                        console.log(`Part ${index} contains image data (mime: ${part.inline_data.mime_type})`);
                        const buffer = Buffer.from(part.inline_data.data, 'base64');
                        const filename = `test_generated_image_${index}.png`;
                        fs.writeFileSync(filename, buffer);
                        console.log(`Saved image to ${filename}`);
                    } else if (part.file_data) {
                        console.log(`Part ${index} contains file data:`, part.file_data);
                    } else if (part.text) {
                        console.log(`Part ${index} contains text: ${part.text}`);
                    } else {
                        console.log(`Part ${index} has unknown format:`, JSON.stringify(part));
                    }
                });
            } else {
                console.log('No parts found in candidates. Raw Response:', result);
            }
        } catch (e) {
            console.log('Error parsing JSON or saving file:', e.message);
            console.log('Raw Result:', result);
        }
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.on('timeout', () => {
    console.error('Timeout occurred');
    req.destroy();
});

req.write(data);
req.end();
