# AI Meeting Notes Summarizer 📝

This is the frontend for the AI Meeting Notes Summarizer application. It provides a clean, user-friendly interface for uploading transcripts, generating AI-powered summaries, editing the content with a rich-text editor, and sharing the final notes via email.

## ✨ Features

* **File Upload**: A simple interface to upload `.txt` meeting transcripts.
* **Custom Prompts**: An input field to provide custom instructions to the AI model.
* **Rich-Text Editing**: A full-featured **TinyMCE** editor to format the summary with headings, bold, italics, lists, colors, and links.
* **Markdown-to-HTML Conversion**: Automatically converts the AI's Markdown-formatted response into clean HTML for the editor.
* **Copy & Share**: One-click functionality to copy the summary text or send it directly to recipients via email.
* **User Feedback**: Clear loading states and status messages for a smooth user experience.
* **Responsive Design**: A clean layout that works on both desktop and mobile devices.

## 🛠️ Technology Stack

* **Framework**: **React** (using **Vite** for a fast and modern development environment).
* **Styling**: **Tailwind CSS** for a utility-first approach to building a clean and maintainable UI.
* **HTTP Client**: **Axios** for handling asynchronous API requests to the backend.
* **Text Editor**: **@tinymce/tinymce-react** for a powerful and intuitive WYSIWYG editing experience.
* **Markdown Parser**: **`marked`** to seamlessly convert the AI's text output into formatted HTML.

## 🚀 Local Setup Instructions

1.  **Navigate to the client directory**:
    ```bash
    cd AiSummerizer
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Create an environment file**: Create a `.env` file in the `root` directory of the project.
4.  **Add the Tinymce Api Key**: 
    ```env
    VITE_TINY_MCE_API_KEY=" "
    ```

5.  **For backend**: The complete source code, along with detailed setup and deployment instructions, is available at the following GitHub repository:
    ```
    https://github.com/sagar-rj/Ai-Summarizer-Api
    ```
6.  **Start the development server**:
    ```bash
    npm run dev
    ```
    The application will open in your browser, typically at `http://localhost:5173`.

## ☁️ Deployment

The frontend is deployed on **Vercel**, which provides a seamless CI/CD pipeline connected to the project's GitHub repository.

* **Environment Variables**: The `VITE_API_URL` variable must be set in the Vercel project settings to point to the live URL of the deployed backend (e.g., `https://your-backend-name.onrender.com`).
* **TinyMCE Configuration**: For the TinyMCE editor to function correctly in production, the live domain (e.g., `your-frontend-name.vercel.app`) must be added to the "Approved Domains" list in the TinyMCE Customer Portal.

## Approach and Process

The frontend was developed with a focus on functionality and user experience.

1.  **Initial Scaffolding**: The project was set up using Vite for its speed and modern tooling. A single `App.jsx` component was used to manage the application's state and UI for simplicity.
2.  **Core UI Implementation**: The initial UI included the file input, prompt textarea, and buttons. State management was handled with React's `useState` hook.
3.  **Editor Evolution**: The summary display began as a simple `<textarea>`. It was then upgraded to a rich-text editor using TinyMCE to provide a much better editing experience. This required integrating the `@tinymce/tinymce-react` package and configuring its toolbar.
4.  **Handling AI Output**: A key challenge was displaying the AI's formatted response correctly. The AI generates Markdown, but TinyMCE requires HTML. The `marked` library was introduced to solve this by converting the Markdown response into HTML on the fly before rendering it in the editor.
5.  **API Integration**: Axios was used to create services for communicating with the backend's `/api/summarize` and `/api/share` endpoints, with clear error handling and loading states to inform the user.
