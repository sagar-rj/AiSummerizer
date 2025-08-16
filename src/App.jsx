import React, { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import { marked } from 'marked';

// Configure marked to add <br> on single line breaks
marked.setOptions({
  breaks: true,
});


// Define the server URL
const API_URL = `${import.meta.env.VITE_API_URL}/api`

function App() {
    const apiKey = import.meta.env.VITE_TINY_MCE_API_KEY;
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
        <div className="min-h-screen bg-gray-100 text-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-6 md-p-8">
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
                    AI Meeting Notes Summarizer 📝
                </h1>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label htmlFor="transcript-upload" className="block text-sm font-medium text-gray-700 mb-2">1. Upload Transcript (.txt file)</label>
                        <input id="transcript-upload" type="file" accept=".txt" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
                    <div>
                        <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700 mb-2">2. Enter Custom Instruction</label>
                        <textarea id="custom-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows="3" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="e.g., Highlight only action items"/>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <button onClick={handleGenerateSummary} disabled={isLoading} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
                        {isLoading ? 'Generating...' : '✨ Generate Summary'}
                    </button>
                </div>

                {summary && (
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                             <h2 className="text-xl font-semibold">3. Edit Your Summary</h2>
                             <button onClick={handleCopy} className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${ copyButtonText === 'Copied!' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300' }`}>
                                {copyButtonText}
                             </button>
                        </div>
                        
                        <Editor
                            apiKey={apiKey}
                            value={summary}
                            onEditorChange={(newValue, editor) => setSummary(newValue)}
                            init={{
                                height: 350,
                                menubar: false,
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
                         <h2 className="text-xl font-semibold mb-2">4. Share via Email</h2>
                         <div className="flex flex-col sm:flex-row gap-4">
                             <input type="email" value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder="Enter recipient emails, comma-separated" className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"/>
                            <button onClick={handleShare} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">
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