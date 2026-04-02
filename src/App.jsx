import React, { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import { marked } from 'marked';

// Configure marked to add <br> on single line breaks
marked.setOptions({
  breaks: true,
});


// Define the server URL
const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}`;

function App() {
    const apiKey = import.meta.env.VITE_TINY_MCE_API_KEY;
    
    // Initialize dark mode from localStorage or system preference
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const [transcript, setTranscript] = useState('');
    const [prompt, setPrompt] = useState('Summarize in bullet points for executives.');
    const [summary, setSummary] = useState('');
    const [recipients, setRecipients] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [shareStatus, setShareStatus] = useState('');
    const [copyButtonText, setCopyButtonText] = useState('Copy');
    
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setTranscript(e.target.result);
            };
            reader.readAsText(file);
        }
    };

    const handleGenerateSummary = async () => {
        if (!transcript) {
            setError('Please upload a transcript file first.');
            return;
        }
        setError('');
        setIsLoading(true);
        setSummary('');
        setCopyButtonText('Copy');

        try {
            const response = await axios.post(`${API_URL}/api/summarize`, {
                transcript,
                prompt,
            });

            const plainTextSummary = response.data.summary;
            const formattedHtmlSummary = marked(plainTextSummary);
            setSummary(formattedHtmlSummary);
            
        } catch (err) {
            setError('Failed to generate summary. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = summary;
        const textToCopy = tempDiv.textContent || tempDiv.innerText || "";

        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopyButtonText('Copied!');
            setTimeout(() => {
                setCopyButtonText('Copy');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };

    const handleShare = async () => {
        if (!summary || !recipients) {
            setShareStatus('Please generate a summary and enter recipient emails.');
            return;
        }
        setShareStatus('Sending...');
        
        const recipientList = recipients.split(',').map(email => email.trim());

        try {
            const response = await axios.post(`${API_URL}/api/share`, {
                summary,
                recipients: recipientList,
            });
            setShareStatus(response.data.message);
        } catch (err)
        {
            setShareStatus('Failed to send email.');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex items-center justify-center p-2 sm:p-6 transition-colors duration-300">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 md:p-8 transition-colors duration-300">
                <div className="flex flex-col-reverse sm:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left text-gray-900 dark:text-white">
                        AI Meeting Notes Summarizer 📝
                    </h1>
                    <button 
                        onClick={() => setIsDarkMode(!isDarkMode)} 
                        className="text-2xl hover:scale-110 transition-transform cursor-pointer self-end sm:self-auto"
                        title="Toggle Dark Mode"
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                </div>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label htmlFor="transcript-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">1. Upload Transcript (.txt file)</label>
                        <input id="transcript-upload" type="file" accept=".txt" onChange={handleFileChange} className="block w-full text-sm text-gray-500 dark:text-gray-400 cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-200 hover:file:bg-blue-100 dark:hover:file:bg-blue-800"/>
                    </div>
                    <div>
                        <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">2. Enter Custom Instruction</label>
                        <textarea id="custom-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows="3" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500" placeholder="e.g., Highlight only action items"/>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <button onClick={handleGenerateSummary} disabled={isLoading} className="cursor-pointer bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors disabled:cursor-not-allowed">
                        {isLoading ? 'Generating...' : '✨ Generate Summary'}
                    </button>
                </div>

                {summary && (
                    <div className="mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-2 gap-2">
                             <h2 className="text-xl font-semibold dark:text-gray-100">3. Edit Your Summary</h2>
                             <button onClick={handleCopy} className={`cursor-pointer px-4 py-1 text-sm font-semibold rounded-md transition-colors w-full sm:w-auto ${ copyButtonText === 'Copied!' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600' }`}>
                                {copyButtonText}
                             </button>
                        </div>
                        
                        <Editor
                            key={isDarkMode ? 'dark' : 'light'}
                            apiKey={apiKey}
                            value={summary}
                            onEditorChange={(newValue, editor) => setSummary(newValue)}
                            init={{
                                width: '100%',
                                height: 350,
                                menubar: false,
                                skin: isDarkMode ? 'oxide-dark' : 'oxide',
                                content_css: isDarkMode ? 'dark' : 'default',
                                // --- NEW: Added more plugins for functionality ---
                                plugins: [
                                    'lists', 'link', 'autolink', 'wordcount', 'preview'
                                ],
                                // --- NEW: Expanded the toolbar with more controls ---
                                toolbar: 'undo redo | blocks | ' +
                                'bold italic underline strikethrough | forecolor backcolor | ' +
                                'alignleft aligncenter alignright alignjustify | ' +
                                'bullist numlist | link | removeformat | preview',
                                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                            }}
                        />
                    </div>
                )}
                
                {summary && (
                    <div>
                         <h2 className="text-xl font-semibold mb-2 dark:text-gray-100">4. Share via Email</h2>
                         <div className="flex flex-col sm:flex-row gap-4">
                             <input type="email" value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder="Enter recipient emails, comma-separated" className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"/>
                            <button onClick={handleShare} className="cursor-pointer bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">
                                Send Email ✉️
                            </button>
                         </div>
                         {shareStatus && <p className="text-center mt-3 text-sm">{shareStatus}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;