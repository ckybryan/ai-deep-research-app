import * as dotenv from 'dotenv';

// Load environment variables FIRST, before any other imports
dotenv.config({ override: true });

import express from 'express';
import { ResearchManager } from './researchManager';
import * as path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Serve HTML interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Deep Research AI</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
                line-height: 1.6;
            }
            
            .container {
                max-width: 900px;
                margin: 0 auto;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .header {
                background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                padding: 40px;
                text-align: center;
                color: white;
            }
            
            .header h1 {
                font-size: 2.5rem;
                font-weight: 700;
                margin-bottom: 10px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .header p {
                font-size: 1.1rem;
                opacity: 0.9;
                font-weight: 300;
            }
            
            .main-content {
                padding: 40px;
            }
            
            .form-section {
                margin-bottom: 30px;
            }
            
            .form-group {
                margin-bottom: 25px;
            }
            
            label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #374151;
                font-size: 0.95rem;
            }
            
            .input-wrapper {
                position: relative;
            }
            
            input[type="text"] {
                width: 100%;
                padding: 16px 20px;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                font-size: 16px;
                transition: all 0.3s ease;
                background: #fafafa;
                font-family: inherit;
            }
            
            input[type="text"]:focus {
                outline: none;
                border-color: #4f46e5;
                background: white;
                box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                transform: translateY(-1px);
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                color: white;
                padding: 16px 32px;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .btn-primary:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
            }
            
            .btn-primary:disabled {
                background: #9ca3af;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            .spinner {
                width: 20px;
                height: 20px;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .results-section {
                margin-top: 30px;
                display: none;
            }
            
            .results-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #e5e7eb;
            }
            
            .results-header h3 {
                color: #374151;
                font-weight: 600;
                font-size: 1.2rem;
            }
            
            .status-indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #10b981;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            #report {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 25px;
                min-height: 200px;
                font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
                font-size: 14px;
                line-height: 1.6;
                color: #334155;
                white-space: pre-wrap;
                overflow-y: auto;
                max-height: 500px;
                position: relative;
            }
            
            .report-content {
                animation: fadeIn 0.5s ease-in;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .footer {
                background: #f8fafc;
                padding: 20px 40px;
                text-align: center;
                color: #64748b;
                font-size: 0.9rem;
                border-top: 1px solid #e2e8f0;
            }
            
            .feature-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            
            .feature-card {
                background: rgba(255, 255, 255, 0.5);
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                border: 1px solid rgba(255, 255, 255, 0.3);
            }
            
            .feature-icon {
                font-size: 2rem;
                margin-bottom: 10px;
                color: #4f46e5;
            }
            
            .feature-title {
                font-weight: 600;
                margin-bottom: 5px;
                color: #374151;
            }
            
            .feature-desc {
                font-size: 0.9rem;
                color: #6b7280;
            }
            
            @media (max-width: 768px) {
                body {
                    padding: 10px;
                }
                
                .header {
                    padding: 30px 20px;
                }
                
                .header h1 {
                    font-size: 2rem;
                }
                
                .main-content {
                    padding: 30px 20px;
                }
                
                .feature-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1><i class="fas fa-brain"></i> Deep Research AI</h1>
                <p>Comprehensive AI-powered research assistant</p>
            </div>
            
            <div class="main-content">
                <div class="feature-grid">
                    <div class="feature-card">
                        <div class="feature-icon"><i class="fas fa-search"></i></div>
                        <div class="feature-title">Intelligent Search</div>
                        <div class="feature-desc">Multi-query web research</div>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon"><i class="fas fa-file-alt"></i></div>
                        <div class="feature-title">Detailed Reports</div>
                        <div class="feature-desc">Comprehensive analysis</div>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon"><i class="fas fa-envelope"></i></div>
                        <div class="feature-title">Email Delivery</div>
                        <div class="feature-desc">Automated report sharing</div>
                    </div>
                </div>
                
                <div class="form-section">
                    <form id="researchForm">
                        <div class="form-group">
                            <label for="query">
                                <i class="fas fa-question-circle"></i> What would you like to research?
                            </label>
                            <div class="input-wrapper">
                                <input 
                                    type="text" 
                                    id="query" 
                                    name="query" 
                                    placeholder="Enter your research topic (e.g., 'Latest developments in AI technology')" 
                                    required
                                >
                            </div>
                        </div>
                        <button type="submit" id="runButton" class="btn-primary">
                            <i class="fas fa-rocket"></i>
                            <span class="btn-text">Start Research</span>
                            <div class="spinner" style="display: none;"></div>
                        </button>
                    </form>
                </div>
                
                <div class="results-section" id="resultsSection">
                    <div class="results-header">
                        <div class="status-indicator"></div>
                        <h3><i class="fas fa-chart-line"></i> Research Progress</h3>
                    </div>
                    <div id="report" class="report-content"></div>
                </div>
            </div>
            
            <div class="footer">
                <p>Powered by OpenAI GPT-4 • Built with TypeScript & Express</p>
            </div>
        </div>

        <script>
            const form = document.getElementById('researchForm');
            const reportDiv = document.getElementById('report');
            const runButton = document.getElementById('runButton');
            const resultsSection = document.getElementById('resultsSection');
            const btnText = runButton.querySelector('.btn-text');
            const spinner = runButton.querySelector('.spinner');
            const icon = runButton.querySelector('.fas');

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const query = document.getElementById('query').value;
                
                // Update button state
                runButton.disabled = true;
                btnText.textContent = 'Researching...';
                spinner.style.display = 'block';
                icon.style.display = 'none';
                
                // Show results section
                resultsSection.style.display = 'block';
                reportDiv.innerHTML = '<div class="loading-message"><i class="fas fa-cog fa-spin"></i> Initializing research...</div>';
                
                // Scroll to results
                resultsSection.scrollIntoView({ behavior: 'smooth' });

                try {
                    const response = await fetch('/research', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ query }),
                    });

                    if (!response.ok) {
                        throw new Error('Research request failed');
                    }

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let result = '';

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        
                        const chunk = decoder.decode(value);
                        result += chunk;
                        reportDiv.innerHTML = result;
                        reportDiv.scrollTop = reportDiv.scrollHeight;
                    }
                    
                    // Add completion indicator
                    if (result) {
                        const completionMsg = '\\n\\n✅ Research completed successfully!';
                        reportDiv.innerHTML = result + completionMsg;
                    }
                    
                } catch (error) {
                    reportDiv.innerHTML = \`
                        <div style="color: #ef4444; padding: 20px; text-align: center;">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>Error:</strong> \${error.message}
                            <br><small>Please check your API configuration and try again.</small>
                        </div>
                    \`;
                } finally {
                    // Reset button state
                    runButton.disabled = false;
                    btnText.textContent = 'Start New Research';
                    spinner.style.display = 'none';
                    icon.style.display = 'inline';
                    icon.className = 'fas fa-redo';
                }
            });
            
            // Add some interactivity
            document.getElementById('query').addEventListener('input', function(e) {
                const value = e.target.value;
                if (value.length > 3) {
                    e.target.style.borderColor = '#10b981';
                } else {
                    e.target.style.borderColor = '#e5e7eb';
                }
            });
        </script>
    </body>
    </html>
  `);
});

// Research endpoint
app.post('/research', async (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');

  try {
    const manager = new ResearchManager();
    for await (const chunk of manager.run(query)) {
      res.write(chunk + '\n\n');
    }
    res.end();
  } catch (error) {
    console.error('Research error:', error);
    res.write('Error: ' + (error as Error).message);
    res.end();
  }
});

app.listen(port, () => {
  console.log(`Deep Research app listening at http://localhost:${port}`);
});
