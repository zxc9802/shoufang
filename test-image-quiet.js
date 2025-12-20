const https = require('https');
const fs = require('fs');

const data = JSON.stringify({
    contents: [
        {
            role: "user",
            parts: [
                {
                    text: "A modern minimalist living room, 3d render style, high quality"
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
    timeout: 60000
};

console.log('Testing Image API...');

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let result = '';
    res.on('data', (chunk) => {
        result += chunk;
    });

    res.on('end', () => {
        try {
            const parsed = JSON.parse(result);
            if (parsed.candidates && parsed.candidates[0].content && parsed.candidates[0].content.parts) {
                const parts = parsed.candidates[0].content.parts;
                parts.forEach((part, index) => {
                    if (part.inline_data) {
                        console.log(`Part ${index}: Image Data Found (${part.inline_data.mime_type})`);
                        const buffer = Buffer.from(part.inline_data.data, 'base64');
                        const filename = `test_out_${Date.now()}_${index}.png`;
                        fs.writeFileSync(filename, buffer);
                        console.log(`---SUCCESS--- File Saved: ${filename}`);
                    } else if (part.text) {
                        console.log(`Part ${index}: Text Found`);
                    }
                });
            } else {
                console.log('No parts found.');
            }
        } catch (e) {
            console.log('Error:', e.message);
        }
    });
});

req.on('error', (e) => console.error('Req error:', e));
req.write(data);
req.end();
